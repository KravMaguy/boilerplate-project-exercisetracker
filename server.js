require("dotenv").config();
const express = require("express");
const app = express();
const cors = require("cors");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));
const connection = process.env.connection;
mongoose.connect(connection, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
if (!connection) {
  throw new Error("Required connection missing");
} else {
  console.log(connection);
}

const Schema = mongoose.Schema;
const userSchema = new Schema({
  username: {
    type: String,
    required: "enter a username",
  },
});
const User = mongoose.model("User", userSchema);

const exerciseSchema = new Schema({
  userId: { type: String, required: true },
  description: { type: String, required: true },
  duration: { type: Number, required: true },
  date: { type: Date, required: true },
});
const Exercise = mongoose.model("Exercise", exerciseSchema);
app.post("/api/exercise/add", (req, res) => {
  const requestObj = {};
  const { userId, description, duration, date } = req.body;
  User.find({ _id: userId })
    .then((data) => {
      if (data && data.length > 0) {
        //  res.send(data)
        // console.log('data: ', data)

        // const date=new Date()
        if (!date) {
          console.log("he did not enter");
          date = new Date();
        }
        console.log(data, "data above");
        const username = data[0].username;
        const newExercise = new Exercise({
          userId,
          duration,
          description,
          date,
        });
        newExercise
          .save()
          .then((data) => {
            console.log(data, "data below");
            console.log(username, "username below");
            console.log("0");
            res.json({
              _id: userId,
              username,
              description,
              duration: Number(duration),
              date,
            });
          })
          .catch((err) => {
            console.log("2");
            res.send(err);
          });
      } else {
        res.send("user Id does not exist");
      }
    })
    .catch((err) => {
      console.log("3");
      res.send(err);
    });
});

//http://localhost:3000/api/exercise/log?userId=603b703ee1054b2014e06dcd&from=1970-01-01&to=2021-02-28&limit=3
app.get("/api/exercise/log", (req, res) => {
  // console.log(req.query)
  const { userId, from, to, limit } = req.query;
  Exercise.find(
    { userId },
    { date: { $gt: new Date(from), $lt: new Date(to) } }
  )
    .select(["id", "duration", "date", "description"])
    .limit(Number(limit))
    .exec((err, data) => {
      if (data) {
        console.log("here data");
        return res.send(data);
      }
      if (err) {
        console.log("here");
        res.send(err);
      } else {
        console.log("here in the else");
        res.send({});
      }
    });
});
app.get("/", (req, res) => {
  res.sendFile(__dirname + "/views/index.html");
});

app.post("/api/exercise/new-user", (req, res) => {
  const responseObject = {};
  const username = req.body.username;
  const newUser = new User({ username: username });
  newUser.save().then((data) => {
    console.log(data, "data");
    const username = data.username;
    const _id = data._id;
    responseObject["_id"] = _id;
    responseObject["username"] = username;
    console.log("sending username");
    res.send(responseObject);
  });
  console.log("im logged first because save is async");
});

app.get("/api/exercise/users", (req, res) => {
  const requestObj;
  User.find({}).then((data) => {
    // requestObj.push(data)
    res.json(data);
  });
});

// POST to /api/exercise/add with form data userId=_id, description, duration, and optionally date. If no date is supplied, the
//{"_id":"5ec3c38cc530e526ad533782","username":"5WfZFvsBK","date":"Thu Feb 25 2021","duration":30,"description":"run"}

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log("Your app is listening on port " + listener.address().port);
});
