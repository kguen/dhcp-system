const {
  getPagination,
  getPagingData,
  getNewIpFromUserId,
} = require('../utils');
const {
  Device,
  Organization,
  User,
  Sequelize: { Op },
} = require('../models');

const index = (req, res) => {
  const { page, size, type, userId, organizationId, enabled } = req.query;
  const { limit, offset } = getPagination(page, size);
  const condition = {};
  const userCondition = {};

  if (type) condition.type = { [Op.like]: `%${type}%` };
  if (enabled) condition.enabled = enabled === 'true';
  if (+userId) condition.userId = +userId;
  if (+organizationId) userCondition.organizationId = +organizationId;

  Device.findAndCountAll({
    limit,
    offset,
    where: condition,
    include: [
      {
        model: User,
        as: 'user',
        attributes: ['id', 'fullName'],
        where: userCondition,
        include: [
          {
            model: Organization,
            as: 'organization',
            attributes: ['id', 'fullName'],
          },
        ],
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

const create = async (req, res) => {
  const ipAddress = await getNewIpFromUserId(req.body?.userId);
  if (!ipAddress) {
    return res.status(500).json({
      message: 'The subnet that this user belongs to has run out of addresses!',
      type: 'AddressError',
    });
  }
  const device = {
    userId: req.body.userId,
    macAddress: req.body?.macAddress,
    type: req.body?.type,
    ipAddress,
  };
  Device.create(device)
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

const update = async (req, res) => {
  const { id } = req.params;
  const userId = req.body?.userId;

  // 1: check if device exists and get device info for 2
  const thisDevice = await Device.findByPk(id, {
    include: [{ model: User, as: 'user', attributes: ['organizationId'] }],
  });
  if (!thisDevice) {
    return res.status(404).json({
      message: 'Device not found!',
    });
  }
  // 2: generate new IP address if organization has been changed
  let ipAddress;
  if (
    thisDevice.user.organizationId !==
    (await User.findByPk(userId)).organizationId
  ) {
    ipAddress = await getNewIpFromUserId(req.body?.userId);
    if (!ipAddress) {
      return res.status(500).json({
        message:
          'The subnet that this user belongs to has run out of addresses!',
        type: 'AddressError',
      });
    }
  }
  // 3: create update object
  const deviceToUpdate = {
    userId,
    macAddress: req.body?.macAddress,
    type: req.body?.type,
    enabled: req.body?.enabled,
  };
  if (ipAddress) deviceToUpdate.ipAddress = ipAddress;

  Device.update(deviceToUpdate, { where: { id } })
    .then(async () => {
      const result = await Device.findByPk(id, {
        include: [
          {
            model: User,
            as: 'user',
            attributes: ['id', 'fullName'],
            include: [
              {
                model: Organization,
                as: 'organization',
                attributes: ['id', 'fullName'],
              },
            ],
          },
        ],
      });
      res.status(200).json({
        message: 'Device updated successfully!',
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

const destroy = (req, res) => {
  const { id } = req.params;

  Device.destroy({ where: { id } })
    .then(colCount => {
      if (!colCount) {
        res.status(404).json({
          message: 'Device not found!',
        });
      } else {
        res.status(200).json({
          message: 'Device deleted successfully!',
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
