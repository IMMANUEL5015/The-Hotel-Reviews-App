# The Hotel Reviews App

The app can be found at [https://hotel-reviews-app.herokuapp.com/](https://hotel-reviews-app.herokuapp.com/)

## Overview of the Application
This Full Stack Web Application allows its users to write reviews and comments about hotels.

First, a user has to signed up. Once signed up, they can submit information about any hotel to the app.

Users can then make comments and write reviews about the hotel.

## Purpose of the App
I built this app for the primary purpose of showcasing my knowledge in building Full Stack Web Applications with JavaScript.

## Major Tools and Technologies Used in this Project
    Please note that you need at least basic knowledge of following technologies in order to set up the app properly.
* HTML (Define the structure of the web pages)
* CSS (Styling the web pages)
* BOOTSTRAP (HTML/CSS Framework for creating responsive web pages)
* EJS (Template Engine For Embedding JavaScript code into HTML)
* JAVASCRIPT (Adding logic to the web application)
* NODEJS (Server side Javascript)
* EXPRESS (Node.js Framework for creating server side apps)
* MONGODB (NoSQL database for implementing data persistence)
* CLOUDINARY (Storing images of the application's users and hotels)
* GOOGLE MAPS (Display map of the hotel's location)
* PASSPORT, PASSPORT-LOCAL and PASSPORT-LOCAL-MONGOOSE (Implementing User Authentication)
* NODEMAILER (Sending emails to users of the app)
* MAILTRAP (Trapping the emails we send in our development environment, so they don't actually get sent to the user's email address)

## Local Development
This Hotel Reviews App requires Node version 10.16.0 to run succesfully.

```
    * Clone this repo to your local machine using the "git clone <repo url>" command.
    * Using the Terminal, navigate to the cloned repository.
    * Install all the project's dependencies using the "npm install -d" command
    * Create an account with MongoDB and set up a Database.
    * Create an account with Mailtrap and Cloudinary.
    * Also create a Google Developer Account and a project. Then enable the Maps JavScript API and the GEOCODER API for the project. Ensure to get two API keys, one key for each API and restrict the API key for the Maps JavaScript API only.
    * Create a .env file and set the following variables:
        * MONGODBURI=your_mongodb_uri
        * EMAIL_USERNAME=your_mailtrap_username
        * EMAIL_PASSWORD=your_mailtrap_password
        * EMAIL_HOST=smtp.mailtrap.io
        * EMAIL_PORT=2525
        * ADMIN_CODE=any_code_of_your_choice
        * CLOUDINARY_API_KEY=your_cloudinary_api_key
        * CLOUDINARY_API_SECRET=your_cloudinary_api_secret
        * GEOCODER_API_KEY=your_geocoder_api_key 
    * In the show.ejs page located at views/hotels/show.ejs, replace my restricted API key with your own:
        <script async defer src="https://maps.googleapis.com/maps/api/js?key=your_restricted_maps_javascript_api_key&callback=initMap"></script>
    * Start the server using the command "node app.js" or "npm start"
    * Congratulations.Your app should be up and running
```

## TABLE OF CONTENTS
* [Users](#users)
* [Admin roles](#admin-roles)
* [Hotels](#hotels)
* [Comments](#comments)
* [Reviews](#reviews)
* [Notifications](#notifications)
* [Areas for improvement](#areas-for-improvement)
* [Notice](#notice)

## Users
* Users can be signed up with the app.
* Existing logged out users can log back into the app.
* Users can log out of the application.
* Users can view their profile page and that of other users.
* Users can update only their birthday data
* Users can reset only their password if they forget or lose it.
* Users can update only their password if it's compromised.
* Users can update only their own information
* Users can delete themselves from the app whenever they want.

## Admin roles
* An admin user is a very powerful figure in the context of this app.
* An admin is the only one that can see all the users of the app on a specific dashboard.
* An admin can edit or delete the data of any user.
* An admin can edit or delete the data of any hotel. 
* An admin can edit or delete any comment.

## Hotels
 * Both visitors and users can see all the hotels that have been submitted to the app.
 * Both visitors and users can view the details of each specific hotel.
 * Logged in users can submit a new hotel to the app.
 * Logged in users can update the details of only hotels that they submitted to the app.
 * Logged in users can delete the details of only hotels that they submitted to the app.

## Comments
* Logged in users can make comments on submitted hotels.
* Both visitors and logged in users can view the comments that pertain to a specific hotel.
* Logged in users can edit only their own comments.
* Logged in users can delete only their own comments.

## Reviews
* Logged in users can write reviews concerning submitted hotels.
* Logged in users can leave only one review per hotel.
* Both visitors and logged in users can view the reviews that pertain to a specific hotel.
* Logged in users can edit only their own reviews.
* Logged in users can delete only their own reviews.

## Notifications
* A user can become a follower of other users.
* Becoming a follower of a user, implies that whenever they submit a new hotel to the app, you will be notified.
* A user can unfollow any user that they are currently following.
* Unfollowing a user, implies that you will no longer be notified whenever they submit a new hotel to the app.
* Users can also view all their past notifications.

## Areas for improvement
    The following are suggested areas for improvement:
* Some of the routes are filled with a lot of code. They could be broken out into seperate functions.
* We could expand the notification system to include Users, Comments, Reviews and even for Editing and Deleting a Hotel.
* We could make it so that an Admin will be notified of anything important that occurs in the app whether they are following other users or not.
* We could generate a single notification and send it to all the followers of a user, instead of generating one notification per follower anytime a hotel is created.
* We could improve the overall styling and layout of the web pages.
* Use sendgrid for sending emails instead of mailtrap.
* You are welcome to come up with more suggestions.

## Notice
* Right now, mailtrap is used for sending emails. This means that the users do not actually recieve the email. Instead, they are trapped in our development environment.
