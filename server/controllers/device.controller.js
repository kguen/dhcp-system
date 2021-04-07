const {
  getPagination,
  getPagingData,
  getNewIpFromUserId,
  updateHostConfig,
  updateFirewallScript,
} = require('../utils');
const {
  Device,
  Organization,
  User,
  Subnet,
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
    order: [
      ['user', 'organization', 'fullName', 'ASC'],
      ['user', 'fullName', 'ASC'],
    ],
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

const indexForUser = (req, res) => {
  const { page, size, type, enabled } = req.query;
  const { limit, offset } = getPagination(page, size);
  const condition = {};

  if (type) condition.type = { [Op.like]: `%${type}%` };
  if (enabled) condition.enabled = enabled === 'true';

  Device.findAndCountAll({
    limit,
    offset,
    where: condition,
    order: [['type', 'ASC']],
    include: [
      {
        model: User,
        as: 'user',
        attributes: ['id'],
        where: { id: req.user.id },
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
  const userId = req.user.isAdmin
    ? req.body.userId || req.user.id
    : req.user.id;
  const ipAddress = await getNewIpFromUserId(userId);

  if (!ipAddress) {
    return res.status(500).json({
      message:
        "The subnet that this user belongs to doesn't exists or has run out of addresses!",
      type: 'AddressError',
    });
  }
  const device = {
    userId,
    macAddress: req.body?.macAddress,
    type: req.body?.type,
    ipAddress,
  };
  Device.create(device)
    .then(async result => {
      try {
        const { subnet } = (
          await Device.findByPk(result.id, {
            attributes: ['id'],
            include: [
              {
                model: User,
                as: 'user',
                attributes: ['id'],
                include: [
                  {
                    model: Organization,
                    as: 'organization',
                    attributes: ['id'],
                    include: [
                      {
                        model: Subnet,
                        as: 'subnet',
                      },
                    ],
                  },
                ],
              },
            ],
          })
        ).user.organization;
        // update host config and firewall script
        await Promise.all([updateHostConfig(subnet), updateFirewallScript()]);
        res.status(201).json({
          message: 'Created device successfully!',
          result,
        });
      } catch (errors) {
        res.status(500).json({
          message: 'Something went wrong!',
          errors,
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

const update = async (req, res) => {
  const { id } = req.params;
  const userId = req.body?.userId; // required if user is admin
  let ipAddress;
  let oldSubnet;

  if (req.user.isAdmin && userId) {
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
    if (
      thisDevice.user.organizationId !==
      (await User.findByPk(userId, { attributes: ['organizationId'] }))
        .organizationId
    ) {
      // save old subnet for updating its host config
      oldSubnet = await Subnet.findOne({
        where: { organizationId: thisDevice.user.organizationId },
      });
      ipAddress = await getNewIpFromUserId(req.body?.userId);
      if (!ipAddress) {
        return res.status(500).json({
          message:
            "The subnet that this user belongs to doesn't exists or has run out of addresses!",
          type: 'AddressError',
        });
      }
    }
  }
  const deviceToUpdate = {
    userId: req.user.isAdmin ? userId || req.user.id : req.user.id,
    macAddress: req.body?.macAddress,
    type: req.body?.type,
    enabled: req.body?.enabled,
  };
  if (ipAddress) deviceToUpdate.ipAddress = ipAddress;

  Device.update(deviceToUpdate, { where: { id } })
    .then(async () => {
      try {
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
                  include: [
                    {
                      model: Subnet,
                      as: 'subnet',
                    },
                  ],
                },
              ],
            },
          ],
        });
        await Promise.all([
          // if subnet changed -> update host config for old subnet
          ...(oldSubnet ? [updateHostConfig(oldSubnet)] : []),
          // update firewall script (if device's ip or status changed - TODO?)
          updateFirewallScript(),
          // update host config for device's current subnet
          updateHostConfig(result.user.organization.subnet),
        ]);
        res.status(200).json({
          message: 'Device updated successfully!',
          result,
        });
      } catch (errors) {
        res.status(500).json({
          message: 'Something went wrong!',
          errors,
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

const destroy = async (req, res) => {
  const { id } = req.params;
  const { subnet } = (
    await Device.findByPk(id, {
      attributes: ['id'],
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id'],
          include: [
            {
              model: Organization,
              as: 'organization',
              attributes: ['id'],
              include: [
                {
                  model: Subnet,
                  as: 'subnet',
                },
              ],
            },
          ],
        },
      ],
    })
  ).user.organization;
  Device.destroy({ where: { id } })
    .then(async colCount => {
      if (!colCount) {
        res.status(404).json({
          message: 'Device not found!',
        });
      } else {
        // update host config and firewall script
        await Promise.all([updateHostConfig(subnet), updateFirewallScript()]);
        try {
          res.status(200).json({
            message: 'Device deleted successfully!',
          });
        } catch (errors) {
          res.status(500).json({
            message: 'Something went wrong!',
            errors,
          });
        }
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
  indexForUser,
  create,
  update,
  destroy,
};
