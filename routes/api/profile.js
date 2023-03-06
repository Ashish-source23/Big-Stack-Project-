const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const passport = require("passport");

//Load the Person Schema
const Person = require("../../models/Person");
//Load the Profile Schema
const Profile = require("../../models/Profile");

//@type   GET
//@route  /api/profile/
//@desc   route for personal user profile
//@access PRIVATE
router.get(
  "/",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    Profile.findOne({ user: req.user.id })
      .then((profile) => {
        if (!profile) {
          return res.status(404).json({ profileError: "Profile not found" });
        }
        res.json(profile);
      })
      .catch((err) => console.log("Error in finding the profile" + err));
  }
);

//@type   POST
//@route  /api/profile/
//@desc   route for UPDATING/SAVING personal user profile
//@access PRIVATE
router.post(
  "/",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    const profileValues = {};
    profileValues.user = req.user.id;
    if (req.body.username) profileValues.username = req.body.username;
    if (req.body.website) profileValues.website = req.body.website;
    if (req.body.country) profileValues.country = req.body.country;
    if (req.body.portfolio) profileValues.portfolio = req.body.portfolio;
    if (typeof req.body.languages !== undefined) {
      profileValues.languages = req.body.languages.split(",");
    }
    profileValues.socials = {};
    if (req.body.youtube) profileValues.socials.youtube = req.body.youtube;
    if (req.body.facebook) profileValues.socials.facebook = req.body.facebook;
    if (req.body.instagram)
      profileValues.socials.instagram = req.body.instagram;

    //Database stuff
    Profile.findOne({ user: req.user.id })
      .then((profile) => {
        if (profile) {
          //User existed with the user id and therefore we'll update the data
          Profile.findOneAndUpdate(
            { user: req.user.id },
            { $set: profileValues },
            { new: true }
          )
            .then((profile) => res.json(profile))
            .catch((err) =>
              console.log("Problem in updating the profile" + err)
            );
          // user is not found with the user id
        } else {
          Profile.findOne({ username: profileValues.username })
            .then((profile) => {
              //Username already existed
              if (profile) {
                res.status(400).json({ username: "Username already exists" });
              }
              //user profile is empty so we'll save the data
              new Profile(profileValues)
                .save()
                .then((profile) => res.json(profile))
                .catch((err) => console.log(err));
            })
            .catch((err) => console.log(err));
        }
      })
      .catch((err) => console.log("Error in fetching the profile" + err));
  }
);

//@type   GET
//@route  /api/profile/user/:username
//@desc   route for getting user profile based on USERNAME
//@access PUBLIC
router.get("/user/:username", (req, res) => {
  Profile.findOne({ username: req.params.username })
    .populate("user", ["name", "profilePic"])
    .then((profile) => {
      if (!profile) {
        res.status(404).json({ UsernameError: "Username dosen't exist" });
      }
      res.json(profile);
    })
    .catch((err) => console.log("Error in finding the user profile " + err));
});

//@type   GET
//@route  /api/profile/all
//@desc   route for getting profiles of ALL the users
//@access PUBLIC
router.get("/all", (req, res) => {
  Profile.find({})
    .populate("user", ["name", "profilePic"])
    .then((profiles) => {
      if (!profiles) {
        res.status(404).json({ profileError: "No profiles found" });
      }
      res.json(profiles);
    })
    .catch((err) => console.log("Error in catching profiles " + err));
});

//@type   DELETE
//@route  /api/profile/
//@desc   route for deleting the profile of the user
//@access PRIVATE
router.delete(
  "/",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    Profile.findOne({ user: req.user.id }); //kindof a defence line ,for example throwing some message to the user that if he/she wanna remove his/her profile or not
    Profile.findOneAndRemove({ user: req.user.id })
      .then(() => {
        Person.findOneAndRemove({ _id: req.user.id })
          .then(() => {
            res.json("Removed Successfully");
          })
          .catch((err) => console.log(err));
      })
      .catch((err) => console.log(err));
  }
);

//@type   POST
//@route  /api/profile/:username/workrole
//@desc   route for adding WORKROLE in the profile of a user
//@access PRIVATE
router.post(
  "/:username/workrole",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    Profile.findOne({ user: req.user.id })
      .then((profile) => {
        if (!profile) {
          res.status(404).json({ profileError: "Error in finding the error" });
        }
        const newWork = {
          role: req.body.role,
          company: req.body.company,
          country: req.body.country,
          from: req.body.from,
          to: req.body.to,
          current: req.body.current,
          details: req.body.details,
        };
        profile.workrole.unshift(newWork);
        profile
          .save()
          .then((profile) => res.json(profile))
          .catch((err) => console.log("Error in saving the profile " + err));
      })
      .catch((err) => console.log("Error in finding the profile " + err));
  }
);

//@type   DELETE
//@route  /api/pofile/workrole/:w_id
//@desc   route for deleting a workrole object inside the workrole array by workrole ID(w_id)
//@access PRIVATE
router.delete(
  "/workrole/:w_id",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    Profile.findOne({ user: req.user.id })
      .then((profile) => {
        if (!profile) {
          res.status(404).json({ userError: "User profile dosen't exist" });
        }
        const removethis = profile.workrole
          .map((item) => item.id)
          .indexOf(req.params.w_id);

        profile.workrole.splice(removethis, 1);

        profile
          .save()
          .then((profile) => res.json(profile))
          .catch((err) => console.log("Error in saving the profile " + err));
      })
      .catch((err) => console.log("Error in finding the user " + err));
  }
);

module.exports = router;
