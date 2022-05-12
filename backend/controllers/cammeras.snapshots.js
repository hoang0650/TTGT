const {Camera} = require('../models/camera');
const Client = require('node-rest-client').Client;
const config = require('../config/configure');
const client = new Client();
const args = {
	requesConfig: { timeout: 1000 },
	responseConfig: { timeout: 2000 }
};
function getResponseTime(req, res) {
    const query = { publish: true };
    Camera.find(query).exec((err, cameras) => {

        if (err) {
            return res.status(500).end();
        } else {

            const requestAgent = client.get(config.camerahost + '/api/snapshot/responsetime', args, function (data, response) {
                if (response.statusCode === 200) {
                    
                    const listCamera = [];
                    cameras = JSON.parse(JSON.stringify(cameras));
                    cameras.forEach(function (camera) {
                        data.forEach(function (cameraStatus) {
                            if (camera.id === cameraStatus.id) {
                                camera.status = cameraStatus.status;
                            }
                        }, this);
                        listCamera.push(camera);
                    }, this);
                    return res.status(200).json(listCamera);
                } else {
                    return res.status(500).end();
                }
            });
            requestAgent.on('error', function () {
                return res.status(500).end();
            });
        }
    });

};

function getSnapShot(req, res) {
    if (!req.body.cam) {
        return res.status(404).end();
    }
    else {
        if (!req.body.cam.publish && req.user.app_metadata.roles.indexOf('admin') === -1) {
            return res.status(401).end();
        } else {
            const requestAgent = client.get(config.camerahost + '/api/snapshot/' + req.body.cam.id, function (data, response) {
                if (response.statusCode === 200) {
                    res.writeHead(200, { 'Content-Type': response.headers['content-type'] });
                    res.end(data);
                } else {
                    return res.status(res.statusCode).end();
                }
            });
            requestAgent.on('error', function () {
                return res.status(500).end();
            });
        }
    }
};

function getSnapShotObject(req, res) {
    if (!req.body.cam) {
        return res.status(404).end();
    }
    else {
        if (!req.body.cam.publish && req.user.app_metadata.roles.indexOf('admin') === -1) {
            return res.status(401).end();
        } else {
            const requestAgent = client.get(config.camerahost + '/api/snapshot/' + req.body.cam.id + '/json', function (data, response) {
                if (response.statusCode === 200) {
                    const camera = JSON.parse(JSON.stringify(req.body.cam));
                    res.status(200).json(Object.assign(camera, data));
                } else {
                    return res.status(res.statusCode).end();
                }
            });
            requestAgent.on('error', function () {
                return res.status(500).end();
            });
        }
    }
};

function previewCamera (req, res) {
    const cam = new Camera(req.body);
    const url = cam.snapshotUrl;
    if (url) {
        if (url.startsWith('//')) {
            url = 'https:' + url;
        }

        const requestAgent = client.get(url, function (data, response) {
            if (response.statusCode === 200 && data) {
                const buffer = { data: data.toString('base64') };
                res.status(200).json(buffer);
            } else {
                return res.status(res.statusCode).end();
            }
        });
        requestAgent.on('error', function () {
            return res.status(500).end();
        });
    } else {
        return res.status(404).end();
    }


};

module.exports = {
    getResponseTime,getSnapShot,getSnapShotObject,previewCamera
}
