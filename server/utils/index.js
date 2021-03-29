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
    mask: block.mask,
    firstIP: long2ip(ip2long(block.first) + 1),
    lastIP: block.last,
    gateway: block.first,
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

module.exports = {
  getPagination,
  getPagingData,
  getSubnetData,
  getNewIpFromUserId,
};
