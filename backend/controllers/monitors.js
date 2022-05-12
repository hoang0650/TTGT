// const  fs = require('fs');
// const  path = require('path');

// const  getFile = (absPath, cb) => {
// 	const  filePath = path.join(__dirname, `../${absPath}`);
// 	fs.readFile(filePath, { encoding: 'utf-8' }, (err, data) => { cb(err, data); });
// };
const  Monitor = require('../models/monitor');
const  MonitorStation = require('../models/monitor.station');
const  MonitorTemplate = require('../models/monitor.template');
const  _ = require('lodash');


//Api Template
function getTemplates(req, res){
    MonitorTemplate.find({ status: { $ne: 'deleted' } }).exec().then(tps => res.status(200).send(tps.reverse()), err => res.status(500).send(err));
};

function createTemplate(req, res){
    const  template = new MonitorTemplate(req.body);
    template.save().then(tp => res.status(200).send(tp), err => res.status(500).send(err));
};

function updateTemplate(req, res){
    const  template = new MonitorTemplate(req.body);
    template.status = 'updated';
    template.update(template).then(() => res.status(200).send(template), err => res.status(500).send(err));
};

function deleteTemplate (req, res){
    const  template = req.model;
    template.status = 'deleted';
    template.update(template).then(() => res.status(200).send(template), err => res.status(500).send(err));
};


//Api Station
function getStations(req, res) {
    MonitorStation.find({ status: { $ne: 'deleted' } }).exec().then(sts => res.status(200).send(sts.reverse()), err => res.status(500).send(err));
};

function createStation (req, res){
    const  station = new MonitorStation(req.body);
    station.save().then(st => res.status(200).send(st), err => res.status(500).send(err));
};

function updateStation (req, res){
    const  station = new MonitorStation(req.body);
    station.status = 'updated';
    station.update(station).then(() => res.status(200).send(station), err => res.status(500).send(err));
};

function deleteStation(req, res){
    const  station = req.model;
    station.status = 'deleted';
    station.update(station).then(() => res.status(200).send(station), err => res.status(500).send(err));
};

//Api Monitor
function create (req, res){
    const  monitor = new Monitor(req.body);
    monitor.createdAt = new Date();
    monitor.save().then(mnt => {
        res.status(200).send(mnt);
    }, err => {
        res.status(500).send(err);
    });
};

function findAll (req, res){
    Monitor.find({ status: { $ne: 'deleted' } }).sort('-createdAt').exec().then(mnt => res.status(200).send(mnt), err => res.status(500).send(err));
};


function findById(req, res){
    Monitor.findOne({ _id: req.params.id, status: { $nin: ['done', 'deleted'] } }).exec().then(mnt => res.status(200).send(mnt), err => res.status(500).send(err));
};

function update (req, res){
    const  monitor = req.model;

    function customizer(oldValue, newValue, key) {
        switch (key) {
            case 'versions':
                return oldValue;
            default:
                return (newValue) ? newValue : oldValue;
        }
    }
    _.extendWith(monitor._doc, req.body, customizer);
    monitor.status = 'updated';
    monitor.update(monitor).then(mnt => { res.status(200).send(mnt); }, err => res.status(500).send(err));
};

function done(req, res) {
    const  monitor = req.model;

    function customizer(oldValue, newValue, key) {
        switch (key) {
            case 'versions':
                return oldValue;
            default:
                return (newValue) ? newValue : oldValue;
        }
    }
    _.extendWith(monitor._doc, req.body, customizer);
    monitor.status = 'done';
    monitor.update(monitor).then(mnt => { res.status(200).send(mnt); }, err => res.status(500).send(err));
};

function remove (req, res) {
    const  monitor = req.model;
    monitor.status = 'deleted';
    monitor.save((err, p) => (err) && res.status(500).end() || res.status(200).send(p));
};

function pickLatest (req, res){
    Monitor.findOne({
        isLatest: true
    }).exec().then(oldMnt => {
        if (oldMnt) {
            oldMnt.isLatest = false;
            oldMnt.update(oldMnt).then(() => {});
        }
        const  monitor = req.model;
        monitor.isLatest = true;
        monitor.update(monitor).then(mnt => { res.status(200).send(mnt); }, err => res.status(500).send(err));
    }, err => res.status(500).send(err));

};

module.exports = {
    //Api Template
    getTemplates,createTemplate,updateTemplate,deleteTemplate,
    //Api Station
    getStations,createStation,updateStation,deleteStation,
    //Api Monitor
    create,findAll,findById,update,done,remove,pickLatest
}