const crypto = require('crypto');
const User   = require('../models/user');

let resetPasswordUtilities = {};

//Generate a reset token
resetPasswordUtilities.genResetToken = function(done){
    crypto.randomBytes(20, (err, buf) => {
        var token = buf.toString('hex');
        done(err, token);
    });
}

//Attach the reset token to the user's data which expires in exactly one hour
resetPasswordUtilities.attachResetToken = function(token, email, done, req, res){
    User.findOne({email: email}, (err, user) => { 
        if(err || !user){
            req.flash('error', 'No user with that email address exist.');
            res.redirect('/forgotpassword');
        }else{
            user.resetPasswordToken = token;
            user.resetPasswordExpires = Date.now() + (60 * 60 * 1000);
            user.save((err) => {
                done(err, token, user);
            });
        }
    });
}

resetPasswordUtilities.resetPassword = function(User, token, req, res, newPassword, confirmPassword, done){
    User.findOne({resetPasswordToken: token, resetPasswordExpires: {$gt:Date.now()}}, (err, user) => { //Find the user
        if(err || !user){
            req.flash('error', 'Token is invalid or has expired'); //Error if token has expired
            res.redirect('/forgotpassword');
        }else{
            if(newPassword === confirmPassword){ //Ensure that the user's inputs matches correctly
                user.setPassword(newPassword, (err) => { //Reset the password
                    user.resetPasswordToken = undefined;
                    user.resetPasswordExpires = undefined;//Remove redundant data
                    user.save((err) => {
                        req.logIn(user, (err) => { //Log the user in
                            done(err, user);
                        });
                    });
                });
            }else{//Error if user's inputs do not match correctly
                req.flash('error', 'Passwords do not match!');
                res.redirect('/resetpassword/' + token); 
            }
        }
    });
}

module.exports = resetPasswordUtilities;