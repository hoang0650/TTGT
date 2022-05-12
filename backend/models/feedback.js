const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const FeedbackSchema = new Schema({
    contact: {
        userId: String,
        name: { type: String, required: true },
        phone: { type: String, required: true },
        email: { type: String, required: true },
        isAnonymous: { type: Boolean, default: false }
    },
    draft: {
        _type: Schema.Types.Mixed,
        occursAt: Date,
        title: { type: String, required: true },
        addr: { type: String, required: true },
        description: { type: String, required: true }
    },
    reviewed: {
        _type: Schema.Types.Mixed,
        occursAt: Date,
        title: String,
        addr: String,
        description: String
    },
    createAt: Date,
    assignment: Array,
    tmpAssignment: {
        asPerformBy: String,
        asFrom: String,
        asTo: String,
        asTs: Date,
        asMessage: String,
        asImages: Array
    },
    status: String, //created, reviewed, assigned, done, closed
    loc: Schema.Types.Mixed,
    images: Array,
    videoUrl: String
});

FeedbackSchema.index({ loc: '2dsphere' });
FeedbackSchema.statics.load = function (req, cb) {
    this.findOne({ _id: req }).exec(cb);
};

const Feedback = mongoose.model('Feedback', FeedbackSchema);
module.exports = Feedback;