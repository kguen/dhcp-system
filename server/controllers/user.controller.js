const ldapjs = require('ldapjs');
const { User, Organization, sequelize } = require('../models');
const ldapConfig = require('../config/ldapConfig');
const { passwordRegex } = require('../constants');

const index = (req, res) => {
  User.findAll({
    include: [
      {
        model: Organization,
        as: 'organization',
        attributes: ['id', 'fullName'],
      },
    ],
  })
    .then(result => {
      res.status(200).json(result);
    })
    .catch(errors => {
      res.status(500).json({
        message: 'Something went wrong!',
        errors,
      });
    });
};

const create = (req, res) => {
  const ldapClient = ldapjs.createClient(ldapConfig.clientOptions);
  const user = {
    username: req.body?.username,
    fullName: req.body?.fullName,
    position: req.body?.position,
    email: req.body?.email,
    phone: req.body?.phone,
    isAdmin: req.body?.isAdmin,
    note: req.body?.note,
    organizationId: req.body?.organizationId,
  };
  const ldapUser = {
    uid: req.body?.username,
    cn: req.body?.fullName,
    sn: req.body?.fullName.split(' ')[0],
    userPassword: req.body?.password,
    objectClass: ['person', 'organizationalPerson', 'inetOrgPerson'],
  };
  // test password strength
  if (!passwordRegex.test(req.body?.password)) {
    res.status(403).json({
      message: 'Password not strong enough!',
    });
  } else {
    // bind to LDAP using credentials in dotenv
    ldapClient.bind(
      ldapConfig.pwdUser,
      ldapConfig.pwdPassword,
      async ldapBindErr => {
        if (ldapBindErr) {
          res.status(500).json({
            message: 'Something went wrong!',
            error: ldapBindErr,
          });
        } else {
          const transaction = await sequelize.transaction();
          // create new LDAP user
          User.create(user, { transaction })
            .then(async result => {
              ldapClient.add(
                `uid=${req.body?.username},ou=users,ou=system`,
                ldapUser,
                async ldapCreateErr => {
                  if (ldapCreateErr) {
                    // roll back transaction (LDAP error)
                    await transaction.rollback();
                    res.status(500).json({
                      message: 'Something went wrong!',
                      error: ldapCreateErr,
                    });
                  } else {
                    // commit transaction
                    await transaction.commit();
                    res.status(201).json({
                      message: 'Created user successfully!',
                      user: result,
                    });
                  }
                }
              );
            })
            .catch(async errors => {
              // roll back transaction (SQL error)
              await transaction.rollback();
              res.status(500).json({
                message: 'Something went wrong!',
                errors,
              });
            });
        }
      }
    );
  }
};

const update = (req, res) => {
  const ldapClient = ldapjs.createClient(ldapConfig.clientOptions);
  const { id } = req.params;
  const user = {
    fullName: req.body?.fullName,
    position: req.body?.position,
    email: req.body?.email,
    phone: req.body?.phone,
    isAdmin: req.body?.isAdmin,
    note: req.body?.note,
    organizationId: req.body?.organizationId,
  };
  ldapClient.bind(
    ldapConfig.pwdUser,
    ldapConfig.pwdPassword,
    async ldapBindErr => {
      if (ldapBindErr) {
        res.status(500).json({
          message: 'Something went wrong!',
          error: ldapBindErr,
        });
      } else {
        const transaction = await sequelize.transaction();
        User.update(user, { where: { id }, transaction })
          .then(async () => {
            const userToUpdate = await User.findByPk(id);

            if (!userToUpdate) {
              await transaction.rollback();
              res.status(404).json({
                message: 'User not found!',
              });
            } else {
              const ldapChange = {
                operation: 'replace',
                modification: {},
              };
              if (req.body?.fullName) {
                ldapChange.modification = {
                  cn: req.body?.fullName,
                  sn: req.body?.fullName.split(' ')[0],
                };
              }
              ldapClient.modify(
                `uid=${userToUpdate.username},ou=users,ou=system`,
                ldapChange,
                async ldapChangeErr => {
                  if (ldapChangeErr) {
                    // roll back transaction (LDAP error)
                    await transaction.rollback();
                    res.status(500).json({
                      message: 'Something went wrong!',
                      error: ldapChangeErr,
                    });
                  } else {
                    // commit transaction
                    await transaction.commit();

                    const updatedUser = await User.findByPk(id);
                    res.status(200).json({
                      message: 'User updated successfully!',
                      user: updatedUser,
                    });
                  }
                }
              );
            }
          })
          .catch(async errors => {
            // roll back transaction (SQL error)
            await transaction.rollback();
            res.status(500).json({
              message: 'Something went wrong!',
              errors,
            });
          });
      }
    }
  );
};

const destroy = (req, res) => {
  const ldapClient = ldapjs.createClient(ldapConfig.clientOptions);
  const { id } = req.params;

  ldapClient.bind(
    ldapConfig.pwdUser,
    ldapConfig.pwdPassword,
    async ldapBindErr => {
      if (ldapBindErr) {
        res.status(500).json({
          message: 'Something went wrong!',
          error: ldapBindErr,
        });
      } else {
        const transaction = await sequelize.transaction();
        const userToDelete = await User.findByPk(id);

        User.destroy({ where: { id }, transaction })
          .then(async colCount => {
            if (!colCount) {
              await transaction.rollback();
              res.status(404).json({
                message: 'User not found!',
              });
            } else {
              ldapClient.del(
                `uid=${userToDelete.username},ou=users,ou=system`,
                async ldapDelErr => {
                  if (ldapDelErr) {
                    // roll back transaction (LDAP error)
                    await transaction.rollback();
                    res.status(500).json({
                      message: 'Something went wrong!',
                      error: ldapDelErr,
                    });
                  } else {
                    // commit transaction
                    await transaction.commit();
                    res.status(200).json({
                      message: 'User deleted successfully!',
                    });
                  }
                }
              );
            }
          })
          .catch(async errors => {
            // roll back transaction (SQL error)
            await transaction.rollback();
            res.status(500).json({
              message: 'Something went wrong!',
              errors,
            });
          });
      }
    }
  );
};

module.exports = {
  index,
  create,
  update,
  destroy,
};
