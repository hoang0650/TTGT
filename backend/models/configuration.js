const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ConfigSchema = new Schema({
    type: String,
    frontendConfig: Schema.Types.Mixed,
    createdAt: Date
});

ConfigSchema.statics.load = function (req, cb) {
    return this.findOne({ _id: req }).exec(cb);
};

const Configuration = mongoose.model('Configuration', ConfigSchema);
module.exports = Configuration;