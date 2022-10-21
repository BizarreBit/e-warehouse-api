const router = require('express').Router();

const userController = require('../controllers/userController');

const upload = require('../middlewares/upload');

router.get('/me', userController.getMe);
router.patch('/', upload.single('profileImage'), userController.updateDetail);
router.patch('/image', upload.single('profileImage'), userController.updateImage);

module.exports = router;
