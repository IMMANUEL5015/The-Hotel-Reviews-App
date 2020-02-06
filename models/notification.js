const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
    username: String,
    hotelId: String,
    isRead: {type: Boolean, default: false}
});

module.exports = mongoose.model('Notification', notificationSchema);