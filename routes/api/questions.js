const express = require("express");
const router = express.Router();
const passport = require("passport");
const mongoose = require("mongoose");

//Load the Person Schema
const Person = require("../../models/Person");

//Load the Profile Schema
const Profile = require("../../models/Profile");

//Load the Question Schema
const Question = require("../../models/Question");

//@type   GET
//@route  /api/questions/
//@desc   route for getting all the questions
//@access PUBLC
router.get("/", (req, res) => {
  Question.find()
    .sort({ date: -1 })
    .then((questions) => res.json(questions))
    .catch((err) => console.log({ questionError: "No question found" }));
});

//@type   POST
//@route  /api/questions/
//@desc   route for posting the question
//access  PRIVATE
router.post(
  "/",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    const newQuestion = new Question({
      user: req.user.id,
      textone: req.body.textone,
      texttwo: req.body.texttwo,
      name: req.body.name,
    });

    newQuestion
      .save()
      .then((question) => res.json(question))
      .catch((err) => console.log("Error in saving the question " + err));
  }
);

//@type   POST
//@route  /api/questions/answers/:q_id
//@desc   route for posting answers for the question with id i.e q_id
//@access PRIVATE
router.post(
  "/answers/:q_id",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    Question.findOne({ question: req.params.q_id })
      .then((question) => {
        const newAnswer = {
          user: req.user.id,
          answer: req.body.answer,
          name: req.body.name,
        };

        question.answers.unshift(newAnswer);
        question
          .save()
          .then((question) => res.json(question))
          .catch((err) => console.log("Error in saving the answer " + err));
      })
      .catch((err) =>
        console.log("Error in finding the question with q_id " + err)
      );
  }
);

//@type   POST
//@route  /api/questions/upvote/:q_id
//@desc   route for upvoting by question id ie q_id
//@access PRIVATE
router.post(
  "/upvote/:q_id",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    Profile.findOne({ user: req.user.id })
      .then((profile) => {
        Question.findById(req.params.q_id)
          .then((question) => {
            if (
              question.upvotes.filter(
                (upvote) => upvote.user.toString() === req.user.id.toString()
              ).length > 0
            ) {
              return res.status(400).json({ noUpVote: "Already upvoted " });
            }
            question.upvotes.unshift({ user: req.user.id });
            question
              .save()
              .then((question) => res.json(question))
              .catch((err) =>
                console.log("Error in saving the profile " + err)
              );
          })
          .catch((err) => console.log("Error in finding the question " + err));
      })
      .catch((err) => console.log("Error in finding the profile " + err));
  }
);

module.exports = router;
