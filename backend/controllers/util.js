const grid = {
    'size': [256, 256],
    'srs': 'EPSG:4326',
    'bbox': [-180, -90, 180, 90]
};


const config = require('../config/configure');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const hashCode = function(str) {
    const hash = 0;
    var j;
    for (j = 0; j < str.length; j++) {
        const char = str.charCodeAt(j);
        hash += char;
    }
    return hash;
};

const storage = multer.diskStorage({
    destination: config.uploadFolder,
    filename: function(req, file, cb) {
        const datetimestamp = Date.now();
        cb(null, hashCode(file.originalname.split('.')[0]) + datetimestamp + '.' + file.originalname.split('.')[file.originalname.split('.').length - 1]);
    }
});

const uploadImage= multer({ //multer settings
        storage: storage,
        fileFilter: function(req, file, cb) {
            if (file.mimetype.indexOf('image') < 0) {
                cb(null, false);
            } else {
                cb(null, true);
            }
        }
    });

   


const uploadFile= multer({ //multer settings
        storage: storage
    });


grid.size = grid.size || [256, 256];
grid.resolution = grid.resolution || {};

const res = grid.resolution;
if (!res.values) {
    res.values = [];
    res.factor = res.factor || 2;
    res.levels = res.levels || 18;
    res.min = res.min || (grid.bbox[2] - grid.bbox[0]) / grid.size[0];
    for (var i = 0; i < res.levels; i++) {
        res.values[i] = res.min / Math.pow(res.factor, i);
    }
}

function getTileBounds (z, y, x) {
    const resolution = grid.resolution.values[z];
    const width = grid.size[0] * resolution;
    const height = grid.size[1] * resolution;
    x = grid.bbox[0] + (x * width);
    y = grid.bbox[1] + (y * height);
    return [x, y, x + width, y + height];
};

// Wrapper around transform call for convenience. Transforms line from EPSG:900913 to EPSG:4326
// line - a list of [lat0,lon0,lat1,lon1,...] or [(lat0,lon0),(lat1,lon1),...]
function from900913To4326 (line) {
    const serial = false;
    if (!Array.isArray(line[0])) {
        serial = true;
        const l1 = [];
        for (i = 0; i < line.length; i = i + 2) {
            l1.push(new Array(line[i], line[i + 1]));
        }
        line = l1;
    }

    const ans = [];
    for (i = 0; i < line.length; i++) {
        const xtile = line[i][0] / 111319.49079327358;
        const ytile = this.rad2deg(Math.asin(this.tanh(line[i][1] / 20037508.342789244 * Math.PI)));
        if (serial) {
            ans.push(xtile);
            ans.push(ytile);
        } else {
            ans.push([xtile, ytile]);
        }
    }
    return ans;
};

// Wrapper around transform call for convenience. Transforms line from EPSG:4326 to EPSG:900913
// line - a list of [lat0,lon0,lat1,lon1,...] or [(lat0,lon0),(lat1,lon1),...]
function from4326To900913() {
    const serial = false;
    if (!Array.isArray(line[0])) {
        serial = true;
        const l1 = [];
        for (i = 0; i < line.length; i = i + 2) {
            l1.push(new Array(line[i], line[i + 1]));
        }
        line = l1;
    }

    const ans = [];
    line.forEach(function(l) {
        const latRad = this.deg2rad(l[1]);
        const xtile = l[0] * 111319.49079327358;
        const ytile = Math.log(Math.tan(latRad) + (1 / Math.cos(latRad))) / Math.PI * 20037508.342789244;

        if (serial) {
            ans.push(xtile);
            ans.push(ytile);
        } else {
            ans.push(new Array(xtile, ytile));
        }
    }, this);

    return ans;
};

function getBbox(z, x, y)  {
    const a = this.getCoords(z, x, y);
    const b = this.getCoords(z, +x + 1, +y + 1);
    return new Array(a[0], b[1], b[0], a[1]);
};

// Converts (z,x,y) to coordinates of corner of a tile
function getCoords(z, x, y) {
    const normalizedTile = new Array(x / Math.pow(2.0, z), 1.0 - (y / Math.pow(2.0, z)));
    const projectedBounds = this.from4326To900913(new Array(-180.0, -85.0511287798, 180.0, 85.0511287798));
    const maxp = new Array(projectedBounds[2] - projectedBounds[0], projectedBounds[3] - projectedBounds[1]);
    const projectedCoords = new Array((normalizedTile[0] * maxp[0]) + projectedBounds[0], (normalizedTile[1] * maxp[1]) + projectedBounds[1]);
    return this.from900913To4326(projectedCoords);
};

function tanh (i){(Math.exp(i) - Math.exp(-i)) / (Math.exp(i) + Math.exp(-i));} 
function rad2deg (angle) {angle / (Math.PI / 180.0);}

function deg2rad (angle) {angle * (Math.PI / 180.0);} 



function displayFile(fileName) {
    return path.resolve(config.uploadFolder + fileName);
};

function deleteFile(fileName) {
    var message;
    fs.unlink(config.uploadFolder + fileName, (err) => {
        message = err;
    });
    if (!message) {
        message = 'success';
    }
    return message;
};

function upVersion (req, res, next, Model) {
    const oldDoc = new Model(req.model._doc);
    delete oldDoc._doc.versions;
    req.model.versions = req.model.versions || [];
    req.model.versions.push(oldDoc._doc);
    next();
};

module.exports = {
    uploadImage,uploadFile,getTileBounds,from900913To4326,
    from4326To900913,getBbox,getCoords,tanh,rad2deg,deg2rad,
    displayFile,deleteFile,upVersion
}