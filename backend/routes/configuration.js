const express = require('express');
const router = express.Router();
const Configuration = require('../models/configuration');

const {create,update,findAll,findById} = require('../controllers/configuration.js');

router.post('/', create);
router.put('/:id', update);
router.get('/', findAll);
router.get('/:id', findById);



router.param('id', function (req, res, next, id) {
    Configuration.load(id, function (id, cf) {
        req.configuration = cf;
        next();
    });
});

module.exports = router;