const mongoose = require('mongoose');

const CameraGroupSchema = new mongoose.Schema({
    name: String,
    description: String,
    status: String //created, deleted
});

CameraGroupSchema.statics.load = function (req, cb) {
    this.findOne({ _id: req }).exec(cb);
};

const CameraGroup = mongoose.model('CameraGroup', CameraGroupSchema);
module.exports = CameraGroup;