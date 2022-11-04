const router = require('express').Router();

const groupController = require('../controllers/groupController');

router.post('/', groupController.createGroup);
router.get('/', groupController.getGroup);
router.patch('/:groupId', groupController.editGroup);
router.delete('/:groupId', groupController.deleteGroup);

module.exports = router;
