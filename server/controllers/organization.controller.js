const { Organization } = require('../models');

const index = (req, res) => {
  Organization.findAll()
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
  const organization = {
    abbreviation: req.body?.abbreviation,
    fullName: req.body?.fullName,
    phone: req.body?.phone,
    address: req.body?.address,
    note: req.body?.note,
  };
  Organization.create(organization)
    .then(result => {
      res.status(201).json({
        message: 'Created organization successfully!',
        organization: result,
      });
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
  const organization = {
    abbreviation: req.body?.abbreviation,
    fullName: req.body?.fullName,
    phone: req.body?.phone,
    address: req.body?.address,
    note: req.body?.note,
  };
  Organization.update(organization, { where: { id } })
    .then(async () => {
      const updatedOrg = await Organization.findByPk(id);

      if (!updatedOrg) {
        res.status(404).json({
          message: 'Organization not found!',
        });
      } else {
        res.status(200).json({
          message: 'Organization updated successfully!',
          organization: updatedOrg,
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

  Organization.destroy({ where: { id } })
    .then(colCount => {
      if (!colCount) {
        res.status(404).json({
          message: 'Organization not found!',
        });
      } else {
        res.status(200).json({
          message: 'Organization deleted successfully!',
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
  update,
  destroy,
};
