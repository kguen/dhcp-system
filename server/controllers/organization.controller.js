const { getPagination, getPagingData } = require('../utils');
const {
  Organization,
  Sequelize: { Op },
} = require('../models');

const index = (req, res) => {
  const { page, size, abbreviation, fullName } = req.query;
  const { limit, offset } = getPagination(page, size);
  const condition = {};

  if (abbreviation) condition.abbreviation = { [Op.like]: `%${abbreviation}%` };
  if (fullName) condition.fullName = { [Op.like]: `%${fullName}%` };

  Organization.findAndCountAll({ where: condition, limit, offset })
    .then(data => {
      const response = getPagingData(data, page, limit);
      res.status(200).send(response);
    })
    .catch(errors => {
      res.status(500).json({
        message: 'Something went wrong!',
        errors,
      });
    });
};

const list = (req, res) => {
  Organization.findAll({ attributes: ['id', 'fullName'] })
    .then(data => {
      res.status(200).send(data);
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
        result,
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
      const result = await Organization.findByPk(id);

      if (!result) {
        res.status(404).json({
          message: 'Organization not found!',
        });
      } else {
        res.status(200).json({
          message: 'Organization updated successfully!',
          result,
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
  list,
  create,
  update,
  destroy,
};
