const  mongoose = require('mongoose');
const  Schema = mongoose.Schema;

const  MonitorTemplateSchema = new Schema({
    name: String,
    fields: { type: Array, default: [] },
    status: { type: String, default: 'created' },
});

MonitorTemplateSchema.statics.load = function(req, cb) {
    this.findOne({ _id: req.params.id }).exec(cb);
};

const MonitorTemplate = mongoose.model('MonitorTemplate', MonitorTemplateSchema);
module.exports = MonitorTemplate;