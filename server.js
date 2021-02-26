require("dotenv").config();
const express = require('express')
const app = express()
const cors = require('cors')
const mongoose = require("mongoose");

app.use(cors())
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
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});





const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})