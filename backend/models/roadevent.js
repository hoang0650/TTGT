const mongoose = require('mongoose');
const Schema = mongoose.Schema;
// var mongooseExport = require('../utils/mongoose-export');
const mongooseToCsvQuotes = require('mongoose-to-csv-quotes');
const RoadEventSchema = new Schema({
    createdAt: { type: Date, default: Date.now },
    creator: {
        source: { type: String, required: true },
        name: String
    },
    publish: { type: Boolean, default: false },
    featureCollection: {
        type: { type: String, required: true },
        properties: {
            name: { type: String, required: true },
            desc: { type: String },
            center: Schema.Types.Mixed,
            url: String
        },
        features: { type: Array }
    },
    status: { type: String, default: 'created' }
});

RoadEventSchema.statics.load = function(req, cb) {
    this.findOne({ _id: req }).exec(cb);
};

const RoadeventGeodataSchema = new Schema({
    type: { type: String, default: '' },
    geometry: { type: Schema.Types.Mixed },
    properties: {
        color: { type: String, default: '' },
        type: { type: String, default: '' },
        title: { type: String, default: '' },
        radius: { type: Number },
        image: { type: Schema.Types.Mixed },
        totalLength: { type: Number }
    }
}, { _id: false });

RoadEventSchema.plugin(mongooseToCsvQuotes, {
    headers: 'Ten NguoiTao NgayTao Geo',
    // constraints: {
    //     'MaCamera': 'id',
    //     'TenCamera': 'name',
    //     'LoaiCamera': 'type',
    //     'Quan': 'dist',
    //     'DonViQuanLy': 'managementUnit',
    //     'ChuThich': 'description'
    // },
    virtuals: {
        'Ten': doc => `'${doc.featureCollection.properties.name}'`,
        'NguoiTao': doc => `'${[doc.creator.source, doc.creator.name].join(' - ')}'`,
        'NgayTao': doc => doc.createdAt,
        'Geo': doc => `'${JSON.stringify(doc.featureCollection)}'`
    }
});

const RoadEvent = mongoose.model('RoadEvent', RoadEventSchema);
const RoadEventGeodata = mongoose.model('RoadEventGeodata', RoadeventGeodataSchema);
module.exports = {RoadEvent,RoadEventGeodata};