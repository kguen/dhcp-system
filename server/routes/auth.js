const express = require('express');
const { login, me, update } = require('../controllers/auth.controller');
const { isAuthenticated, fileUploader } = require('../middlewares');

const router = express.Router();

router.post('/login', login);

router.use(isAuthenticated);

// Authenicated route
router.get('/me', me);
router.patch('/update', fileUploader.any(), update);

module.exports = router;
