const {
  createBaseConfig,
  updateSubnetConfig,
  updateFirewallScript,
} = require('../utils');

(async () => {
  try {
    await Promise.all([
      createBaseConfig(),
      updateSubnetConfig(),
      updateFirewallScript(),
    ]);
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
