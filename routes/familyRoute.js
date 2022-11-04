const router = require('express').Router();

const familyController = require('../controllers/familyController');

router.post('/', familyController.createFamily);
router.get('/', familyController.getFamily);
router.patch('/:familyId', familyController.editFamily);
router.delete('/:familyId', familyController.deleteFamily);

module.exports = router;
