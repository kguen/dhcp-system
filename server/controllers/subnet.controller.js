const fs = require('fs');
const { v4 } = require('is-cidr');
const { ip2long, long2ip } = require('netmask');
const {
  getPagination,
  getPagingData,
  getSubnetData,
  updateSubnetConfig,
  updateFirewallScript,
} = require('../utils');
const {
  Subnet,
  Organization,
  Device,
  User,
  sequelize,
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
    .then(async result => {
      try {
        // update subnet config
        await updateSubnetConfig(result.id);
        res.status(201).json({
          message: 'Created subnet successfully!',
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
  if (!v4(req.body?.subnet)) {
    return res.status(500).json({
      message: 'Subnet address is not a valid CIDR IPv4 address!',
    });
  }
  const transaction = await sequelize.transaction();
  const { id } = req.params;
  const subnet = {
    organizationId: req.body?.organizationId,
    vlan: req.body?.vlan,
    ...getSubnetData(req.body.subnet),
  };
  Subnet.update(subnet, { where: { id }, transaction })
    .then(async () => {
      const subnetToUpdate = await Subnet.findByPk(id);
      if (!subnetToUpdate) {
        // roll back transaction (SQL error)
        await transaction.rollback();
        res.status(404).json({
          message: 'Subnet not found!',
        });
      } else {
        if (
          req.body?.subnet !== subnetToUpdate.subnet ||
          req.body?.organizationId !== subnetToUpdate.organizationId
        ) {
          const devices = await Device.findAll({
            attributes: ['id'],
            include: [
              {
                model: User,
                as: 'user',
                where: { organizationId: subnetToUpdate.organizationId },
              },
            ],
          });
          if (req.body?.organizationId !== subnetToUpdate.organizationId) {
            // change organization -> delete current devices
            try {
              await Promise.all(
                devices.map(device =>
                  Device.destroy({ where: { id: device.id }, transaction })
                )
              );
            } catch (errors) {
              return res.status(500).json({
                message: 'Something went wrong!',
                errors,
              });
            }
          }
          if (req.body?.subnet !== subnetToUpdate.subnet) {
            // change subnet address -> check subnet length -> update devices' ip
            if (
              devices.length >
              ip2long(subnet.lastIP) - ip2long(subnet.firstIP) + 1
            ) {
              return res.status(500).json({
                type: 'SubnetSizeError',
                message:
                  "New subnet doesn't have enough address for all of organization's devices!",
              });
            }
            let iterIP = ip2long(subnet.firstIP);
            try {
              await Promise.all(
                devices.map(device => {
                  const ipAddress = long2ip(iterIP);
                  iterIP += 1;
                  return Device.update(
                    { ipAddress },
                    { where: { id: device.id }, transaction }
                  );
                })
              );
            } catch (errors) {
              return res.status(500).json({
                message: 'Something went wrong!',
                errors,
              });
            }
          }
        }
        try {
          await transaction.commit();
          if (
            req.body?.subnet !== subnetToUpdate.subnet ||
            req.body?.organizationId !== subnetToUpdate.organizationId
          ) {
            // create new subnet config and update firewall script
            await Promise.all([updateSubnetConfig(id), updateFirewallScript()]);
            if (req.body?.organizationId !== subnetToUpdate.organizationId) {
              // change organization -> move subnet hosts to archive
              fs.renameSync(
                `/etc/dhcp/hosts/hosts-${subnetToUpdate.vlan}`,
                `/etc/dhcp/hosts/hosts-${subnetToUpdate.vlan}.old`
              );
            }
          }
          const result = await Subnet.findByPk(id, {
            include: [
              {
                model: Organization,
                as: 'organization',
                attributes: ['id', 'fullName'],
              },
            ],
          });
          res.status(200).json({
            message: 'Subnet updated successfully!',
            result,
          });
        } catch (errors) {
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
};

const destroy = async (req, res) => {
  const { id } = req.params;
  const subnetToDelete = await Subnet.findByPk(id, {
    attributes: ['vlan', 'organizationId'],
  });
  if (!subnetToDelete) {
    return res.status(404).json({
      message: 'Subnet not found!',
    });
  }
  const transaction = await sequelize.transaction();
  Subnet.destroy({ where: { id }, transaction })
    .then(async () => {
      try {
        const devices = await Device.findAll({
          attributes: ['id'],
          include: [
            {
              model: User,
              as: 'user',
              where: { organizationId: subnetToDelete.organizationId },
            },
          ],
        });
        await Promise.all(
          devices.map(device =>
            Device.destroy({ where: { id: device.id }, transaction })
          )
        );
        await transaction.commit();
        // update subnet config and firewall script after commit
        await Promise.all([updateSubnetConfig(id), updateFirewallScript()]);
        // move old subnet hosts to archive
        fs.renameSync(
          `/etc/dhcp/hosts/hosts-${subnetToDelete.vlan}`,
          `/etc/dhcp/hosts/hosts-${subnetToDelete.vlan}.old`
        );
        res.status(200).json({
          message: 'Subnet deleted successfully!',
        });
      } catch (errors) {
        res.status(500).json({
          message: 'Something went wrong!',
          errors,
        });
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
};

module.exports = {
  index,
  create,
  update,
  destroy,
};
