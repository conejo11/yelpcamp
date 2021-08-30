if (process.env.NODE_ENV !== "production") {
    require('dotenv').config()
}
const express = require('express');
const mongoose = require('mongoose');
const methodOverride = require('method-override');
const ExpressError = require('./utils/ExpressError');
const ejsMate = require('ejs-mate');
const {
    join
} = require('path');
const session = require('express-session');
const flash = require('connect-flash');
const campgroundRoutes = require('./routes/campgrounds');
const reviewRoutes = require('./routes/reviews');
const authRoutes = require('./routes/auth');
const passport = require('passport');
const LocalStrategy = require('passport-local');
const User = require('./models/user');
const mongoSanitize = require('express-mongo-sanitize');
const helmet = require('helmet');
const dbUrl = process.env.DB_URL || 'mongodb://localhost:27017/yelp-camp'
const MongoStore = require('connect-mongo');

// connecting to database
mongoose.connect(dbUrl, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true,
    useFindAndModify: false
});

// verifying if it connected or if there was an error
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function () {
    console.log('Connected to DB');
});

// initializing express
const app = express();

// setting view engine and view path
app.engine('ejs', ejsMate);
app.set('view engine', 'ejs');
app.set('views', join(__dirname, 'views'));

// for parsing the req.body
app.use(express.urlencoded({
    extended: true
}));
app.use(methodOverride('_method'));

// mongo sanitize to prevent injection
app.use(mongoSanitize());
app.use(
    helmet({
        contentSecurityPolicy: false,
    })
);

// middleware to serve static files (css/js scripts)
app.use(express.static(join(__dirname, 'public')));

// setting up express session
const secret = process.env.SECRET || 'thishouldbeasecret'
const store = MongoStore.create({
    mongoUrl: dbUrl,
    secret: secret,
    touchAfter: 24 * 60 * 60
});

store.on('error', function (e) {
    console.log('store error', e)
})

const sessionConfig = {
    store,
    name: 'session',
    secret: secret,
    resave: false,
    saveUninitialized: true,
    cookie: {
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
        maxAge: 1000 * 60 * 60 * 24 * 7,
        httpOnly: true,
        // secure: true
    }
}
app.use(session(sessionConfig));

// set up passport and passport session for authentication
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// set up flash messages with connect flash
app.use(flash());
app.use((req, res, next) => {
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    res.locals.currentUser = req.user;
    next();
})

// routers
app.use('/campgrounds', campgroundRoutes);
app.use('/campgrounds/:id/reviews', reviewRoutes);
app.use('/', authRoutes)

// first route to root
app.get('/', (req, res) => {
    res.render('home');
});

// app.get('/fakeuser', async (req,res) => {
//     const user = new User({email: 'conejo@gmail.com', username: 'Conejo'});
//     const registeredUser = await User.register(user, 'conejo');
//     res.send(registeredUser);
// })

// error handling
app.all('*', (req, res, next) => {
    next(new ExpressError('Page not Found', 404));
})

app.use((err, req, res, next) => {
    if (!err.message) {
        err.message = 'Something went wrong';
    }
    res.render('error', {
        err
    });
});

// telling express to listen to the port 3000
const port = process.env.PORT || 3000
app.listen(port, () => {
    console.log('Connected to port 3000!')
});