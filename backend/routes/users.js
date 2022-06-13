const express = require('express');
const router = express.Router();
const {findOneByUserId,addHistory,addFavorite,getUserInfo} = require('../controllers/users');

/* GET users listing. */
router.get('/',findOneByUserId);
router.post('/addhistory', addHistory);
router.post('/addfavorite',addFavorite);
router.get('/info', getUserInfo);

module.exports = router;