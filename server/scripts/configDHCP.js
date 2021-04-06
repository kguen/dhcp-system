const { createBaseConfig, updateSubnetConfig } = require('../utils');

(async () => {
  try {
    await Promise.all([createBaseConfig(), updateSubnetConfig()]);
    // eslint-disable-next-line no-console
    console.log('Updated configuration files for dhcpd.');
  } catch (err) {
    // eslint-disable-next-line no-console
    console.log(err);
  } finally {
    // eslint-disable-next-line no-process-exit
    process.exit(0);
  }
})();
