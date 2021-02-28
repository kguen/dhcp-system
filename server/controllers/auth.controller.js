const ldapjs = require('ldapjs');
const jwt = require('jsonwebtoken');
const { User, Organization, sequelize } = require('../models');
const ldapConfig = require('../config/ldapConfig');

const login = (req, res) => {
  const ldapClient = ldapjs.createClient(ldapConfig.clientOptions);

  ldapClient.bind(
    `uid=${req.body?.username},ou=users,ou=system`,
    req.body?.password,
    async ldapBindErr => {
      if (ldapBindErr) {
        res.status(401).json({
          message: 'Invalid credentials!',
        });
      } else {
        const user = await User.findOne({
          where: { username: req.body?.username },
        });
        const token = jwt.sign(
          {
            id: user.id,
            isAdmin: user.isAdmin,
          },
          process.env.JWT_SECRET
        );
        res.status(200).json({
          message: 'Login successful!',
          token,
        });
      }
    }
  );
};

const me = (req, res) => {
  User.findByPk(req.user.id, {
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

const update = (req, res) => {
  const ldapClient = ldapjs.createClient(ldapConfig.clientOptions);
  const { id } = req.user;
  const user = {
    fullName: req.body?.fullName,
    position: req.body?.position,
    email: req.body?.email,
    phone: req.body?.phone,
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

module.exports = {
  login,
  me,
  update,
};
