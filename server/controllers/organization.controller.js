const fs = require('fs');
const storage = require('node-persist');
const {
  getPagination,
  getPagingData,
  updateSubnetConfig,
  updateFirewallScript,
} = require('../utils');
const {
  Organization,
  Subnet,
  User,
  Device,
  sequelize,
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
  Organization.findAll({
    attributes: ['id', 'abbreviation', 'fullName'],
    ...(req.query?.hasSubnet === 'true' && {
      where: { id: { [Op.ne]: null } },
      include: [
        {
          model: Subnet,
          as: 'subnet',
          attributes: ['id'],
          where: { id: { [Op.ne]: null } },
        },
      ],
    }),
  })
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

const destroy = async (req, res) => {
  const { id } = req.params;
  const transaction = await sequelize.transaction();

  Organization.destroy({ where: { id }, transaction })
    .then(async colCount => {
      if (!colCount) {
        // roll back transaction (SQL error)
        await transaction.rollback();
        res.status(404).json({
          message: 'Organization not found!',
        });
      } else {
        try {
          const devicesToDelete = await Device.findAll({
            attributes: ['id'],
            include: [
              {
                model: User,
                as: 'user',
                where: { organizationId: id },
              },
            ],
          });
          const subnetToDelete = await Subnet.findOne({
            attributes: ['vlan'],
            where: { organizationId: id },
          });
          await Promise.all(
            devicesToDelete.map(device =>
              Device.destroy({ where: { id: device.id }, transaction })
            )
          );
          await transaction.commit();
          await Promise.all([
            // update subnet config and firewall script after commit
            updateSubnetConfig(id),
            updateFirewallScript(),
          ]);
          // move old subnet hosts to archive
          if (subnetToDelete) {
            fs.renameSync(
              `${process.env.DHCP_CONFIG_PATH}/hosts/hosts-${subnetToDelete.vlan}`,
              `${process.env.DHCP_CONFIG_PATH}/hosts/hosts-${subnetToDelete.vlan}.old`
            );
          }
          // update persistent flag
          await storage.setItem('restartDHCP', true);
          res.status(200).json({
            message: 'Organization deleted successfully!',
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

module.exports = {
  index,
  list,
  create,
  update,
  destroy,
};
