const  mongoose = require('mongoose');
const  Schema = mongoose.Schema;

const  MonitorSchema = new Schema({
    name: String,
    description: String,
    listStations: Schema.Types.Mixed,
    createdAt: {
        type: Date,
        default: new Date()
    },
    versions: { type: Array, default: [] },
    status: { type: String, default: 'created' },
    isLatest: { type: Boolean, default: false }
});

MonitorSchema.statics.load = function(req, cb) {
    this.findOne({ _id: req.params.id }).exec(cb);
};

const Monitor = mongoose.model('Monitor', MonitorSchema);
module.exports = Monitor;