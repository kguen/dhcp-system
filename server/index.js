const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const usersRoute = require('./routes/users');
const orgsRoute = require('./routes/organizations');
const authRoute = require('./routes/auth');

const app = express();
const router = express.Router();
const port = process.env.PORT || 3030;

router.use('/users', usersRoute);
router.use('/orgs', orgsRoute);
router.use('/auth', authRoute);

app.use(morgan('dev'));
app.use(cors());
app.use(express.json());

app.use('/api', router);

app.listen(port, () => {
  // eslint-disable-next-line no-console
  console.log(`Server is running on port ${port}`);
});
