const Configuration = require('../models/configuration');

function create(req, res) {
    const config = new Configuration(req.body);
    config.createdAt = new Date();
    config.save().then(cf => {
        res.status(200).json(cf);
    }, err => res.status(500).send(err));
};

function findAll(req, res) {
    Configuration.find({}).exec().then(cfs => res.status(200).send(cfs), err => res.status(500).send(err));
};

function findById (req, res) {
    if (!req.configuration) {
        return res.status(404).end();
    }
    else {
        return res.status(200).json(req.configuration);
    }
};

function update(req, res) {
    const requestConfiguration = new Configuration(req.body);
    const config = req.configuration;
    if(requestConfiguration.frontendConfig) {
        config.frontendConfig = requestConfiguration.frontendConfig;
    }
    if(requestConfiguration.type) {
        config.type = requestConfiguration.type;
    }
    config.update(config).then(result => { res.status(200).json(result); }, err => res.status(500).send(err));
};

module.exports = {create,findAll,findById,update}