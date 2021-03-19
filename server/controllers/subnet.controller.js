const { v4 } = require('is-cidr');
const { getPagination, getPagingData, getSubnetData } = require('../utils');
const {
  Subnet,
  Organization,
  Sequelize: { Op },
} = require('../models');

const index = (req, res) => {
  const { page, size, vlan, fullName } = req.query;
  const { limit, offset } = getPagination(page, size);
  const condition = {};
  const orgCondition = {};

  if (vlan) condition.vlan = { [Op.like]: `%${vlan}%` };
  if (fullName) orgCondition.fullName = { [Op.like]: `%${fullName}%` };

  Subnet.findAndCountAll({
    limit,
    offset,
    where: condition,
    include: [
      {
        model: Organization,
        as: 'organization',
        attributes: ['id', 'fullName'],
        where: orgCondition,
      },
    ],
  })
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

const create = (req, res) => {
  if (!v4(req.body?.subnet)) {
    return res.status(500).json({
      message: 'Subnet address is not a valid CIDR IPv4 address!',
    });
  }
  const subnet = {
    organizationId: req.body?.organizationId,
    vlan: req.body?.vlan,
    ...getSubnetData(req.body.subnet),
  };
  Subnet.create(subnet)
    .then(result => {
      res.status(201).json({
        message: 'Created subnet successfully!',
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
  if (!v4(req.body?.subnet)) {
    return res.status(500).json({
      message: 'Subnet address is not a valid CIDR IPv4 address!',
    });
  }
  const { id } = req.params;
  const subnet = {
    organizationId: req.body?.organizationId,
    vlan: req.body?.vlan,
    ...getSubnetData(req.body.subnet),
  };
  Subnet.update(subnet, { where: { id } })
    .then(async () => {
      const result = await Subnet.findByPk(id, {
        include: [
          {
            model: Organization,
            as: 'organization',
            attributes: ['id', 'fullName'],
          },
        ],
      });
      if (!result) {
        res.status(404).json({
          message: 'Subnet not found!',
        });
      } else {
        res.status(200).json({
          message: 'Subnet updated successfully!',
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

  Subnet.destroy({ where: { id } })
    .then(colCount => {
      if (!colCount) {
        res.status(404).json({
          message: 'Subnet not found!',
        });
      } else {
        res.status(200).json({
          message: 'Subnet deleted successfully!',
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
