const express = require('express');
const {
  index,
  create,
  show,
  update,
  destroy,
} = require('../controllers/user.controller');

const router = express.Router();

router.get('/', index);
router.post('/', create);
router.get('/:id', show);
router.patch('/:id', update);
router.delete('/:id', destroy);

module.exports = router;
