const ldapjs = require('ldapjs');
const jwt = require('jsonwebtoken');
const fs = require('fs');
const path = require('path');
const ldapConfig = require('../config/ldapConfig');
const { User, Avatar, sequelize } = require('../models');
const { userWithBase64Avatar } = require('../utils');

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
          include: [
            {
              model: Avatar,
              as: 'avatar',
              attributes: ['type', 'data'],
            },
          ],
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
          user: userWithBase64Avatar(user),
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
        model: Avatar,
        as: 'avatar',
        attributes: ['type', 'data'],
      },
    ],
  })
    .then(result => {
      res.status(200).json(userWithBase64Avatar(result));
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
  const avatar = req.files.find(file => file.fieldname === 'avatar');
  const user = {
    fullName: req.body?.fullName,
    position: req.body.position === 'null' ? null : req.body?.position,
    email: req.body.email === 'null' ? null : req.body?.email,
    phone: req.body.phone === 'null' ? null : req.body?.phone,
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
              try {
                if (avatar) {
                  await Avatar.upsert(
                    {
                      userId: id,
                      type: avatar.mimetype,
                      name: avatar.originalname,
                      data: fs.readFileSync(
                        path.join(
                          __dirname,
                          '../',
                          '/static/uploads/',
                          avatar.filename
                        )
                      ),
                    },
                    { where: { userId: id }, transaction }
                  );
                }
                const commit = async () => {
                  // commit transaction
                  await transaction.commit();
                  const updatedUser = await User.findByPk(id, {
                    include: [
                      {
                        model: Avatar,
                        as: 'avatar',
                        attributes: ['type', 'data'],
                      },
                    ],
                  });
                  res.status(200).json({
                    message: 'User updated successfully!',
                    user: userWithBase64Avatar(updatedUser),
                  });
                };
                if (req.body?.fullName) {
                  ldapClient.modify(
                    `uid=${userToUpdate.username},ou=users,ou=system`,
                    {
                      operation: 'replace',
                      modification: {
                        cn: req.body.fullName,
                        sn: req.body.fullName.split(' ')[0],
                      },
                    },
                    async ldapChangeErr => {
                      if (ldapChangeErr) {
                        // roll back transaction (LDAP error)
                        await transaction.rollback();
                        res.status(500).json({
                          message: 'Something went wrong!',
                          error: ldapChangeErr,
                        });
                      } else {
                        await commit();
                      }
                    }
                  );
                } else {
                  await commit();
                }
              } catch (errors) {
                // roll back transaction (SQL error)
                await transaction.rollback();
                res.status(500).json({
                  message: 'Something went wrong!',
                  errors,
                });
              }
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

const password = async (req, res) => {
  const ldapClient = ldapjs.createClient(ldapConfig.clientOptions);
  const { username } = await User.findByPk(req.user.id);

  ldapClient.bind(
    `uid=${username},ou=users,ou=system`,
    req.body?.oldPassword,
    async ldapBindErr => {
      if (ldapBindErr) {
        res.status(401).json({
          message: 'Invalid credentials!',
        });
      } else {
        ldapClient.modify(
          `uid=${username},ou=users,ou=system`,
          {
            operation: 'replace',
            modification: {
              userPassword: req.body.newPassword,
            },
          },
          async ldapChangeErr => {
            if (ldapChangeErr) {
              if (ldapChangeErr.lde_message.includes('reuse of password')) {
                res.status(403).json({
                  message: 'Reuse of old password is not allowed!',
                });
              } else {
                res.status(500).json({
                  message: 'Something went wrong!',
                  error: ldapChangeErr,
                });
              }
            } else {
              res.status(200).json({
                message: 'Password updated successfully!',
              });
            }
          }
        );
      }
    }
  );
};

module.exports = {
  login,
  me,
  update,
  password,
};
