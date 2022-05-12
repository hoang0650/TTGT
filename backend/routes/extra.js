const express = require('express');
const router = express.Router();
// const mongoose = require('mongoose');
// const Cam = mongoose.model('Camera');

const {findAll,update} = require('../controllers/extras.js');

// router.post('/', Camera.create);
// router.put('/:id', Camera.update);
router.get('/', findAll);
router.put('/:id', update);
// router.get('/sortbyroute', Camera.sortByRoute);
// router.get('/sortbylocation', Camera.sortByLocation);
// router.delete('/', Parking.delete);

// router.param('id', function (req, res, next, id) {
//     Cam.load(id, function (id, cam) {
//         req.body.cam = cam;
//         next();
//     });
// });

module.exports = router;