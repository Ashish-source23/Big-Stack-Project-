const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const personSchema = new Schema({
  name: {
    type: String,
    default: true,
  },
  email: {
    type: String,
    default: true,
  },
  password: {
    type: String,
    default: true,
  },
  profilePic: {
    type: String,
    default: "https://cdn-icons-png.flaticon.com/512/1177/1177568.png",
  },
  username: {
    type: String,
  },
  date: {
    type: Date,
    default: Date.now,
  },
});

module.exports = Person = mongoose.model("myPerson", personSchema);
