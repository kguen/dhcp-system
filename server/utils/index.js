const fs = require('fs');
const path = require('path');
const dayjs = require('dayjs');
const storage = require('node-persist');
const localizedFormat = require('dayjs/plugin/localizedFormat');
const { exec } = require('child_process');
const { Netmask, ip2long, long2ip } = require('netmask');
const { Subnet, Device, User } = require('../models');

const getPagination = (page, size) => {
  const limit = size ? +size : 5;
  const offset = page ? page * limit : 0;
  return { limit, offset };
};

const getPagingData = (data, page, limit) => {
  const { count: recordCount, rows: records } = data;
  const currentPage = page ? +page : 0;
  const pageCount = Math.ceil(recordCount / limit);
  return { recordCount, records, pageCount, currentPage };
};

const getSubnetData = address => {
  const block = new Netmask(address);
  return {
    subnet: address,
    base: block.base,
    mask: block.mask,
    firstIP: long2ip(ip2long(block.first) + 1),
    lastIP: block.last,
    gateway: block.first,
    broadcast: block.broadcast,
  };
};

const getNewIpFromUserId = async userId => {
  const organizationId = (await User.findByPk(userId))?.organizationId;
  if (!organizationId) {
    return null;
  }
  const usedIPs = (
    await Device.findAll({
      attributes: ['ipAddress'],
      include: [
        {
          model: User,
          as: 'user',
          where: { organizationId },
        },
      ],
    })
  ).map(({ ipAddress }) => ip2long(ipAddress));
  const subnet = await Subnet.findOne({
    where: { organizationId },
  });
  if (!subnet) {
    return null;
  }
  // get next free IP address in subnet
  const longFirstIP = ip2long(subnet.firstIP);
  const longLastIP = ip2long(subnet.lastIP);
  for (let ip = longFirstIP; ip <= longLastIP; ip += 1) {
    if (!usedIPs.includes(ip)) {
      return long2ip(ip);
    }
  }
  // if no address found -> return null
  return null;
};

const userWithBase64Avatar = user => {
  const thisUser = user;
  if (user.avatar) {
    thisUser.avatar.data = user.avatar.data.toString('base64');
  }
  return thisUser;
};

const createBaseConfig = () =>
  fs.promises.copyFile(
    path.join(__dirname, '../static/templates/dhcpd.example'),
    `${process.env.DHCP_CONFIG_PATH}/dhcpd.conf`
  );

const updateHostConfig = async subnet => {
  const devices = await Device.findAll({
    where: {
      enabled: true,
    },
    include: [
      {
        model: User,
        as: 'user',
        attributes: ['id', 'fullName', 'username'],
        where: { organizationId: subnet.organizationId },
      },
    ],
  });
  const config = fs.readFileSync(
    path.join(__dirname, '../static/templates/host.example'),
    'utf-8'
  );
  return fs.promises.writeFile(
    `${process.env.DHCP_CONFIG_PATH}/hosts/hosts-${subnet.vlan}`,
    devices.reduce(
      (acc, device) =>
        `${
          acc +
          config
            .replace('*fullName*', device.user.fullName)
            .replace('*username*', device.user.username)
            .replace('*id*', device.id)
            .replace(/\*macAddress\*/g, device.macAddress)
            .replace('*ipAddress*', device.ipAddress)
        }\n`,
      ''
    )
  );
};

const updateSubnetConfig = async (updateId = null) => {
  const subnets = await Subnet.findAll();
  const updatedSubnet = await Subnet.findByPk(updateId);
  const config = fs.readFileSync(
    path.join(__dirname, '../static/templates/subnet.example'),
    'utf-8'
  );
  return Promise.all([
    ...(updatedSubnet
      ? [updateHostConfig(updatedSubnet)]
      : subnets.map(subnet => updateHostConfig(subnet))),
    fs.promises.writeFile(
      `${process.env.DHCP_CONFIG_PATH}/subnets`,
      subnets.reduce(
        (acc, subnet) =>
          `${
            acc +
            config
              .replace(/\*vlan\*/g, subnet.vlan)
              .replace('*subnet*', subnet.subnet)
              .replace('*base*', subnet.base)
              .replace(/\*mask\*/g, subnet.mask)
              .replace('*broadcast*', subnet.broadcast)
              .replace('*gateway*', subnet.gateway)
              .replace('*firstIP*', subnet.firstIP)
              .replace('*lastIP*', subnet.lastIP)
          }\n`,
        ''
      )
    ),
  ]);
};

const updateFirewallScript = async () => {
  const firewallConfig = fs.readFileSync(
    path.join(__dirname, '../static/templates/firewall.sh.example'),
    'utf-8'
  );
  const ipListConfig = (
    await Device.findAll({
      attributes: ['ipAddress'],
      where: { enabled: true },
    })
  ).reduce(
    (acc, device) =>
      `${acc}iptables -A proxy -s ${device.ipAddress} -m limit --limit 10/s -j ACCEPT\n`,
    '\n'
  );
  return fs.promises.writeFile(
    path.join(__dirname, '../scripts/firewall.sh'),
    firewallConfig + ipListConfig
  );
};

const restartDHCPService = async () => {
  const restart = await storage.getItem('restartDHCP');
  if (restart) {
    exec(
      // 'sudo systemctl restart dhcpd.service',
      'echo -n "Restart DHCP service..."',
      async (error, stdout, stderr) => {
        if (error) {
          // eslint-disable-next-line no-console
          console.log(`error: ${error.message}`);
          return;
        }
        if (stderr) {
          // eslint-disable-next-line no-console
          console.log(`stderr: ${stderr}`);
          return;
        }
        // eslint-disable-next-line no-console
        console.log(stdout);

        await Promise.all[
          (Device.update({ waiting: false }, { where: { waiting: true } }),
          storage.setItem('restartDHCP', false))
        ];
        dayjs.extend(localizedFormat);
        // eslint-disable-next-line no-console
        console.log(`DHCP service restarted: ${dayjs().format('llll')}`);
      }
    );
  }
};

module.exports = {
  getPagination,
  getPagingData,
  getSubnetData,
  getNewIpFromUserId,
  userWithBase64Avatar,
  createBaseConfig,
  updateSubnetConfig,
  updateHostConfig,
  updateFirewallScript,
  restartDHCPService,
};
