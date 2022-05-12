const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const CapEventSchema = new Schema({
    cap: { type: {} },
    references: [{
        type: Schema.ObjectId,
        ref: 'CapEvent'
    }],
    linkId: String,
    sent: Date,
    center: { type: {},
        index: '2dsphere'
    }
});



CapEventSchema.statics.load = function (id, cb) {
    this.findOne({ _id: id }).exec(cb);
};

const CapEvent = mongoose.model('CapEvent', CapEventSchema);
module.exports = CapEvent;