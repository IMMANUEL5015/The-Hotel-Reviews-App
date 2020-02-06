require('dotenv').config();
const express = require('express');
const router = express.Router();
const passport = require('passport');
const User   = require('../models/user');
const Hotel = require('../models/hotel');
const async = require('async');
const resetPasswordUtilities = require('../utilities/resetPasswordUtilities');
const deleteAssociatedDocuments = require('../utilities/deleteAssociatedDocuments');
const sendMail = require('../utilities/sendMail');
const getAge = require('../utilities/getAge');
const middlewareObj = require('../middleware');
const Comment = require('../models/comment');
const Review = require('../models/review');
const Notification = require('../models/notification');
const escapeRegex = require('../utilities/escapeRegex');
const calculateAverage = require('../utilities/calculateAverage');
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

//Home Page Route
router.get("/", function(req, res){
    res.render('hotels/landing');
});

//=============================
//Auth Routes
//=============================

//Show registration form
router.get('/register', (req, res) => {
    res.render('users/register', {page: 'register'});
});

//Handle Sign Up Logic
router.post('/register', upload.single('profilePicture'), (req, res) => {
    const userAge = getAge(req.body.birthday); //Determine the age of the user
        const newUser = new User({ // Create the new user
            username: req.body.username,
            firstName: req.body.firstName,
            lastName: req.body.lastName,
            email: req.body.email,
            description: req.body.description,
            favouriteQuote: req.body.favouriteQuote,
            hobbies: req.body.hobbies,
            age: userAge,
            sex: req.body.sex,
            birthday: req.body.birthday,
            phoneNumber: req.body.phoneNumber,
            occupation: req.body.occupation
        });
    const password = req.body.password; 
    req.body.adminCode === process.env.ADMIN_CODE ? newUser.isAdmin = true : newUser.isAdmin = false;
    User.register(newUser, password, async (err, user) => {// Register the user with the application
        if(err){
            req.flash('error', err.message);
            return res.redirect('/register');
        }else{
            cloudinary.v2.uploader.upload(req.file.path, async function(err, result){ // Upload profile picture
                if(err){
                    req.flash('error', 'An error occured in uploading your profile image. Please try updating your profile picture.');
                    passport.authenticate('local')(req, res, () => {// Login the user
                        req.flash('success', 'Welcome to YelpCamp ' + user.username);
                        res.redirect('/hotels');
                    });
                }else{
                    user.profilePicture = result.secure_url;
                    user.profilePictureId = result.public_id;
                    await user.save(() => {
                        passport.authenticate('local')(req, res, () => {// Login the user
                            req.flash('success', 'Welcome to YelpCamp ' + user.username);
                            res.redirect('/hotels');
                        });
                    })
                }
            });
        }
    });
});

//Show login form
router.get('/login', (req, res) => {
    res.render('users/login', {page: 'login'});
});

//Handle Login logic
router.post('/login', passport.authenticate(('local'), {
        successRedirect: "/hotels",
        failureRedirect: "/login"
    }), (req, res) => {
});

//Handle logout logic
router.get('/logout', (req, res) => {
    req.logout();
    req.flash('success', "You have been logged out of the application.");
    res.redirect('/hotels');
});

//USER PROFILE
router.get("/users/:id", (req, res) => {
    User.findById(req.params.id, (err, foundUser) => {
        if(err || !foundUser){
            req.flash('error', 'Something went wrong, try again.'); 
            res.redirect('back');
        }else{
            res.render('users/show', {user: foundUser});
        }
    });
});

//Follow User
router.patch('/follow/:id', middlewareObj.isLoggedIn, async (req, res) => {
    await User.findById(req.params.id, async (err, user) => { //Find the user
        if(err || !user){
            req.flash('error', 'Something went wrong. Try again!');
            return res.redirect('/users/' + req.params.id);
        }else{
            if(req.params.id == req.user._id){ //users cannot follow themselves
                req.flash('error', 'You cannot be a follower of yourself.');
                return res.redirect('/users/' + req.params.id);
            }else{
                //You cannot follow the same user twice
                for(var i = 0; i < user.followers.length; i++){
                    if(user.followers[i].equals(req.user._id)){
                        i = user.followers.length + 1;  
                        req.flash('error', 'You cannot follow the same user twice.');
                        return res.redirect('/users/' + req.params.id);
                    }
                }
                user.followers.push(req.user._id); //The logged in user is now a follower if all conditions are met
                await user.save();
                req.flash('success', 'You are now a follower of ' + user.username);
                return res.redirect('/users/' + req.params.id); 
            }
        }
    });
});

router.delete('/unfollow/:id', middlewareObj.isLoggedIn, async (req, res) => {
    //Step 1: Find the leader and retrieve all his or her followers
    await User.findById(req.params.id).populate('followers').exec( async (err, user) => {
        if(err || !user){
            req.flash('error', 'Something went wrong. Try again!');
            return res.redirect('/users/' + req.params.id);
        }else{
            //Step 2: Remove the follower from the array of followers
            for(var i = 0; i < user.followers.length; i++){
                if(user.followers[i]._id.equals(req.user._id)){
                    user.followers.splice(i, 1);
                    //Step 3: Save the newly modified leader's data to the database
                    await user.save();
                    i = user.followers.length + 1;
                    req.flash('success', 'You have successfully unfollowed ' + user.username);
                   return  res.redirect('/users/' + req.params.id);
                }
            }
            req.flash('error', 'You are not following ' + user.username); //Error message if the logged in user is not a follower
            return res.redirect('/users/' + req.params.id);
        }
    });
});

//See all your notifications
router.get('/notifications', middlewareObj.isLoggedIn, async (req, res) => {
    await User.findById(req.user._id).populate({path: 'notifications', options: {sort: {"_id": -1}}}).populate('followers').exec( async (err, user) => {
        if(err || !user){
            req.flash('error', 'Something went wrong. Please try again');
            res.redirect('/users/' + req.user._id);
        }else{
            const allNotifications = user.notifications;
            const followers = user.followers;
            const hotels = await Hotel.find({}).where('author.id').equals(user._id);
            res.render('notifications/index', {allNotifications: allNotifications, followers: followers, hotels: hotels});
        }
    });
});

//See specific notification
router.get('/notifications/:id', middlewareObj.isLoggedIn, async (req, res) => {
    await Notification.findById(req.params.id, async (err, notification) => { //Retrieve the notification
        if(err || !notification){
            req.flash('error', 'Something went wrong. Please try again');
            return res.redirect('/notifications');  
        }else{
            for(var i = 0; i < req.user.notifications.length; i++){
                //User can access only their notifications
                if(req.user.notifications[i].equals(req.params.id)){
                    notification.isRead = true; //User reads the notification
                    await notification.save();
                    return res.redirect('/hotels/' + notification.hotelId);
                }
            }
            //A user cannot read the notification of another user
            req.flash('error', 'You cannot view the notification of another user!');
            return res.redirect('/notifications'); 
        }
    });
});

//Updating User Birthday
router.get('/users/:id/updatebirthday', middlewareObj.confirmUser, (req, res) => {
    User.findById(req.params.id, (err, user) => {
        if(err || !user){
            req.flash('error', 'Something went wrong or this user does not exist');
            res.redirect('back');
        }else{
            res.render('users/birthday', {user: user});
        }
    });
});     

router.patch('/users/:id/updatebirthday', middlewareObj.confirmUser, (req, res) => {
    const newAge = getAge(req.body.birthday);
    User.findByIdAndUpdate(req.params.id, {birthday: req.body.birthday, age: newAge}, {
        new: true,
        useFindAndModify: false
    }, (err, user) => {
        if(err || !user){
            req.flash('error', 'Something went wrong!');
            return res.redirect('back'); 
        }else{
            req.flash('success', 'Your age has been updated successfully');
            return res.redirect('/users/' + req.params.id);
        }
    });
});

//RESETTING USER PASSWORD
router.get('/forgotpassword', (req, res) => { //renders a forgot password form
    res.render('users/forgotpassword');
});

router.post('/forgotpassword', (req, res, next) => { //Sends a reset token to the user's email address
    async.waterfall([ //An array of functions that gets called one after the other
        function(done){
            resetPasswordUtilities.genResetToken(done); //Generate a reset token
        }, function(token, done){
            resetPasswordUtilities.attachResetToken(token, req.body.email, done, req, res); //Attach reset token to the user
        },
        function(token, user, done){ //Send reset token to the users email address
            const options = {
                subject: 'Reset Your Password',
                text: `You are recieving this email because you made a request to reset your password. If indeed you want to reset your password, please click on this link or paste it in your browser's tab: \n http://${req.headers.host}/resetpassword/${token} \n If you did not make or intend to make this request, please ignore this message and your password will remain unchanged.`
            }
            sendMail(user.email, options);
            console.log('mail sent');
            req.flash('success', `An email has been sent to ${user.email} with further instructions`);
            res.redirect('/forgotpassword');
        }
    ]);
});

router.get('/resetpassword/:token', (req, res) => { //Render Form for Password Reset
    User.findOne({resetPasswordToken: req.params.token, resetPasswordExpires :{$gt: Date.now()}}, (err, user) => {
        if(err || !user){
            req.flash('error', 'Password Reset Token is Either Invalid or has Expired.');
            res.redirect('/forgotpassword');
        }else{
            res.render('users/resetPassword', {token: req.params.token});
        }
    });
});

router.patch('/resetpassword/:token', (req, res) => { //Finally reset the user's password
    async.waterfall([
        function(done){ //Reset the password
            resetPasswordUtilities.resetPassword(User, req.params.token, req, res, req.body.newPassword, req.body.confirmPassword, done)
        },
        function(user, done){//Send confirmation message
            const options = { //The email message
                subject: 'Password Reset Successful',
                text: `This is a confirmation message that your password reset operation has completed successfully`
            }
            sendMail(user.email, options); //Send the email
            req.flash('success', 'Success! Your password has been changed!');
            res.redirect('/hotels');
        }
    ]);
});

//UPDATE PASSWORD
router.get('/users/:id/updatepassword', middlewareObj.confirmUser, (req, res) => { //render the update password form
    User.findById(req.params.id, (err, foundUser) => {
      if(err || !foundUser){
          req.flash('error', 'Something went wrong or this user does not exist!');
          res.redirect('/hotels');
      }else{
          res.render('users/updatepassword', {user: foundUser});
      }  
    });
});

router.patch('/users/:id/updatepassword', middlewareObj.confirmUser, (req, res) => { //Update the user password
    User.findById(req.params.id, (err, foundUser) => { //Find the user
        if(err || !foundUser){
            req.flash('error', 'Something went wrong or this user does not exist!');
            res.redirect('back');  
        }else{
            if(req.body.newPassword === req.body.confirmPassword){ //Ensure that the user's inputs matches correctly
                //Compare the current password
                foundUser.authenticate(req.body.currentPassword, (err, model, passwordError) => {
                    //Error if comparison fails
                    if(passwordError){
                        req.flash('error', 'The given password is incorrect');
                        return res.redirect('/users/' + foundUser._id + '/updatepassword');
                    }else if(model){
                       //If comparison is successful, change the current password to the new one
                       foundUser.setPassword(req.body.newPassword, (err) => {
                            //Save the user to the database
                            foundUser.save((err) => {
                                //Logout the user and redirect them to the login page
                                req.logout();
                                req.flash('success', 'Your password has been successfully updated! Please login with your new password.');
                                res.redirect('/login');
                            });
                       });
                    } 
                });
            }else{
                req.flash('error', 'Your Password fields do not match!');
                return res.redirect('/users/' + foundUser._id + '/updatepassword');
            }
        }
    });
});

//ONLY AN ADMIN SHOULD BE ABLE TO GET ALL THE USERS
router.get('/users', middlewareObj.confirmAdminUser, (req, res) => {
    let noUser;
    if(req.query.search){
        const regex = new RegExp(escapeRegex(req.query.search), 'gi');
        User.find({username: regex}, (err, allUsers) => { //Retrieve all the users
            if(err || !allUsers){ 
                req.flash('error', 'Either something went wrong or your application has no registered users');
                return res.redirect('/hotels');
            }else if(allUsers.length < 1){
                noUser = 'No Username Matches Your Search. Please Try Again.';
              res.render('users/index', {users: allUsers, noUser: noUser});  
            }else{
              res.render('users/index', {users: allUsers, noUser: noUser});  
            }
        });  
    }else{
        User.find({}, (err, allUsers) => { //Retrieve all the users
            if(err || !allUsers){ 
                req.flash('error', 'Either something went wrong or your application has no registered users');
                return res.redirect('/hotels');
            }else{
                res.render('users/index', {users: allUsers, noUser: noUser});  
            }
        });
    }
});

//EDIT USER

//edit form
router.get('/users/:id/edit', middlewareObj.confirmUser, (req, res) => {
    User.findById(req.params.id, (err, user) => {
        if(err || !user){
            req.flash('error', 'Something went wrong or this user does not exist');
            res.redirect('back');
        }else{
            res.render('users/edit', {user: user});
        }
    });
});

//Update the user
router.put('/users/:id', middlewareObj.confirmUser, upload.single('profilePicture'), async (req, res) => {
    req.body.user.sex = req.body.sex;
    if(req.body.adminCode === process.env.ADMIN_CODE){ //Update the user's admin status if the user passes the test
        req.body.user.isAdmin = true;
    }
    await User.findByIdAndUpdate(req.params.id, req.body.user, { //Finally update the user data
        new: true,
        useFindAndModify: false
    }, async (err, user) => {
        if(err || !user){
            req.flash('error', 'Something went wrong!');
            return res.redirect('back'); 
        }else{
            if(req.file){ //Check if there is a file to be uploaded
                await cloudinary.v2.uploader.destroy(user.profilePictureId); //Remove the current profile picture from cloudinary
                const result =  await cloudinary.v2.uploader.upload(req.file.path); //Upload a new profile picture to cloudinary
                user.profilePicture = result.secure_url;
                user.profilePictureId = result.public_id;
                await user.save(() => {
                    req.flash('success', 'Your details have been updated successfully');
                    return res.redirect('/users/' + req.params.id);
                });
            }
        }
    }); 
});

router.delete('/users/:id', middlewareObj.confirmUser, (req, res) => {
    User.findByIdAndDelete(req.params.id, async (err, deletedUser) => {
        if(err || !deletedUser){
            req.flash('error', 'Something went wrong!');
            return res.redirect('back');
        }else{
            //Delete all the Hotels, Reviews and comments associated with that user
            const userHotels = await Hotel.find({}).where('author.id').equals(req.params.id);
            const userComments = await Comment.find({}).where('author.id').equals(req.params.id);
            const userReview = await Review.find({}).where('author.id').equals(req.params.id);

            await deleteAssociatedDocuments(userHotels, Hotel, req.params.id); //Delete Associated hotels
            await deleteAssociatedDocuments(userComments, Comment, req.params.id); //Delete Associated hotels
            await deleteAssociatedDocuments(userReview, Review, req.params.id); //Delete Associated Review

            await cloudinary.v2.uploader.destroy(deletedUser.profilePictureId);//Delete the user profile picture from cloudinary

            //Delete all the user's hotel pictures from cloudinary
            for(var i = 0; i < userHotels.length; i++){
                await cloudinary.v2.uploader.destroy(userHotels[i].imageId);
            }

            //DELETE all the user notifications from the database
            for(var i = 0; i < deletedUser.notifications.length; i++){
                await Notification.findByIdAndDelete(deletedUser.notifications[i]);
            }

            //Ensure that the user id is no longer included in the array of followers of other users
            await User.find({}, async (err, allUsers) => {
                if(err || !allUsers){
                    req.flash('error', err.message);
                    return res.redirect('back');
                }
                allUsers.forEach(async function(user){
                    await User.findByIdAndUpdate(user._id, {$pull : {followers: req.params.id}}, {
                        new: true,
                        useFindAndModify: false
                    });
                });
            });

            //Re-calculate the rating of the hotel whose review has been deleted
            //Step 1: Find all the hotels that the user reviewed
            let reviewedHotels = [];
            for(var i = 0; i < userReview.length; i++){
                reviewedHotels.push(userReview[i].hotel);
            }
            //Step 2: Calculate the rating afresh for each hotel
            for(var i = 0; i < reviewedHotels.length; i++){
                await Hotel.findById(reviewedHotels[i]).populate('reviews').exec(async (err, hotel) => {
                    if(err){
                        req.flash('error', 'Something went wrong!');
                        return res.redirect('back');
                    }else{
                        hotel.rating = calculateAverage(hotel.reviews);
                        await hotel.save();
                    }
                });
            }

            req.flash('success', 'Successfully Deleted.');
            res.redirect('/hotels');
        }
    }); 
});

module.exports = router;