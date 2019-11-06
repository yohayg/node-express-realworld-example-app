const
    // http = require('http'),
    // path = require('path'),
    // methods = require('methods'),
    express = require('express'),
    bodyParser = require('body-parser'),
    // session = require('express-session'),
    cors = require('cors'),
    // passport = require('passport'),
    errorhandler = require('errorhandler');
    // mongoose = require('mongoose'),

const isProduction = process.env.NODE_ENV === 'production';

// Create global app object
const app = express();

app.use(cors());

// Normal express config defaults
app.use(require('morgan')('dev'));
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

app.use(require('method-override')());
//set the template engine ejs
app.set('view engine', 'ejs');
app.use(express.static(__dirname + '/public'));

//routes
app.get('/', (req, res) => {
    res.render('index')
});


// app.use(session({ secret: 'conduit', cookie: { maxAge: 60000 }, resave: false, saveUninitialized: false  }));

if (!isProduction) {
    app.use(errorhandler());
}

if (isProduction) {
    // mongoose.connect(process.env.MONGODB_URI);
} else {
    // mongoose.connect('mongodb://localhost/conduit');
    // mongoose.set('debug', true);

}

// require('./models/User');
// require('./models/Article');
// require('./models/Comment');
// require('./config/passport');

app.use(require('./routes'));

/// catch 404 and forward to error handler
app.use(function (req, res, next) {
    let err = new Error('Not Found');
    err.status = 404;
    next(err);
});

/// error handlers

// development error handler
// will print stacktrace
if (!isProduction) {
    app.use(function (err, req, res, next) {
        console.log(err.stack);

        res.status(err.status || 500);

        res.json({
            'errors': {
                message: err.message,
                error: err
            }
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function (err, req, res, next) {
    res.status(err.status || 500);
    res.json({
        'errors': {
            message: err.message,
            error: {}
        }
    });
});

// finally, let's start our server...
const server = app.listen(process.env.PORT || 3000, function () {
    console.log('Listening on port ' + server.address().port);
});

const io = require("socket.io")(server);


//listen on every connection
io.on('connection', (socket) => {
    console.log('New user connected');

    //default username
    socket.username = "Anonymous";

    //listen on change_username
    socket.on('change_username', (data) => {
        socket.username = data.username
    });

    //listen on new_message
    socket.on('new_message', (data) => {
        //broadcast the new message
        io.sockets.emit('new_message', {message : data.message, username : socket.username});
    });

    //listen on typing
    socket.on('typing', (data) => {
        socket.broadcast.emit('typing', {username : socket.username})
    })
});
