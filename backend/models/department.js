const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const DepartmentSchema = new Schema({
    name: String,
    pic: {
        email: String,
        phone: String,
        userId: String
    }
});

DepartmentSchema.statics.load = function (req, cb) {
    this.findOne({ _id: req }).exec(cb);
};

const Department = mongoose.model('Department', DepartmentSchema);
module.exports = Department;