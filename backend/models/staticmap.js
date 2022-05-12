 const mongoose = require('mongoose');
 const Schema = mongoose.Schema;
//  var mongooseExport = require('../utils/mongoose-export');
 const mongooseToCsvQuotes = require('mongoose-to-csv-quotes');
 const StaticMapSchema = new Schema({
    name: String,
    description: String,
    status: { type: String, default: 'created' }, //created, updated
    publish: { type: Boolean, default: false },
    properties: Schema.Types.Mixed,
    mapdatas: Schema.Types.Mixed,
    type: { type: String, default: '' },
    createdAt: { type: Date, default: new Date() },
    creator: {
        source: { type: String, required: true },
        name: String
    },
    history: Array,
    versions: { type: Array, default: [] },
    icon: Schema.Types.Mixed
});

StaticMapSchema.statics.load = function(req, cb) {
    this.findOne({ _id: req }).exec(cb);
};

StaticMapSchema.plugin(mongooseToCsvQuotes, {
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
        'Ten': doc => `'${doc.name}'`,
        'NguoiTao': doc => `'${[doc.creator.source, doc.creator.name].join(' - ')}'`,
        'NgayTao': doc => doc.createdAt,
        'Geo': doc => `'${JSON.stringify(doc.mapdatas)}'`
    }
});


const StaticMap = mongoose.model('StaticMap', StaticMapSchema);
module.exports = StaticMap;