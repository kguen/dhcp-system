const express = require('express');
const { isAuthenticated, isAdmin } = require('../middlewares');
const {
  index,
  list,
  create,
  update,
  destroy,
} = require('../controllers/organization.controller');

const router = express.Router();

router.use(isAuthenticated);
router.get('/list', list);

router.use(isAdmin);

// Admin routes
router.get('/', index);
router.post('/', create);
router.patch('/:id', update);
router.delete('/:id', destroy);

module.exports = router;
