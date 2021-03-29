const express = require('express');
const {
  isAuthenticated,
  isAdmin,
  isOwnedDeviceOrAdmin,
} = require('../middlewares');
const {
  index,
  indexForUser,
  create,
  update,
  destroy,
} = require('../controllers/device.controller');

const router = express.Router();

router.use(isAuthenticated);

// Authenticated routes
router.get('/user', indexForUser);
router.post('/', create);

// Device owner routes
router.patch('/:id', isOwnedDeviceOrAdmin, update);
router.delete('/:id', isOwnedDeviceOrAdmin, destroy);

router.use(isAdmin);

// Admin routes
router.get('/', index);

module.exports = router;
