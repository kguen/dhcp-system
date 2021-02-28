const express = require('express');
const bodyParser = require('body-parser');
const usersRoute = require('./routes/users');
const orgsRoute = require('./routes/organizations');
const authRoute = require('./routes/auth');

const app = express();
const router = express.Router();
const port = process.env.PORT || 3000;

router.use('/users', usersRoute);
router.use('/orgs', orgsRoute);
router.use('/auth', authRoute);

app.use(bodyParser.json());
app.use('/api', router);

app.listen(port, () => {
  // eslint-disable-next-line no-console
  console.log(`Server is running on port ${port}`);
});
