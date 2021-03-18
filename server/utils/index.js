const { Netmask, ip2long, long2ip } = require('netmask');

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

module.exports = { getPagination, getPagingData, getSubnetData };
