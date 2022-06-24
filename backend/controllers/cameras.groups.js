const _ = require('lodash');
const CameraGroup = require('../models/camera.group');
const {Camera} = require('../models/camera');
const q = require('q');

function pushGroupToCam(listCamId, cg) {
    const defer = q.defer();

    Camera.update(
        { _id: { $in: listCamId } },
        { $push: { groups: cg._id } },
        { multi: true },
        (err) => {
            if (!err) {
                defer.resolve();
            } else {
                defer.reject(err);
            }
        });

    return defer.promise;
}

function pullGroupOfCam(listCamId, cg) {
    const defer = q.defer();

    Camera.update(
        { _id: { $in: listCamId } },
        { $pull: { groups: { $in: [cg._id] } } },
        { multi: true },
        (err) => (err) && defer.reject(err) || defer.resolve());

    return defer.promise;
}

function pullGroupOfAllCam(camG, cb) {
    Camera.update(
        { groups: { $in: [camG._id] } },
        { $pull: { groups: { $in: [camG._id] } } },
        { multi: true },
        (err) => {
            if (err) {
                return cb(err);
            }

            return cb(null);
        });
}

function create(req, res) {
    if (!req.body.name) {
        return res.status(500).end();
    }
    const camGroup = new CameraGroup(req.body);
    camGroup.status = 'created';
    camGroup.save().then(cg => {
        pushGroupToCam(req.body.listCamId, cg).then(() => res.status(200).json(cg), err => res.status(500).send(err));
    }, err => res.status(500).send(err));
}

function findAll(req, res) {

    CameraGroup.find({
        status: { $ne: 'deleted' }
    }).exec()
    .then(data=>res.status(200).json({data})).catch(err=>res.status(500).json({err}));
}

function findById(req, res) {
    if (!req.camG) {
        return res.status(404).end();
    }

    return res.status(200).json(req.camG);

}

function update(req, res) {
    if (!req.body.name) {
        return res.status(500).end();
    }
    const requestCameraGroup = new CameraGroup(req.body);
    const camG = req.camG;

    Camera.find(
        {
            groups: { $in: [camG._id] }
        },
        {
            _id: 1
        }
    ).exec().then(camIds => {

        const cameraIds = req.body.listCamId;
        const idStr = camIds.map(function (camId) {
            return camId._id.toString();
        });

        const listCamIdAdd = _.difference(cameraIds, idStr);
        const listCamIdRemove = _.difference(idStr, cameraIds);

        const promises = [];
        promises.push(pullGroupOfCam(listCamIdRemove, camG));
        promises.push(pushGroupToCam(listCamIdAdd, camG));

        q.all(promises).then(() => {
            delete requestCameraGroup._id;
            if (requestCameraGroup.name) {
                camG.name = requestCameraGroup.name;
            }
            if (requestCameraGroup.description) {
                camG.description = requestCameraGroup.description;
            }
            camG.update(camG).then(cg => res.status(200).json(cg), err => res.status(500).send(err));
        }, err => res.status(500).send(err));
    }, err => res.status(500).send(err));
}

function deleteCamGroup(req, res) {
    if (!req.camG) {
        return res.status(404).end();
    }
    else {
        req.camG.status = 'deleted';
        pullGroupOfAllCam(req.camG, (err) => {
            if (err) {
                return res.status(500).send(err);
            }

            req.camG.save().then(() => res.status(200).end(), err => res.status(500).send(err));
        });
    }
}


module.exports={
    create,findAll,findById,update,deleteCamGroup,
    // pushGroupToCam,pullGroupOfCam,pullGroupOfAllCam
}
