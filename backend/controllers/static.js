var fs = require('fs');
var path = require('path');

var getFile = (absPath, cb) => {
	var filePath = path.join(__dirname, `../${absPath}`);
	fs.readFile(filePath, { encoding: 'utf-8' }, (err, data) => { cb(err, data); });
};



function getCameras(req, res){
	var path = 'data/cameras.json';
	getFile(path, (err,data) => {
		if(err) {
			res.status(404);
		} else {
			data = JSON.parse(data);
			res.json(data);
		}
	});
};

function getHdCameras(req, res){
	var path = 'data/hd_cameras.json';
	getFile(path, (err,data) => {
		if(err) {
			res.status(404);
		} else {
			data = JSON.parse(data);
			res.json(data);
		}
	});
};

function getTthCameras(req, res){
	var path = 'data/tth_cameras.json';
	getFile(path, (err,data) => {
		if(err) {
			res.status(404);
		} else {
			data = JSON.parse(data);
			res.json(data);
		}
	});
};

function getTthNewCameras(req, res) {
	var path = 'data/tth_new_cameras.json';
	getFile(path, (err,data) => {
		if(err) {
			res.status(404);
		} else {
			data = JSON.parse(data);
			res.json(data);
		}
	});
};

module.exports = {
    getCameras,getHdCameras,getTthCameras,getTthNewCameras
}