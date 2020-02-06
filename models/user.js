const mongoose              = require('mongoose'),
    passportLocalMongoose = require('passport-local-mongoose');

const userSchema = new mongoose.Schema({
    username: {type: String, required: true, unique: true},
    profilePicture: String,
    profilePictureId: String,
    firstName: String,
    lastName: String,
    email: {type: String, required: true, unique: true},
    description: String,
    hobbies: String,
    favouriteQuote: String,
    isAdmin: {type: Boolean, default: false},
    password: String,
    age: Number,
    phoneNumber: Number,
    birthday: Date,
    sex: String,
    occupation: String,
    followers: [
        {type: mongoose.Schema.Types.ObjectId, ref: 'User'}
    ],
    notifications: [
        {type: mongoose.Schema.Types.ObjectId, ref: 'Notification'}
    ],
    resetPasswordToken: String,
    resetPasswordExpires: Date,
});

userSchema.plugin(passportLocalMongoose);
module.exports = mongoose.model('User', userSchema);