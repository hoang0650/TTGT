const express = require('express');
const router = express.Router();
const {findOneByUserId,addHistory,addFavorite} = require('../controllers/users');

/* GET users listing. */
router.get('/',findOneByUserId);
router.post('/addhistory', addHistory);
router.post('/addfavorite',addFavorite);

module.exports = router;