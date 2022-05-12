const  express = require('express');
const  router = express.Router();
const  FeedbackType = require('../models/feedback.type');
const  {create,update,findAll,findById} = require('../controllers/feedback.type.js');

router.post('/', create);
router.put('/:id', update);
router.get('/', findAll);
router.get('/:id', findById);



router.param('id', function (req, res, next, id) {
    FeedbackType.load(id, function (id, fbt) {
        req.fbType = fbt;
        next();
    });
});

module.exports = router;