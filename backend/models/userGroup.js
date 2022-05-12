const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const UserGroupSchema = new Schema({
    name: {
        type: String,
        require: true
    },
    description: {
        type: String,
        require: true
    },
    users: [String],
    permissions:
    {
        type: Schema.Types.Mixed,
        require: true
    },
    createdAt: { type: Date, default: Date.now },
    creator: Schema.Types.Mixed,
    status: {
        type: String,
        default: 'created'
    }
});

UserGroupSchema.statics.load = function (req, cb) {
    this.findOne({ _id: req }).exec(cb);
};

const UserGroup = mongoose.model('UserGroup', UserGroupSchema);
module.exports = UserGroup;