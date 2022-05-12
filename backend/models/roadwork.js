const mongoose = require('mongoose');
const Schema = mongoose.Schema;
// var mongooseExport = require('../utils/mongoose-export');
const mongooseToCsvQuotes = require('mongoose-to-csv-quotes');
const RoadWorkSchema = new Schema({
    name: String,
    createdAt: { type: Date, default: Date.now },
    road: Schema.Types.Mixed,
    publish: { type: Boolean, default: false },
    ownerBy: String,
    performBy: String,
    type: Schema.Types.Mixed,
    startAt: Date,
    finishPlan: Date,
    loc: Schema.Types.Mixed,
    finishAt: Date,
    status: Schema.Types.Mixed,
    dist: Schema.Types.Mixed,
    featureCollection: Schema.Types.Mixed,
    linkid: Schema.Types.Mixed,
    note: String,
    values: Schema.Types.Mixed,
    description: String,
    documentStatus: { type: String, default: 'created' }
});

RoadWorkSchema.plugin(mongooseToCsvQuotes, {
    headers: 'Ten TuyenDuong DvChuQuan DvThiCong Loai NgayBatDau NgayKetThuc TinhTrang ToaDo',
    alias: {
        'Ten': 'name',
        'TuyenDuong': 'road',
        'DvChuQuan': 'ownerBy',
        'DvThiCong': 'performBy',
        'Loai': 'type',
        'TinhTrang': 'status',
        'Quan': 'dist'
    },
    virtuals: {
        'NgayBatDau': doc => (doc.startAt) ? doc.startAt.toLocaleDateString() : '',
        'NgayKetThuc': doc => (doc.finishPlan) ? doc.finishPlan.toLocaleDateString() : '',
        'ToaDo': doc => (doc.loc && doc.loc.coordinates) ? doc.loc.coordinates.join(' - ') : ''
    }
});

RoadWorkSchema.index({ loc: '2dsphere' });
RoadWorkSchema.statics.load = function (req, cb) {
    this.findOne({ _id: req }).exec(cb);
};

const Roadwork = mongoose.model('Roadwork', RoadWorkSchema);
module.exports = Roadwork;