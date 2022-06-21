const express = require('express');
const router = express.Router();
const {getUsers,getUser,blockUser,unblockUser,changeToGuest,changeToUser,changeToAdmin} = require('../controllers/admin');
const {checkRoles,checkPermissions} = require('../controllers/permissions');
router.get('/',checkRoles(['admin']),checkPermissions(['settings:manage']), getUsers);
router.get('/:id', checkRoles(['admin']),checkPermissions(['settings:manage']), getUser);
router.post('/:id/block', checkRoles(['admin']),checkPermissions(['settings:manage']), blockUser);
router.post('/:id/unblock', checkRoles(['admin']),checkPermissions(['settings:manage']),unblockUser);
router.post('/:id/guest', checkRoles(['admin']),checkPermissions(['settings:manage']),changeToGuest);
router.post('/:id/user', checkRoles(['admin']),checkPermissions(['settings:manage']),changeToUser);
router.post('/:id/admin', checkRoles(['admin']),checkPermissions(['settings:manage']),changeToAdmin);


module.exports = router;