const mongoose = require('mongoose');
const Schema = mongoose.Schema;
// var mongooseExport = require('../utils/mongoose-export');
const mongooseToCsvQuotes = require('mongoose-to-csv-quotes'); 
const EventSchema = new Schema({
    desc: { type: Array, required: true },
    type: { type: Schema.Types.Mixed, required: true },
    loc: { type: Schema.Types.Mixed, required: true },
    createdAt: Date,
    creator: {
        source: {type: String, required: true},
        name: String
    },
    approvedBy: {
        source: {type: String},
        name: String
    },
    status: String, //created, approved, expired, rejected, updated
    snapshot: Schema.Types.Mixed,
    affectRoads: Schema.Types.Mixed,
    values: Schema.Types.Mixed,
    origins: {type: Array, default: []},
    references: [{ type: String, ref: 'TrafficEvent' }],
    history: Array
});

EventSchema.plugin(mongooseToCsvQuotes, {
    headers: 'TenDuong TinhTrang ThongTinThem ThoiGian NguoiDang',
    alias: {
        
    },
    virtuals: {
        'TenDuong': e => JSON.stringify(e.desc[0]),
        'TinhTrang': e => JSON.stringify(e.desc[1]),
        'ThongTinThem': e => JSON.stringify(e.desc[2]),
        'ThoiGian': e => JSON.stringify(e.createdAt.toISOString()),
        'NguoiDang': e => JSON.stringify(e.creator.source + ' - ' + e.creator.name)
    }
});

EventSchema.index({ loc: '2dsphere' });
EventSchema.statics.load = function (req, cb) {
    this.findOne({ _id: req }).populate('references').exec(cb);
};

const TrafficEvent  = mongoose.model('TrafficEvent', EventSchema);
module.exports = TrafficEvent;