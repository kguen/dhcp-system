const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const cron = require('node-cron');
const storage = require('node-persist');
const usersRoute = require('./routes/users');
const orgsRoute = require('./routes/organizations');
const subnetRoute = require('./routes/subnet');
const deviceRoute = require('./routes/device');
const authRoute = require('./routes/auth');
const { restartDHCPService } = require('./utils');

const app = express();
const router = express.Router();
const port = process.env.PORT || 3030;

router.use('/users', usersRoute);
router.use('/orgs', orgsRoute);
router.use('/subnets', subnetRoute);
router.use('/devices', deviceRoute);
router.use('/auth', authRoute);

app.use(morgan('dev'));
app.use(cors());
app.use(express.json());

app.use('/api', router);

// initialize persistent storage
(async () => {
  await storage.init({ dir: './persist' });
  await storage.setItem('restartDHCP', false);
})();

// run cron job to restart DHCP server every 30 minutes
cron.schedule('*/30 * * * *', () => restartDHCPService());

app.listen(port, () => {
  // eslint-disable-next-line no-console
  console.log(`Server is running on port ${port}`);
});
