const mongoose = require('mongoose');


const UserSchema = new mongoose.Schema(
    {
        email: {type: String, required: true, minlength: 5, unique: true},
        username: {type: String, required: true, minlength: 1, unique: true},
        password: {type: String, required: true, minlength: 8},
    }
);

const UserModel = mongoose.model('User', UserSchema)

module.exports = UserModel;