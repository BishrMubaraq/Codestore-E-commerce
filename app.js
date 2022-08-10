const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const hbs = require('express-handlebars')
const db = require('./config/connection')
const session = require('express-session')
const nocache = require('nocache')
const adminRouter = require('./routes/admin');
const vendorRouter = require('./routes/vendor')
const usersRouter = require('./routes/users');
const dotenv = require('dotenv')
dotenv.config()



const app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');
app.engine('hbs', hbs.engine({
  helpers: {
    inc: function (value, options) {
      return parseInt(value) + 1;
    }
  }, extname: 'hbs', layoutsDir: __dirname + '/views/layouts/', userDir: __dirname + '/views/users', adminDir: __dirname + '/views/admin', vendorsDir: __dirname + '/views/vendors', partialsDir: __dirname + '/views/partials'
}))

app.use(session({
  secret: "userSecretKey",
  saveUninitialized: true,
  cookie: { maxAge: 1200000 },
  resave: false
}));

app.use(nocache())
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
// app.use(express.static(path.join(__dirname, 'public')));
app.use('/public', express.static(__dirname + "/public"));

db.connect((err) => {
  if (err) {
    console.log('Database connection failed');
  } else {
    console.log('Database connection success');
  }
})

app.use('/admin', adminRouter);
app.use('/vendor', vendorRouter)
app.use('/', usersRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('users/error', { layout: 'loginLayout' });
});

module.exports = app;
