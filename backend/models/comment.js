const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const CommentSchema = new Schema({
    feedbackId: String,
    refId: Schema.Types.Mixed,
    status: String, //created, reviewed, hided, deleted,
    createAt: Date,
    message: String,
    contact: {
        name: String,
        phone: String,
        email: String,
        isAnonymous: { type: Boolean, default: false }
    },
    floor: Number
});

CommentSchema.statics.load = function(req, cb) {
    this.findOne({ _id: req }).exec(cb);
};

const Comment = mongoose.model('Comment', CommentSchema);
module.exports = Comment;