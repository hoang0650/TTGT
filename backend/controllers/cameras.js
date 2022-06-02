const {Camera, CameraLink} = require('../models/camera');
const _ = require('lodash');
const {getBbox} = require('./util');
const config = require('../config/configure');
const FileSaver = require('file-saver');
const XLSX = require('xlsx');
const q = require('q');
const ManagementClient = require("auth0").ManagementClient;
const clientConfig = config.auth0ManagementClient;
const management = new ManagementClient({
  domain: clientConfig.domain,
  token: clientConfig.token,
  scope: 'read:users update:users delete:users create:users'
});

function processCameras(cameras) {
    const results = cameras;
    results = results.map((o) => {
        const geometry = o.loc;
        const properties = o;
        const feature = {
            type: 'Feature',
            properties,
            geometry
        };
        return feature;
    });

    const geoJson = {
        type: 'FeatureCollection',
        features: results
    };

    return geoJson;
}


function getDefaultCamera(req, res) {
    res.status(200).json(new Camera());
}

function setReferencesFromBody(camera, bodyRefs) {
    if (bodyRefs) {
        camera.references = bodyRefs.map(reference => (reference._id) && reference || new CameraLink(reference));
    }
}

function create(req, res) {
    if (req.body.angle === null) {
        delete req.body.angle;
    }
    const cam = new Camera(req.body);
    cam.references = req.body.references;
    setReferencesFromBody(cam, req.body.references);
    cam.groups = cam.groups || [];
    cam.save().then(cam => res.status(200).send(cam)).catch( err => res.status(500).json({err}));
    // cam.save().then((cam, err) => (cam) && res.status(200).send(cam) || res.status(500).send(err));
}

function deleteCamera(req, res) {
    const cam = req.body.cam;
    if (cam) {
        cam.status = 'deleted';
        cam.save((c) => (c) && res.status(200).send(c) || res.status(200).end());
    }
}

function update(req, res) {
    if (req.body.angle === null) {
        delete req.body.angle;
    }
    const requestCamera = new Camera(req.body);
    setReferencesFromBody(requestCamera, req.body.references);
    const cam = req.body.cam;
    delete requestCamera._id;
    _.extend(cam, requestCamera);
    cam.update(cam).then((result, err) => (err) && res.status(500).send(err) || res.status(200).send(result));

}

function findAll(req, res) {
    const isRoleCanView = true;
    config.roleCanViewUnpublish.forEach(()=>{
        if(req.user['https://hoang0650.com/app_metadata']<0){
            return isRoleCanView = false;
        }
    })
    const query = (isRoleCanView) ? { status: { $ne: 'deleted' } } : { publish: true, status: { $ne: 'deleted' } };
    Camera.find(query)
        .populate('groups')
        .exec((err, camera) => (err) && res.status(500).end() || res.status(200).json(camera));
}

function exportToCsv(req, res) {
    const query = { status: { $ne: 'deleted' } };
    const filename = 'ttgt_camera-giao-thong.csv';
    res.setHeader('Content-Disposition', `attachment; filename=${filename}`);
    res.setHeader('content-type', 'text/csv');
    Camera.findAndStreamCsv(query).pipe(res);    
};



function getAllCameraByType(req, res) {
    Camera.find({ type: req.params.type, status: { $ne: 'deleted' } })
        .populate('groups')
        .exec((err, cameras) => (err) && res.status(500).end() || res.status(200).json(processCameras(cameras)));
}

function findOneByCamId(req, res) {
    Camera.findOne({ id: req.params.camId, status: { $ne: 'deleted' } })
        .populate('groups')
        .exec((err, camera) => (err) && res.status(500).end() || res.status(200).json(camera));
}

function sortByLocation(req, res) {
    const sortLocationLng = req.params.lng || req.query.lng || req.body.lng;
    const sortLocationLat = req.params.lat || req.query.lat || req.body.lat;
    if (!sortLocationLng || !sortLocationLat) {
        return res.status(400).end();
    }

    Camera.find({
        loc: {
            $near: {
                $geometry: {
                    type: 'Point',
                    coordinates: [Number(sortLocationLng), Number(sortLocationLat)]
                },
                $maxDistance: 2000
            }
        },
        status: { $ne: 'deleted' },
        publish: true
    }).populate('groups').sort('loc').exec()
        .then((cam, err) => (cam) && res.status(200).send(cam) || res.status(500).send(err));
}



const getCamerasByBbox = (bbox) => Camera.find({
    loc: {
        $geoWithin: { $box: [[bbox[0], bbox[1]], [bbox[2], bbox[3]]] }
    },
    status: { $ne: 'deleted' },
    publish: true
}).exec();


const getCamerasByBboxType = (bbox, camType) => Camera.find({
    loc: {
        $geoWithin: { $box: [[bbox[0], bbox[1]], [bbox[2], bbox[3]]] }
    },
    status: { $ne: 'deleted' },
    type: camType
}).populate('groups').exec();

function getByTile(req, res) {
    const x = req.params.x;
    const y = req.params.y;
    const z = req.params.z;

    if (!x || !y || !z) {
        return res.status(404).end();
    }

    if (z < 16) {
        return res.status(406).end();
    }

    const bbox = getBbox(z, x, y);
    getCamerasByBbox(bbox).then((cameras) => (cameras) && res.status(200).json(processCameras(cameras)) || res.status(404).end());
}

function getByTileType(req, res) {
    const x = req.params.x;
    const y = req.params.y;
    const z = req.params.z;
    const type = req.params.type;

    if (!x || !y || !z) {
        return res.status(404).end();
    }

    const bbox = getBbox(z, x, y);
    getCamerasByBboxType(bbox, type)
        .then(cameras => (cameras) && res.status(200).json(processCameras(cameras)) || res.status(404).end());
}

function getByBbox(req, res) {
    const bbox = req.params.bbox;
    if (!bbox || bbox.split(',').length !== 4) {
        return res.status(404).end();
    }

    bbox = bbox.split(',');
    bbox = bbox.map(c => +c);

    if ((Math.abs(bbox[0] - bbox[2]) > config.rangeCoordinates) || (Math.abs(bbox[1] - bbox[3]) > config.rangeCoordinates)) {
        return res.status(406).end();
    }

    getCamerasByBbox(bbox).then(cameras => res.json(processCameras(cameras)), () => res.status(404).end());
}

function convertCameras() {
    const defer = q.defer();
    const camerasConverted = [];
    Camera.find({}).sort('id').exec((err, cameras) => {
        if (err) {
            defer.reject();
        } else {
            cameras.forEach(function (camera) {
                const cameraConverted = {
                    id: camera.id,
                    name: camera.name,
                    district: camera.dist,
                    description: camera.description,
                    lat: camera.loc.coordinates[1],
                    lng: camera.loc.coordinates[0],
                    type: camera.type
                };
                if (camera.publish) {
                    cameraConverted.publish = 'Được công bố';
                } else {
                    cameraConverted.publish = 'Không được công bố';
                }
                if (camera.values) {
                    cameraConverted.ip = camera.values.ip;
                    cameraConverted.channel = camera.values.channel;
                    cameraConverted.server = camera.values.server;
                    cameraConverted.camid = camera.values.camid;
                }
                for (const name in camera.values) {
                    cameraConverted[name] = camera.values[name];
                }
                camerasConverted.push(cameraConverted);
            }, this);
            defer.resolve(camerasConverted);
        }
    });
    return defer.promise;
}

// const json2xls = require('json2xls');
// const fs = require('fs');

function exportCameraData(req, res) {

    convertCameras().then((cameras) => {

        // const xls = json2xls(cameras);
        // fs.writeFileSync('cameraexport.xlsx', xls, 'binary');

        // res.writeHead(200, { 'Content-Type': response.headers['content-type'] });
        // res.status(200).end(xls);

        // const workbook = XLSX.readFile('camera.xlsx');
        // const firstSheet = workbook.SheetNames[0];
        // const worksheet = workbook.Sheets[firstSheet];
        // const cellStart = 'A1';
        // for (const cell in worksheet) {
        //     if (worksheet[cell].v === 'insert here') {
        //         cellStart = cell;
        //     }
        // }
        // const ws = XLSX.utils.json_to_sheet(cameras);
        // const wb = { Sheets:{'cameras': ws}, SheetNames:['cameras']};
        // const excelBuffer = XLSX.write(wb, {bookType:'xlsx',type:'array'});
        // saveExcelFile(excelBuffer,'cameras');
        res.status(200).end(ws);    

    }, () => res.status(500).end());

}

function saveExcelFile(buffer, fileName) {
    const data = new Blob([buffer], {type: this.fileType});
    fileType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8';
    fileExtension = '.xlsx';
    FileSaver.saveAs(data, fileName + this.fileExtension);
  }



function getCameraType (req, res) {res.status(200).json(config.cameraTypeList);}
function getCameraConfig(req, res) {res.status(200).json(config.cameraConfigList);} 
function findById (req, res) {
    req.body.cam && res.status(200).json(req.body.cam) || res.status(404).end();}

function all(req, res) {
    Camera.find().exec().then(cameras => (cameras) && res.json(processCameras(cameras) || res.status(404).end()));
};



module.exports = {
    getByBbox,getByTile,all,getDefaultCamera,exportCameraData,
    getCameraType,getCameraConfig,exportToCsv,
    create,deleteCamera,update,findAll,findById,
    sortByLocation,findOneByCamId,getAllCameraByType
}