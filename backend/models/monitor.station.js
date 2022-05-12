const  mongoose = require('mongoose');
const  Schema = mongoose.Schema;

const  MonitorStationSchema = new Schema({
    name: String,
    templates: { type: Array, default: [] },
    status: { type: String, default: 'created' },
});

MonitorStationSchema.statics.load = function(req, cb) {
    this.findOne({ _id: req.params.id }).exec(cb);
};

const MonitorStation = mongoose.model('MonitorStation', MonitorStationSchema);
module.exports = MonitorStation;