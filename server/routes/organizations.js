const express = require('express');
const {
  index,
  create,
  update,
  destroy,
} = require('../controllers/organization.controller');

const router = express.Router();

router.get('/', index);
router.post('/', create);
router.patch('/:id', update);
router.delete('/:id', destroy);

module.exports = router;
