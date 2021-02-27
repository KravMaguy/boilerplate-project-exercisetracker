require("dotenv").config();
const express = require('express')
const app = express()
const cors = require('cors')
const mongoose = require("mongoose");
var bodyParser = require('body-parser')
app.use(cors())
app.use(bodyParser.urlencoded( {extended:true }))
app.use(express.static('public'))
const connection=process.env.connection
mongoose.connect(connection, {
  useNewUrlParser: true,useUnifiedTopology: true
});
if(!connection){
  throw new Error('Required connection missing');
} else {
  console.log(connection)
}

const Schema = mongoose.Schema;
const userSchema= new Schema({
  username: {
    type: String,
    required: 'enter a username'
  }
})
const User=mongoose.model('User', userSchema);

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});

app.post('/api/exercise/new-user', (req, res) => {
 let responseObject={}
 let username=req.body.username
 let newUser=new User({username:username})
 newUser.save()
 .then((data)=>{
   console.log(data, 'data')
   let username=data.username
   let _id=data._id
   responseObject['_id']=_id
   responseObject['username']=username
   console.log('sending username')
   res.send(responseObject)
  })
  console.log('im logged first because save is async')
});

app.get('/api/exercise/users', (req, res)=>{
  let requestObj;
  User.find({})
  .then(data=>{
    // requestObj.push(data)
    res.json(data)
  })
  
})




const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})