const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const NewSchema = new Schema({
    title: String,
    image: String,
    message: String,
    url: String,
    createdAt: {
        type: Date,
        default: new Date()
    }
});

const New = mongoose.model('New', NewSchema);
module.exports = New;
