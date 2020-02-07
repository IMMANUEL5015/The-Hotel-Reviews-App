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