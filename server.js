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

const yakobjFccRocks = {
  _id: "603c93ca7bd9ef062c3ed356",
  username: "yakhousam",
  date: "Sun Feb 10 2019",
  duration: 60,
  description: "boxing",
};
const yakobjLocalHost = {
  _id: "603c94ad7d39ed36a09c06c1",
  username: "yakhousam",
  description: "boxing",
  duration: 60,
  date: "2019-02-10",
};

app.post("/api/exercise/add", (req, res) => {
  const requestObj = {};
  const { userId, description, duration } = req.body;
  let { date } = req.body;
  User.find({ _id: userId })
    .then((data) => {
      if (data && data.length > 0) {
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
            console.log(data.date, "the data date");
            date = data.date.toDateString();
            console.log(date, "the date after fccwants it");
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
            console.log(err, "the err");
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

//yak id 603c94ad7d39ed36a09c06c1 localhost
//yak id 603c93ca7bd9ef062c3ed356 fcc rocks

//http://localhost:3000/api/exercise/log?userId=603c94ad7d39ed36a09c06c1&from=1970-01-01&to=2021-02-28&limit=3
// https://exercise-tracker.freecodecamp.rocks/api/exercise/log?userId=603c93ca7bd9ef062c3ed356&from=1970-01-01&to=2021-01-28&limit=3

// You can make a GET request to /api/exercise/log with a parameter of userId=_id to retrieve a full exercise log of any user. The returned response will be the user object with a log array of all the exercises added. Each log item has the description, duration, and date properties.

const fcclogResObj = {
  _id: "603c93ca7bd9ef062c3ed356",
  username: "yakhousam",
  count: 3,
  log: [
    {
      description: "running",
      duration: 30,
      date: "Mon Mar 01 2021",
    },
    {
      description: "snowboarding",
      duration: 30,
      date: "Mon Feb 01 2021",
    },
    {
      description: "boxing",
      duration: 60,
      date: "Sun Feb 10 2019",
    },
  ],
};
app.get("/api/exercise/log", (req, res) => {
  // console.log(req.query)
  // const { userId, from, to, limit } = req.query;
  const {
    userId,
    from = "1980-01-01",
    to = Date.now(),
    limit = 100,
  } = req.query;
  console.log("userId=", userId);
  const resultObject = {};
  User.findById(userId, (err, data) => {
    if (!data) {
      console.log("got here");
      res.send("Unknown userId");
    }
    console.log(data, "data");
    let { username } = data;
    console.log(username, "username above");
    Exercise.find(
      { userId },
      { date: { $gt: new Date(from), $lt: new Date(to) } }
    )
      .select(["id", "duration", "date", "description"])
      .limit(Number(limit))
      .exec((err, data) => {
        if (data) {
          console.log("here data=", data);
          // return res.json(data);
          console.log("username below=", username);
          resultObject._id = userId;
          resultObject.username = username;
          resultObject.count = data.length;
          return res.json(resultObject);
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
});

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/views/index.html");
});

app.post("/api/exercise/new-user", (req, res) => {
  const responseObject = {};
  const username = req.body.username;
  const newUser = new User({ username });
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
