// Setting the requirements
const express = require("express");
const mongoose = require("mongoose");
const bodyparser = require("body-parser");
const passport = require("passport");

const app = express();

const PORT = process.env.PORT || 3000;

//bring all routes
const auth = require("./routes/api/auth");
const profile = require("./routes/api/profile");
const questions = require("./routes/api/questions");

//Mongoose configuration
const db = require("./setup/myurl").mongoURL;
mongoose.set("strictQuery", "false");

//Middleware Body-Parser
app.use(bodyparser.urlencoded({ extended: false }));

//Attempt to connect to MongoDB
mongoose
  .connect(db)
  .then(() => {
    console.log("MongoDB is connected");
  })
  .catch((err) => {
    console.log(err);
  });

//Passport initialization
app.use(passport.initialize());

//Configuration for JWT strategy
require("./strategies/jsonwtStrategy")(passport);

//route for testing
app.get("/", (req, res) => {
  res.send("Hello");
});

//actual routes
app.use("/api/auth", auth);
app.use("/api/profile", profile);
app.use("/api/questions", questions);

//route - Listen
app.listen(PORT, () => {
  console.log(`Server started on "http://localhost:${PORT}"`);
});
