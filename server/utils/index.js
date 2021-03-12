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

module.exports = { getPagination, getPagingData };
