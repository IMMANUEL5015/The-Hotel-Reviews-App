require('dotenv').config();
const express         = require('express'),
    bodyParser        = require('body-parser'),
    app               = express(),
    mongoose          = require('mongoose'),
    flash             = require('connect-flash'),
    passport          = require('passport'),
    methodOverride    = require('method-override'),
    localStrategy     = require('passport-local'),
    User              = require('./models/user');

//ROUTES
const hotelRoutes = require('./routes/hotel'),
      commentRoutes    = require('./routes/comment'),
      reviewRoutes     = require('./routes/review'),
      indexRoutes      = require('./routes/index'); 

//Connect to database
mongoose.connect(process.env.MONGODBURI, {useUnifiedTopology: true, useNewUrlParser: true, useCreateIndex: true});

//use body-parser
app.use(bodyParser.urlencoded({extended:true}));

//all rendered files should be in ejs format
app.set('view engine', 'ejs');

//connect all custom stylesheets and front-end JavaScript
app.use(express.static(__dirname + "/public"));

//Override methods to include PUT and DELETE
app.use(methodOverride("_method"));

//Use connect-flash
app.use(flash());

//Use momentjs
app.locals.moment = require('moment');

//Passport Configurations
app.use(require('express-session')({
    secret: "Please give me something to drink from the fountain of memory.",
    resave: false,
    saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());
passport.use(new localStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

//Pass the logged in user's data to every template
app.use( async function(req, res, next){
    res.locals.currentUser = req.user;
    res.locals.error = req.flash('error');
    res.locals.success = req.flash('success');
    if(req.user){
        let user = await User.findById(req.user._id).populate('notifications',  null, {isRead: false}).exec();
        let unReadNotifications = user.notifications.reverse();
        res.locals.unReadNotifications = unReadNotifications;
    }
    next();
});

//Use The Routes
app.use("/hotels", hotelRoutes);
app.use("/hotels/:id/comments", commentRoutes);
app.use("/hotels/:id/reviews", reviewRoutes);
app.use(indexRoutes);

//Start Server
app.listen(process.env.PORT || 3000, process.env.IP, function(){
    console.log('The YelpCamp Server has started on port 3000');
});