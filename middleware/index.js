const Hotel = require('../models/hotel');
const Comment = require('../models/comment');
const Review = require('../models/review');
const middlewareObj = {};

//Check if a user is the owner of a hotel
middlewareObj.checkHotelOwnership = function(req, res, next){
    //Check if user is logged in
    if(req.isAuthenticated()){
        Hotel.findById(req.params.id, (err, hotel) => {
            if(err){
                req.flash('error', 'Hotel not found!.');
                res.redirect('back');
            }else{
                //Check if the user owns the hotel
                if(hotel.author.id.equals(req.user._id) || req.user.isAdmin){
                    next();
                }else{
                    req.flash('error', 'You are forbidden from performing this action.');
                    res.redirect("back");
                }  
            }
        });
    }else{
        req.flash('error', 'You need to be logged in to perform this action');
        res.redirect('back');
    }
}

//Check if a user is the author of a comment
middlewareObj.checkCommentOwnership = function(req, res, next){
    //Check if user is logged in
    if(req.isAuthenticated()){
        //Retrieve the comment
        Comment.findById(req.params.commentid, (err, foundComment) => {
            if(err){
                //Return the user to the previous page if error occurs in retrieving the comment
                req.flash('error', 'Unable to find comment');
                res.redirect('back');
            }else{
                if(foundComment.author.id.equals(req.user._id) || req.user.isAdmin){
                    next();
                }else{
                    //Return the user to the previous page if the user is not the author of the comment
                    req.flash('error', 'You are forbidden from performing this action.');
                    res.redirect('back');
                }
            }
        });
    }else{
        //Return the user to the previous page if not logged in
        req.flash('error', 'You must be logged in to perform this action.');
        res.redirect('back');
    }
}

//Check if a user is logged in
middlewareObj.isLoggedIn = function(req, res, next){
    if(req.isAuthenticated()){
        next();
    }else{
        req.flash('error', "You need to be signed in in order to perform this action.");
        res.redirect('/login');
    }
}

//Ensure that a user is the owner of a document
middlewareObj.confirmUser = (req, res, next) => {
    if(req.isAuthenticated()){
        if(req.user._id == req.params.id || req.user.isAdmin){
            return next();
        }else{
            req.flash('error', 'You are forbidden from performing this action.');
            return res.redirect('/hotels');
        }
    }else{
        req.flash('error', 'You must be logged in in order to perform this action.');
        return res.redirect('/login');
    }
}

//Check if a logged in user is an admin
middlewareObj.confirmAdminUser = (req, res, next) => {
    if(req.isAuthenticated()){
        if(req.user.isAdmin){
            return next();
        }else{
            req.flash('error', 'You do not have permission to perform this action.');
            return res.redirect('/hotels');
        }
    }else{
        req.flash('error', 'You must be logged in to perform this action');
        return res.redirect('/login');
    }
}

//Check to see if a user is the owner of a review
middlewareObj.checkReviewOwnership = function(req, res, next){
    if(req.isAuthenticated()){
        Review.findById(req.params.review_id, (err, review) => {
            if(err){
                req.flash('error', 'Something went wrong.');
                res.redirect('back');
            }else{
                if(req.user.isAdmin || review.author.id.equals(req.user._id)){
                    return next();
                }else{
                    req.flash('error', 'You do not have permission to perform this action.');
                    return res.redirect('back'); 
                }
            }
        });
    }else{
        req.flash('error', 'You must be logged in to perform this action');
        return res.redirect('/login');
    }
}

//Check to see if a user has already reviewed a hotel
middlewareObj.checkReviewerExistence = async function(req, res, next){
    if(req.isAuthenticated()){
        //Find the Hotel And Populate the reviews
        const hotel = await Hotel.findById(req.params.id).populate('reviews').exec();
        const hotelReviews = hotel.reviews;
        //Check to see if any of the hotel reviews have been authored by the logged in user
        const alreadyReviewed = hotelReviews.some((review) => {
            return review.author.id.equals(req.user._id);
        });
        //Return an error if the user has already reviewed the hotel
        if(alreadyReviewed){
            req.flash('error', 'You have already reviewed this hotel.');
            return res.redirect('back');
        }
        //Return next if the logged in user has not already reviewed the hotel
        return next();
    }else{
        req.flash('error', 'You must be logged in to perform this action');
        return res.redirect('/login');
    }
}

module.exports = middlewareObj;