const express = require('express');
const router = express.Router();
const {getUsers,getUser,blockUser,unblockUser,changeToQuest,changeToUser,changeToAdmin} = require('../controllers/admin');

router.get('/', getUsers);
router.get('/:id', getUser);
router.post('/:id/block', blockUser);
router.post('/:id/unblock',unblockUser);
router.post('/:id/guest',changeToQuest);
router.post('/:id/user',changeToUser);
router.post('/:id/admin',changeToAdmin);

module.exports = router;