// Purpose: Handle all routes related to authentication
// Create the express router and import the User and UserSettings schemas
const express = require("express");
const User = require("../schemas/User.model");
const UserSettings = require("../schemas/UserSettings.model");
// Import the jsonwebtoken package
const jwt = require("jsonwebtoken");
const rateLimit = require("express-rate-limit");
const {
  ensureNoToken,
  authenticateToken,
  auth
} = require("../utils/authUtils.js");
// Create the express router
const router = express.Router();

// Home route - Render home page with user information
// Simple rate limiter to prevent abuse
const homeLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});

// Route to render the signin page
router.get("/signin", homeLimiter, ensureNoToken, (req, res) => {
  res.render("signin", { error: req.query.err, message: req.query.message });
});

router.post("/login", homeLimiter, async (req, res) => {
  let idToken = req.cookies["idToken"];
  let user;
  if (idToken == null) {
    return res.redirect("/signin");
  }

  await auth.verifyIdToken(idToken).then((decodedToken) => {
    user = decodedToken;
  })
  .catch((err) => {
    res.clearCookie("idToken");
    res.redirect("/signin");
  });

  // Check if the user exists cause if they don't it's a problem
  if (!user) {
    return res.redirect("/signin");
  }

  // Get the user email from the user object
  const email = user.email;

  let alreadyUser;

  try {
    alreadyUser = await User.findOne({ email });
  } catch (err) {
    res.status(500).send("An error occurred");
    return;
  }

  if (alreadyUser) {
    return res.redirect("/");
  } else {
    let userCheckIfExist;

    try {
      // Check if the user email already exists in the database
      userCheckIfExist = await User.findOne({
        email,
      });
    } catch (err) {
      // Log the error and redirect to the signup page with an error message
      console.error("Error finding user with email to check if email exists: " + err);
      res.redirect("/signin");
      return;
    }

    // Check if the user already exists in the database
    if (userCheckIfExist) {
      res.redirect("/signin");
      return;
    }

    firstName = user.name.split(" ")[0];
    lastName = user.name.split(" ", 2)[1];

    // Create a new user in the database
    const newUser = new User({
      firstName: firstName,
      lastName: lastName,
      email: email,
      admin: false,
      address: false,
      privacy: false,
    });

    // Save the new user to the database
    try {
      await newUser.save();
    } catch (err) {
      return res.redirect("/signin");
    }
    return res.redirect("/");
  }
});

// Route to log out the user and clear the auth token
router.get("/logout", (req, res) => {
  // Clear the auth token cookie and redirect to signin page
  res.clearCookie("idToken");
  res.redirect("/signin?message=You have been signed out.");
});

// Route to handle user sign in
module.exports = router;
