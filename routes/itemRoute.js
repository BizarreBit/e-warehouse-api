const router = require('express').Router();

const upload = require('../middlewares/upload')
const itemController = require('../controllers/itemController');

router.post('/', upload.single('image'), itemController.createItem);
router.get('/', itemController.getItem);
router.patch('/:itemId', upload.single('image'), itemController.editItem);
router.delete('/:itemId', itemController.deleteItem);

module.exports = router;
