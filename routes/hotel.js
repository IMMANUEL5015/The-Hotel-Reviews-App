require('dotenv').config();
const express = require('express');
const router = express.Router();
const Hotel = require('../models/hotel');
const Comment = require('../models/comment');
const deleteAssociatedComments = require('../utilities/deleteAssociatedComments');
const middlewareObj = require('../middleware');
const escapeRegex = require('../utilities/escapeRegex');
const Notification = require('../models/notification');
const User = require('../models/user');
const Review = require('../models/review');
const multer = require('multer');
const storage = multer.diskStorage({
  filename: function(req, file, callback) {
    callback(null, Date.now() + file.originalname);
  }
});
const imageFilter = function (req, file, cb) {
    // accept image files only
    if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/i)) {
        return cb(new Error('Only image files are allowed!'), false);
    }
    cb(null, true);
};
const upload = multer({ storage: storage, fileFilter: imageFilter})

const cloudinary = require('cloudinary');
cloudinary.config({ 
  cloud_name: 'immanueldiai', 
  api_key: process.env.CLOUDINARY_API_KEY, 
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const NodeGeocoder = require('node-geocoder');
 
const options = {
  provider: 'google',
  httpAdapter: 'https',
  apiKey: process.env.GEOCODER_API_KEY,
  formatter: null
};
 
const geocoder = NodeGeocoder(options);

//Show all Hotels
// INDEX
router.get("/", function(req, res){
    let noHotel;
    if(req.query.search){
        const regex = new RegExp(escapeRegex(req.query.search), 'gi');
        Hotel.find({name: regex}, function(err, allHotels){
            if(err){
                req.flash('error', 'Hotels not found!.');
                res.redirect('back');
            }else if(allHotels.length < 1){
                noHotel = 'No match for your query was found. Please try again.'
                res.render('hotels/index', {hotels: allHotels, page: 'hotels', noHotel: noHotel});        
            }else{
                res.render('hotels/index', {hotels: allHotels, page: 'hotels', noHotel: noHotel});        
            }
        });
    }else{
       Hotel.find({}, function(err, allHotels){
            if(err){
                req.flash('error', 'Hotels not found!.');
                res.redirect('back');
            }else{
                res.render('hotels/index', {hotels: allHotels, page: 'hotels', noHotel: noHotel});        
            }
        }); 
    }
});

//Add new hotel
//CREATE
router.post('/', middlewareObj.isLoggedIn, upload.single('image'), function(req, res){
    // add author to hotel
    req.body.hotel.author = {
        id: req.user._id,
        username: req.user.username
    }

    geocoder.geocode(req.body.hotel.location, (err, data) => {
        if(err || !data.length){
            req.flash('error', 'Invalid Address');
            return res.redirect('back');
        }

        req.body.hotel.lat = data[0].latitude;
        req.body.hotel.lng = data[0].longitude;
        req.body.hotel.location = data[0].formattedAddress;

        Hotel.create(req.body.hotel, async (err, hotel) => { //Create the hotel
            if(err) {
            req.flash('error', err.message);
            return res.redirect('back');
            }
            //Notify the followers of the user about the newly created hotel
            
            //Step 1: Find the user and get all followers
            let user = await User.findById(req.user._id).populate('followers').exec();
            
            //Step 2: Define the notification
            const notification = {
                    username: user.username,
                    hotelId: hotel.id,
                }
    
            //Step 3: Send the notification to all the user's followers
            for(const follower of user.followers){
                let newNotification = await Notification.create(notification); //Step 3.1 Create the notification
                follower.notifications.push(newNotification); //Step 3.2  Send the notification
                await follower.save();
            }
    
            cloudinary.v2.uploader.upload(req.file.path, async function(err, result) {
                // add cloudinary url for the image to the hotel object under image property
                hotel.image = result.secure_url;
                hotel.imageId = result.public_id;
                await hotel.save(() => {
                    res.redirect('/hotels/' + hotel.id); //Redirect to the hotels show page
                });
            }); 
        });
    });
});

//Form to add new hotel
//NEW
router.get('/new', middlewareObj.isLoggedIn, function(req, res){
    res.render('hotels/new');
});

//Show detailed info about a specific hotel
//SHOW
router.get('/:id', function(req, res){
    Hotel.findById(req.params.id).populate('comments').populate({
        path: 'reviews',
        options: {sort: {createdAt: -1}}
    }).exec(function(err, foundHotel){
        if(err){
            req.flash('error', 'Unable to find hotel!.');
            res.redirect('back');
        } else{
            res.render('hotels/show', {hotel: foundHotel});
        }
    });
});

//Edit Hotel
router.get('/:id/edit', middlewareObj.checkHotelOwnership, (req, res) => { 
    Hotel.findById(req.params.id, (err, hotel) => {
        if(err){
            req.flash('error', 'Unable to find hotel!.');
            res.redirect('back');
        }else{
            res.render('hotels/edit', {hotel: hotel});
        }
    });  
});

//Update Hotel
router.put("/:id", middlewareObj.checkHotelOwnership, upload.single('image'), async (req, res) => {
    geocoder.geocode(req.body.hotel.location, (err, data) => {
        if(err || !data.length){
            req.flash('error', 'Invalid Address');
            return res.redirect('back');  
        }else{
            await Hotel.findById(req.params.id, async (err, hotel) => { //Find the hotel
                if(err){
                    req.flash('error', 'Unable to update hotel!.');
                    res.redirect("back");
                }else{
                    if(req.file){ //Check to see if there is any file to be uploaded
                        try{
                            await cloudinary.v2.uploader.destroy(hotel.imageId); //Remove the current image from Cloudinary
                            const result = await cloudinary.v2.uploader.upload(req.file.path)//Upload a new image to cloudinary
                            hotel.image = result.secure_url;
                            hotel.imageId = result.public_id;
                        }catch(error){
                            req.flash('error', 'Unable to update hotel!.');
                            res.redirect("back");
                        }
                    }
                    delete req.body.hotel.rating; //Protect the rating from manipulation
                    hotel.lat = data[0].latitude;
                    hotel.lng = data[0].longitude;
                    hotel.location = data[0].formattedAddress;
                    hotel.name = req.body.hotel.name; //Set the new data
                    hotel.description = req.body.hotel.description
                    hotel.price = req.body.hotel.price
                    await hotel.save((err) => { //Update the hotel in the database
                        req.flash('success', 'You have successfully updated this hotel!.');
                        res.redirect("/hotels/" + req.params.id);
                    });  
                }
            });
        }
    });
});

//Delete Hotel
router.delete('/:id', middlewareObj.checkHotelOwnership, (req, res) => {
    Hotel.findByIdAndDelete(req.params.id, async (err, deletedHotel) => {
        if(err){
            req.flash('error', 'Unable to delete hotel!.');
            res.redirect('back');
        }else{
            await cloudinary.v2.uploader.destroy(deletedHotel.imageId); //Delete image from cloudinary
            await deleteAssociatedComments(deletedHotel.comments, Comment);//Delete asssociated comments
            await Review.deleteMany({"_id" : {$in : deletedHotel.reviews}}); //Delete all the reviews that are associated with that hotel
            req.flash('success', 'You have successfully deleted the hotel!.');
            res.redirect('/hotels');
        }  
    });
});
module.exports = router;
