const express = require('express');
const router = express.Router();
const Comment = require('../models/comment');

const {create,update,getAllByCommentId,getAllByFeedbackId,
    getAllByDateToManage,findById,deleteComment} = require('../controllers/comment.js');

router.post('/', create);
router.put('/:id', update);
router.get('/:id/getallbycommentid', getAllByCommentId);
router.get('/:id/getallbyfeedbackid', getAllByFeedbackId);
router.get('/getallbydatetomanage', getAllByDateToManage);
router.get('/:id',findById);
router.delete('/:id', deleteComment);



router.param('id', function (req, res, next, id) {
    Comment.load(id, function (id, cm) {
        req.cm = cm;
        next();
    });
});

module.exports = router;