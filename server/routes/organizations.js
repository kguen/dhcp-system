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
router.use(isAdmin);

router.get('/', index);
router.get('/list', list);
router.post('/', create);
router.patch('/:id', update);
router.delete('/:id', destroy);

module.exports = router;
