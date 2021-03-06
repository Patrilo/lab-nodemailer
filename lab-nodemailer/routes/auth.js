const express = require("express");
const passport = require("passport");
const router = express.Router();
const User = require("../models/User");
require('dotenv').config()
// Bcrypt to encrypt passwords
const bcrypt = require("bcrypt");
const bcryptSalt = 10;
const nodemailer = require("nodemailer")

router.get("/login", (req, res, next) => {
  res.render("auth/login", { message: req.flash("error") });
});

router.post(
  "/login",
  passport.authenticate("local", {
    successRedirect: "/",
    failureRedirect: "/auth/login",
    failureFlash: true,
    passReqToCallback: true
  })
);

router.get("/signup", (req, res, next) => {
  res.render("auth/signup");
});

router.post("/signup", (req, res, next) => {
  const username = req.body.username;
  const password = req.body.password;
  const email = req.body.email;
  if (username === "" || password === "") {
    res.render("auth/signup", { message: "Indicate username and password" });
    return;
  }

  User.findOne({ username }, "username", (err, user) => {
    if (user !== null) {
      res.render("auth/signup", { message: "The username already exists" });
      return;
    }

    const salt = bcrypt.genSaltSync(bcryptSalt);
    const hashPass = bcrypt.hashSync(password, salt);

    const code =
      "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXY";
    const hashCode = bcrypt.hashSync(code, salt);

    const newUser = new User({
      username,
      password: hashPass,
      email,
      confirmationCode: hashCode
    });

   
      console.log(process.env.userEmail)
        

        newUser.save().then(() => {
          let transporter = nodemailer.createTransport({
            service: "Gmail",
            auth: {
              user: process.env.userEmail,
              pass: process.env.userPassword
            }
          });
          transporter
            .sendMail({
              from: '"My Awesome Project 👻" <myawesome@project.com>',
              to: email,
              subject:"Daily",
              text:"Daily",
              html: `http://localhost:3000/auth/confirm/${newUser.confirmationCode}`
            })
            .then(info =>
              res.render("message", { email, subject, message, info })
            )
            .catch(error => console.log(error));
        });
      })
      // .catch(err => {
      //   res.render("auth/signup", { message: "Something went wrong" });

});

router.get("/logout", (req, res) => {
  req.logout();
  res.redirect("/");
});

module.exports = router;
