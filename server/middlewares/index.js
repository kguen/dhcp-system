const jwt = require('jsonwebtoken');
const multer = require('multer');
const path = require('path');
const { Device } = require('../models');
const { maxAvatarSize } = require('../constants');

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

const fileUploader = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, path.join(__dirname, '../static/uploads/'));
    },
    filename: (req, file, cb) => {
      cb(null, `${new Date().getTime()}-${file.originalname}`);
    },
  }),
  fileFilter: (req, file, cb) => {
    if (['image/jpeg', 'image/png'].includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Unsupported file type!'), false);
    }
  },
  limits: { fileSize: maxAvatarSize },
});

module.exports = {
  isAuthenticated,
  isAdmin,
  isOwnedDeviceOrAdmin,
  fileUploader,
};
