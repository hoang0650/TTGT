const mongoose = require('mongoose');
const Schema = mongoose.Schema;
// var mongooseExport = require('../utils/mongoose-export');
const mongooseToCsvQuotes = require('mongoose-to-csv-quotes');
const ParkingSchema = new Schema({
    name: String,
    dist: String,
    ward: String,
    region: Schema.Types.Mixed,
    addr: String,
    loc: Schema.Types.Mixed,
    cap: Number,
    avl: Number,
    note: String,
    vehicle_type: Schema.Types.Mixed,
    price_details: String,
    price: Schema.Types.Mixed,
    worktime: Schema.Types.Mixed,
    worktime_details: String,
    pictures: Array,
    status: { type: String, default: 'created' }
});

ParkingSchema.index({ loc: '2dsphere' });
ParkingSchema.statics.load = function (req, cb) {
    return this.findOne({ _id: req }).exec(cb);
};

ParkingSchema.plugin(mongooseToCsvQuotes, {
    headers: 'Ten DiaChi Quan ToaDo',
    alias: {
        'Ten': 'name',
        'DiaChi': 'addr',
        'Quan': 'dist'
    },
    virtuals: {
        'ToaDo': doc => (doc.loc && doc.loc.coordinates) ? doc.loc.coordinates.join(' - ') : ''
    }
});

const Parking = mongoose.model('Parking', ParkingSchema);
module.exports = Parking