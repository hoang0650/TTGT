const express = require('express');
const router = express.Router();
const Department = require('../models/department');

const {create,update,findAll,findById} = require('../controllers/department.js');

router.post('/', create);
router.put('/:id', update);
router.get('/', findAll);
router.get('/:id', findById);



router.param('id', function (req, res, next, id) {
    Department.load(id, function (id, dpm) {
        req.dpm = dpm;
        next();
    });
});

module.exports = router;