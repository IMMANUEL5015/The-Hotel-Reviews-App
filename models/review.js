const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
    rating: {
        type: Number,
        required: "Please provide a rating (1 - 5 stars).",
        min: 1,
        max: 5,
        validate: {
            validator: Number.isInteger,
            message: "This value is not an integer"
        }
    },
    text: {type: String},
    author: {
        id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        username: String
    },
    //Hotel associated with the review
    hotel: {
        type: mongoose.Schema.Types.ObjectId,
        ref : "Hotel"
    }
     //Mongoose automatically assigns createdAt and updatedAt fields to our schema if timestamps is set to true. The data type is Date
}, {
    timestamps: true 
});

module.exports = mongoose.model('Review', reviewSchema);