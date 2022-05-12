const mongoose = require('mongoose');
const config = require('../config/configure');
const Schema = mongoose.Schema;
var mongooseExport = require('../utils/mongoose-export');
const mongooseToCsvQuotes = require('mongoose-to-csv-quotes'); 

const CameraSchema = new Schema(
    {
        camid: String,
        id: { type: String, unique: true, required: true },
        dist: String,
        road: String,
        region: Schema.Types.Mixed,
        groups: [{ type: Schema.ObjectId, ref: 'CameraGroup' }],
        managementUnit: String,
        type: String,
        name: String,
        loc: Schema.Types.Mixed,
        angle: Number,
        description: String,
        ptz: { type: Boolean, default: false },
        publish: { type: Boolean, default: false },
        configStatus: { type: Boolean, default: true },
        connectStatus: { type: String, default: 'unknown' },
        values: Schema.Types.Mixed,
        references: { type: Array, default: [] },
        status: { type: String, default: 'created' }
    },
    {
        toJSON: { virtuals: true }
    }
);

CameraSchema.plugin( mongooseToCsvQuotes, {
    headers: 'MaCamera TenCamera LoaiCamera Quan DonViQuanLy ChuThich CongKhai CauHinh PTZ ToaDo',
    alias: {
        'MaCamera': 'id',
        'TenCamera': 'name',
        'LoaiCamera': 'type',
        'Quan': 'dist',
        'DonViQuanLy': 'managementUnit',
        'ChuThich': 'description'
    },
    virtuals: {
        'CongKhai': doc => (doc.publish) ? 'x' : '',
        'CauHinh': doc => (doc.configStatus) ? 'x' : '',
        'PTZ': doc => (doc.ptz) ? 'x' : '',
        'ToaDo': doc => (doc.loc && doc.loc.coordinates) ? doc.loc.coordinates.join(' - ') : ''
    }
});

CameraSchema.virtual('snapshotUrl').get(function () {
    const camera = this;

    const preUrl = `//camera.thongtingiaothong.vn/snapshot/${camera.type}/`;
    if (camera.configStatus) {
        if (camera.values) {
            var values;
            if (camera.type === 'vov') {
                return `${preUrl}${camera.values.server}/${camera.values.camid}`;
            } else if (camera.type === 'vov_sony' || camera.type === 'vov_dahua') {
                if (camera.values.ip) {
                    values = camera.values.ip.split('.');
                    return `${preUrl}${values[2]}/${values[3]}`;
                }
                return preUrl;
            } else if (camera.type === 'tth') {
                if (camera.values.ip) {
                    // if (camera.values.channel) {
                    return `${preUrl}${camera.values.ip.split('.')[0]}/${camera.values.ip.split('.')[1]}/${camera.values.ip.split('.')[2]}/${camera.values.ip.split('.')[3]}`;
                    // }
                    // return preUrl + camera.values.ip.split('.')[3];
                }
                return preUrl;
            } else if (camera.type === 'tth_analog') {
                if (camera.values.ip && camera.values.channel) {
                    return `${preUrl}${camera.values.ip.split('.')[3]}/${camera.values.channel}`;
                }
                return preUrl;
            } else if (camera.type === 'tth_axis') {
                if (camera.values.ip) {
                    values = camera.values.ip.split('.');
                    return `${preUrl}${values[0]}/${values[1]}/${values[2]}/${values[3]}`;
                }
                return preUrl;
            } else if (camera.type === 'tth_paragon') {
                if (camera.values.ip) {
                    values = camera.values.ip.split('.');
                    return `${preUrl}${values[0]}/${values[1]}/${values[2]}/${values[3]}`;
                }
                return preUrl;
            } else if (camera.type === 'udc_foscam') {
                if (camera.values.camid) {
                    return `${preUrl}${camera.values.camid}`;
                }
                return preUrl;
            } else if (camera.type === 'nguyenhue') {
                if (camera.values.ip) {
                    values = camera.values.ip.split('.');
                    return `${preUrl}${values[2]}/${values[3]}`;
                }
                return preUrl;
            } else if (camera.type === 'kbcamera') {
                if (camera.values.hostname) {
                    const host = camera.values.hostname;
                    const channel = camera.values.channel;
                    return `${preUrl}${host}/${channel}`;
                }
                return preUrl;
            } else if (camera.type === 'sgcamera') {
                if (camera.values.hostname) {
                    const host = camera.values.hostname;
                    return `${preUrl}${host}`;
                }
                return preUrl;
            } else if (camera.type === 'streaming') {
                return `//camera.thongtingiaothong.vn/ss/${camera._id.toString()}`;
            }
        } else {
            return preUrl;
        }
    }

    return "!";
});

CameraSchema.virtual('videoUrl').get(function () {
    const camera = this;
    const preUrl = camera.values ? camera.values.streamingUrl : undefined;
    return preUrl;
});

CameraSchema.virtual('liveviewUrl').get(function () {
    const camera = this;
    const preUrl = `${config.cameraEndPoint}/api/snapshot/${camera._id}`;
    return preUrl;
});

CameraSchema.index({ loc: '2dsphere' });
CameraSchema.statics.load = function (req, cb) {
    return this.findOne({ _id: req }).populate('groups').exec(cb);
};


const Camera = mongoose.model('Camera', CameraSchema);

const LinkObjectSchema = new Schema(
    {
        links: { type: Array, default: [] },
        name: String,
        data: Schema.Types.Mixed
    },
    {
        toJSON: { virtuals: true }
    }
);

const CameraLink = mongoose.model('CameraLink', LinkObjectSchema);
module.exports = { Camera, CameraLink}

