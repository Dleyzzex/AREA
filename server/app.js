require('rootpath')();
const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const morgan = require('morgan');
const handleError = require('./middleware/error-handler');
const passport = require('passport')
var session = require('express-session');
const fs = require('fs');
var raw = fs.readFileSync('config/services.json');
const { scripts_manager } = require('./scripts_manager');
const init_services_db  = require('./routes/services/init_services_db');
const db = require('./helpers/db');

var about = {
    client: {
        host: "localhost"
    },
    server: {
        current_time: 0,
        services : JSON.parse(raw)
    }
}

async function check_db() {
    if (await db.Service.count() == 0) {
        init_services_db();
    }
    //console.log(await db.Service.count());
}
check_db();


scripts_manager();


// create test user in db on startup if required
//const createTestUser = require('helpers/create-test-user');
//createTestUser();
app.use(cookieParser());


app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
//app.use(morgan(':method :status :res - :response-time ms'));

morgan.token('id', function getId(req) {
    return req.id;
});

app.use(morgan('[:date[web]] :method :url :status :response-time ms'));

// allow cors requests from any origin and with credentials
app.use(cors({ origin: (origin, callback) => callback(null, true), credentials: true }));

// api routes
app.use('/users', require('./routes/users/users.controller'));
app.use('/status', require('./routes/status/status.controller'));
app.use('/', require('./routes/auth/auth.controller'));
app.use('/services', require('./routes/services/services.controller'));
app.use('/scripts', require('./routes/scripts/scripts.controller'));
app.use('/about.json', (req, res) => {
    about.server.current_time = Math.round(Date.now() / 1000)
    res.header("Content-Type",'application/json');
    res.send(JSON.stringify(about, null, 4));
} )
// swagger docs route
app.use('/doc', require('helpers/swagger'));


// global error handler
app.use(handleError);

app.use(session({
    secret: 'anything',
    resave: true,
    saveUninitialized: true
}));
app.use(passport.initialize());
app.use(passport.session());

// require("./config/passport");

// start server
const port = 8080//process.env.NODE_ENV === 'production' ? (process.env.PORT || 80) : 3000;
app.listen(port, () => {
    console.log('Server listening on port ' + port);
});