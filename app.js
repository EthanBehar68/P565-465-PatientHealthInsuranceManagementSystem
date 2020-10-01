const winston = require('winston');
require('express-async-errors');
var express = require('express'),
        app = express(),
        path = require('path'),
        port = process.env.PORT || 3002,
        hostname = process.env.HOST || '127.0.0.1',
        bodyParser = require("body-parser"),
        cors = require('cors'),
        example = require('./routes/example'),
        register = require('./routes/register'),
        error = require('./middleware/error')

winston.configure({
  format: winston.format.combine(winston.format.colorize(), winston.format.simple()),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: "logfile.log"})
  ]
});

process.on('uncaughtException', (ex) => {
    // In the case of uncaught exceptions
    winston.error(`UNCAUGHT EXCEPTION: ${ex.message}`, ex);
    process.kill(-1);
});

process.on('unhandledRejection', (ex) => {
  // In the case of unhandled promise rejections
  winston.error(`UNHANDLED REJECTION: ${ex.message}`, ex);
  process.kill(-1);
});

app.use(cors());

app.use(bodyParser.json({limit: '10mb'}));

app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

app.use('/', express.static(path.join(__dirname, 'build')));

app.use('/register', register);
app.use("/api/example", example);
app.use(error);

app.get(['/', '/*'], function(req, res) {
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

app.use(function(req, res, next) {
  let err = new Error("Not Found");
  err.status = 404;
  next(err);
});

app.listen(port, () => {
  winston.info(`Server running at ${hostname}:${port}/`);
});