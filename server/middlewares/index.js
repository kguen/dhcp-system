const jwt = require('jsonwebtoken');
const { Device } = require('../models');

const isAuthenticated = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(401).json({
        message: 'Invalid token!',
      });
    }
    req.user = user;
    next();
  });
};

const isAdmin = (req, res, next) => {
  if (req.user.isAdmin) {
    next();
  } else {
    res.status(401).json({
      message: 'Unauthorized request!',
    });
  }
};

const isOwnedDeviceOrAdmin = async (req, res, next) => {
  if (req.user.isAdmin) {
    next();
  } else if (
    !(await Device.findOne({
      where: { id: req.params.id, userId: req.user.id },
    }))
  ) {
    res.status(404).json({
      message: 'Device not found!',
    });
  } else {
    next();
  }
};

module.exports = {
  isAuthenticated,
  isAdmin,
  isOwnedDeviceOrAdmin,
};
