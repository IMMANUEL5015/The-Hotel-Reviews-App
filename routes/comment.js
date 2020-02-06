const express = require('express');
const router = express.Router({mergeParams: true});
const Hotel = require('../models/hotel');
const Comment = require('../models/comment');
const deleteCommentId = require('../utilities/deleteCommentId');
const middlewareObj = require('../middleware');

//Get Form to create new coment
router.get('/new', middlewareObj.isLoggedIn,  (req, res) => {
    Hotel.findById(req.params.id, (err, hotel) => {
        if(err){
            req.flash('error', 'Something went wrong! Please try again later.');
            res.redirect('back');
        }else{
            res.render('comments/new', {hotel: hotel});
        }
    });
});

//Create new comment
router.post('/', middlewareObj.isLoggedIn, (req, res) => {
    //Retrieve hotel based on ID
    Hotel.findById(req.params.id, (err, hotel) => {
        if(err){
            req.flash('error', 'An error occurred in trying to perform this action.');
            res.redirect("/hotels");
        }else{
            //Create new comment
            Comment.create(req.body.comment, (err, comment) => {
                if(err){
                    req.flash('error', 'An error occurred in trying to perform this action.');
                    res.redirect("/hotels");  
                }else{
                    //Associate comment with it's creator
                    comment.author.id = req.user._id;
                    comment.author.username = req.user.username;
                    comment.save();
                    //Connect new comment to hotel
                    hotel.comments.push(comment);
                    hotel.save();
                    //Redirect to hotel show page
                    req.flash('success', 'Comment Added!');
                    res.redirect(`/hotels/${hotel._id}`);
                }
            });
        }
    });
});

//Get Form to Edit Comment
router.get('/:commentid/edit', middlewareObj.checkCommentOwnership, (req, res) => {
    Comment.findById(req.params.commentid, (err, foundComment) => {
        if(err){
            req.flash('error', "Unable to retrieve comment");
            res.redirect('back');
        }else{
            res.render('comments/edit', {hotelid: req.params.id, comment: foundComment});
        }
        
    });
});

//Update the Comment
router.put("/:commentid", middlewareObj.checkCommentOwnership, (req, res) => {
    Comment.findByIdAndUpdate(req.params.commentid, req.body.comment, {
        new: true,
        useFindAndModify: false
    }, (err, comment) => {
        if(err){
            req.flash('error', 'Unable to update comment.')
            res.redirect('back')
        }else{
            req.flash('success', 'Comment Updated!');
            res.redirect('/hotels/' + req.params.id);
        }
    });
});

//Delete Comment
router.delete("/:commentid", middlewareObj.checkCommentOwnership, async (req, res) => {
    await Comment.findByIdAndDelete(req.params.commentid, async (err, deletedComment) => {
        if(err){
            req.flash('error', 'Unable to delete comment');
            res.redirect('back');
        }else{
            //Disassociate the deleted comment from it's associated hotel
            let hotel = await Hotel.findById(req.params.id);
            await deleteCommentId(hotel.comments, req.params.commentid, hotel);
            req.flash('success', 'Comment Deleted!');
            res.redirect("/hotels/" + req.params.id);
        }
    });
});
module.exports = router;