const _ = require('lodash');
const Department = require('../models/department');

function create(req, res) {
    const department = new Department(req.body);
    department.save().then(dpm => res.status(200).send(dpm), err => res.status(500).send(err));
};

function findAll(req, res) {
    Department.find({}).exec()
        .then(dpm => res.status(200).send(dpm), err => res.status(500).send(err));
};

function findById(req, res) {
    if (!req.dpm) {
        return res.status(404).end();
    }
    else {
        return res.status(200).json(req.dpm);
    }
};

function update(req, res) {
    const requestDepartment = new Department(req.body);
    const dpm = req.dpm;
    delete requestDepartment._id;
    _.extend(dpm, requestDepartment);
    dpm.update(dpm).then(dep => { res.status(200).json(dep);}, err => res.status(500).send(err));
};

module.exports = {
    create,findAll,findById,update
}
