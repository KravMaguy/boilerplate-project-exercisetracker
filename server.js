require("dotenv").config();
const express = require("express");
const app = express();
const cors = require("cors");
const mongoose = require("mongoose");
var bodyParser = require("body-parser");
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

const exerciseSchema = new Schema(
  {
    userId: { type: String, required: true },
    description: { type: String, required: true },
    duration: { type: Number, required: true },
    date: { type: Date, required: true },
  }
);
const Exercise= mongoose.model("Exercise", exerciseSchema)
app.post("/api/exercise/add", (req, res) => {
  let requestObj={};
  let {userId, description,duration,date}=req.body
  User.find({_id:userId}).then((data) => {
   if(data&&data.length>0){
    //  res.send(data)
    // console.log('data: ', data)
     
    // let date=new Date()
    if(!date){
      console.log('he did not enter')
      date=new Date()
    }
    console.log(data, 'data above')
    let username=data[0].username
    let newExercise = new Exercise({ userId, duration, description, date });
    newExercise.save()
      .then(data=>{
        console.log(data, 'data below')
        console.log(username, 'username below')
        console.log('0')
        res.json({_id:userId,username,description,duration:Number(duration),date})
      })
        .catch(err=>{
          console.log('2')
          res.send(err)})
    } else {
      res.send('user Id does not exist')
    }
  }) .catch((err) => {
    console.log('3')
    res.send(err)});
});

// {"_id":"603b6f987bd9ef062c3ed322","username":"abrahimusmaximus","date":"Sun Jul 01 2001","duration":60,"description":"boxing"}

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/views/index.html");
});

app.post("/api/exercise/new-user", (req, res) => {
  let responseObject = {};
  let username = req.body.username;
  let newUser = new User({ username: username });
  newUser.save().then((data) => {
    console.log(data, "data");
    let username = data.username;
    let _id = data._id;
    responseObject["_id"] = _id;
    responseObject["username"] = username;
    console.log("sending username");
    res.send(responseObject);
  });
  console.log("im logged first because save is async");
});

app.get("/api/exercise/users", (req, res) => {
  let requestObj;
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