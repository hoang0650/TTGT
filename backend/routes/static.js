const express = require('express');
const router = express.Router();
const {getCameras,getHdCameras,getTthCameras,getTthNewCameras} = require('../controllers/static.js');

/* GET home page. */
router.get('/', function(req, res) {
  res.json({cameras: 'cameras.json'});
});

router.get('/cameras.json', getCameras);
router.get('/hd_cameras.json', getHdCameras);
router.get('/tth_cameras.json', getTthCameras);
router.get('/tth_new_cameras.json', getTthNewCameras);


module.exports = router;