var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var expressLayouts = require('express-ejs-layouts')
const session= require('express-session')
const nocache = require('nocache')
const cors =  require('cors')

require('dotenv').config();

//Database connection
const db = require("./models/connection");

var userRouter = require('./routes/user');
var adminRouter = require('./routes/admin');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
const oneDayMilliseconds = 24 * 60 * 60 * 1000; // 1 day in milliseconds

app.use(cors())
app.use(expressLayouts)
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({secret:"key", resave: true,saveUninitialized: true,cookie: {
  maxAge: oneDayMilliseconds, // Set cookie's max age to 1 day
  expires: new Date(Date.now() + oneDayMilliseconds) // Set session's expiration to 1 day from now
}}))
app.use(nocache())

app.use('/', userRouter);
app.use('/admin', adminRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
