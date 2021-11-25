var express=require('express');
var app=express();
var session = require('express-session')
var compression = require('compression') 
app.use(compression())

app.use(express.static('public'));
app.use(session({
  secret: 'keyboard cat',
  resave: false,
  saveUninitialized: true,
  //store:new FileStore()
}))

app.use('/home',require('./home.js'));

console.log("시작!!");
app.listen(8080);
