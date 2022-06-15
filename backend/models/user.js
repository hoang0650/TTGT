const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const UserSchema = new Schema({
    userId: { type: String, unique: true, required: true },
    blocked: Boolean,
    history: Array,
    roles: Array,
    tmpHistory: {
        hId: String,
        hName: String,
        hType: String,
        hTime: Date,
        hValues: Schema.Types.Mixed
    },
    favorite: Array,
    tmpFavorite: {
        fId: String,
        fName: String,
        fType: String,
        fStatus: Boolean,
        fTime: Date
    }
});


const User = mongoose.model('User', UserSchema);
module.exports = {User};