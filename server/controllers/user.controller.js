const { User, Organization } = require('../models');

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
  User.create(user)
    .then(result => {
      res.status(201).json({
        message: 'Created user successfully!',
        user: result,
      });
    })
    .catch(errors => {
      res.status(500).json({
        message: 'Something went wrong!',
        errors,
      });
    });
};

const show = (req, res) => {
  const { id } = req.params;

  User.findByPk(id, {
    include: [
      {
        model: Organization,
        as: 'organization',
        attributes: ['id', 'fullName'],
      },
    ],
  })
    .then(result => {
      if (!result) {
        res.status(404).json({
          message: 'User not found!',
        });
      } else {
        res.status(200).json(result);
      }
    })
    .catch(errors => {
      res.status(500).json({
        message: 'Something went wrong!',
        errors,
      });
    });
};

const update = (req, res) => {
  const { id } = req.params;
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
  User.update(user, { where: { id } })
    .then(async () => {
      const updatedUser = await User.findByPk(id);

      if (!updatedUser) {
        res.status(404).json({
          message: 'User not found!',
        });
      } else {
        res.status(200).json({
          message: 'User updated successfully!',
          user: updatedUser,
        });
      }
    })
    .catch(errors => {
      res.status(500).json({
        message: 'Something went wrong!',
        errors,
      });
    });
};

const destroy = (req, res) => {
  const { id } = req.params;

  User.destroy({ where: { id } })
    .then(colCount => {
      if (!colCount) {
        res.status(404).json({
          message: 'User not found!',
        });
      } else {
        res.status(200).json({
          message: 'User deleted successfully!',
        });
      }
    })
    .catch(errors => {
      res.status(500).json({
        message: 'Something went wrong!',
        errors,
      });
    });
};

module.exports = {
  index,
  create,
  show,
  update,
  destroy,
};
