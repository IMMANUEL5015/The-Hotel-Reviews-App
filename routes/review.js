const express = require('express');
const router = express.Router({mergeParams: true});
const Hotel = require('../models/hotel');
const Review = require('../models/review');
const middleware = require('../middleware');
const calculateAverage = require('../utilities/calculateAverage');

//Reviews Index Route
router.get('/', (req, res) => {
    Hotel.findById(req.params.id).populate({
        path: 'reviews', 
        options: {sort: {createdAt: -1 }}}).exec((err, hotel) => {
            if(err || !hotel){
                req.flash('error', err.message);
                return res.redirect('back');
            }else{
                res.render('reviews/index', {hotel : hotel});
            }
    });
});

//Reviews New Route
router.get('/new', middleware.isLoggedIn, middleware.checkReviewerExistence, (req, res) => {
    Hotel.findById(req.params.id, (err, hotel) => {
        if(err || !hotel){
            req.flash('err', err.message);
            return res.redirect('back');
        }else{
            res.render('reviews/new', {hotel:hotel});
        }
    });
});

//Reviews Create Route
router.post('/', middleware.isLoggedIn, middleware.checkReviewerExistence, (req, res) => {
    //Look up the hotel and populate the reviews
    Hotel.findById(req.params.id).populate('reviews').exec((err, hotel) => {
        if(err){
            req.flash('err', err.message);
            return res.redirect('back');   
        }else{
            //Create the review
            Review.create(req.body.review, async (err, review) => {
                if(err){
                    req.flash('err', err.message);
                    return res.redirect('back'); 
                }else{
                    //Associate the review with its author and its hotel
                    review.author.id = req.user._id;
                    review.author.username = req.user.username;
                    review.hotel = hotel;
                    await review.save();

                    //Associate the hotel with the review and calculate the average rating of the hotel
                    hotel.reviews.push(review);
                    hotel.rating = calculateAverage(hotel.reviews);
                    await hotel.save();

                    req.flash('success', 'You have successfully reviewed ' + hotel.name);
                    res.redirect('/hotels/' + hotel._id);
                }
            });
        }
    });
});

//REVIEW EDIT ROUTE
router.get('/:review_id/edit', middleware.checkReviewOwnership, (req, res) => {
    Review.findById(req.params.review_id, (err, review) => {
        if(err || !review){
            req.flash('err', err.message);
            return res.redirect('back');  
        }else{
            res.render('reviews/edit', {hotel_id: req.params.id, review: review});
        }
    });
}); 

//Review Update Route
router.put('/:review_id', middleware.checkReviewOwnership, (req, res) => {
    Review.findByIdAndUpdate(req.params.review_id, req.body.review, {
        new: true,
        useFindAndModify:false
    }, (err, updatedReview) => {
        if(err){
            req.flash('err', err.message);
            return res.redirect('back'); 
        }else{
            Hotel.findById(req.params.id).populate('reviews').exec( async(err, hotel) => {
                if(err){
                    req.flash('err', err.message);
                    return res.redirect('back');  
                }else{
                    hotel.rating = calculateAverage(hotel.reviews);
                    await hotel.save();
                    req.flash('success', 'You have successfully updated your review');
                    res.redirect('/hotels/' + hotel._id);
                }
            });
        }
    });
});

//Reviews Delete Route
router.delete('/:review_id', middleware.checkReviewOwnership, (req, res) => {
    Review.findByIdAndDelete(req.params.review_id, (err, deletedReview) => {
        if(err){
            req.flash('err', err.message);
            return res.redirect('back');
        }else{
            Hotel.findByIdAndUpdate(req.params.id, {$pull: {reviews: req.params.review_id}}, {
                new:true,
                useFindAndModify:false
            }).populate('reviews').exec(async(err, hotel) => {
                if(err){
                    req.flash('err', err.message);
                    return res.redirect('back');  
                }else{
                    hotel.rating = calculateAverage(hotel.reviews);
                    await hotel.save();

                    req.flash('success', 'You review has been deleted.');
                    res.redirect('/hotels/' + hotel._id);
                }
            });
        }
    });
});

module.exports = router;