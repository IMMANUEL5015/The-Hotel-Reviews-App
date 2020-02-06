const mongoose = require('mongoose');

const hotelSchema = new mongoose.Schema({
    name: String,
    price: String,
    image: String,
    imageId: String,
    description: String,
    createdAt: {type: Date, default: Date.now},
    comments : [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Comment"
        }
    ],
    author: {
            id: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User"
            },
            username: String
    },
    reviews : [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Review'
        }
    ],
    rating: {
        type: Number,
        default: 0
    }
});

module.exports = mongoose.model("Hotel", hotelSchema);