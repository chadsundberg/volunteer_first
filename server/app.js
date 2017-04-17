var express = require('express');
var app = express();
var path = require('path');
var bodyParser = require('body-parser');
var decoder = require('./modules/decoder');
var privateData = require('./routes/private-data');
var portDecision = process.env.PORT || 5000;

//this code is from express-csv-enc
// var express = require('express')
//   , csv = require('express-csv')
//   , app = module.exports = express.createServer();
//
// csv.encoding = 'win1251';
//
// app.get('/', function(req, res) {
//   res.csv([
//     ["a", "b", "c"]
//   , ["d", "e", "f"]
//   ]);
// });
// this ends the code from express-csv-enc


app.get('/', function(req, res){
  res.sendFile(path.resolve('./public/views/index.html'));
});

app.use(express.static('public'));
app.use(bodyParser.json());

// Decodes the token in the request header and attaches the decoded token to req.decodedToken on the request.
app.use(decoder.token);

/* Whatever you do below this is protected by your authentication. */

// This is the route for your secretData. The request gets here after it has been authenticated.
app.use("/privateData", privateData);

app.listen(portDecision, function(){
  console.log("Listening on port: ", portDecision);
});
