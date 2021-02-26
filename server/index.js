const express = require('express');
const bodyParser = require('body-parser');
const usersRoute = require('./routes/users');
const orgsRoute = require('./routes/organizations');

const app = express();
const router = express.Router();
const PORT = 3000;

router.use('/users', usersRoute);
router.use('/orgs', orgsRoute);

app.use(bodyParser.json());
app.use('/api', router);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
