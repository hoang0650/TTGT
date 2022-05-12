const  mongoose = require('mongoose');
const  Schema = mongoose.Schema;

const  FeedbackTypeSchema = new Schema({
    name: String
});

FeedbackTypeSchema.statics.load = function (req, cb) {
    this.findOne({ _id: req }).exec(cb);
};

const FeedbackType = mongoose.model('FeedbackType', FeedbackTypeSchema);
module.exports = FeedbackType;