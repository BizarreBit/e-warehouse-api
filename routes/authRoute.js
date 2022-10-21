const router = require('express').Router();

const authController = require('../controllers/authController');
const authenticate = require("../middlewares/authenticate")

router.post('/signup', authController.signUp);
router.post('/signin', authController.signIn);
router.patch('/', authenticate, authController.changePassword)
router.patch('/id', authenticate, authController.changeEmail)

module.exports = router;
