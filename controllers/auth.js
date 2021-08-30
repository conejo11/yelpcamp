const User = require('../models/user');
const catchAsync = require('../utils/catchAsync');

module.exports.registerForm = (req,res) => {
    res.render('auth/register')
}

module.exports.registerUser = catchAsync(async (req,res)=>{
    try {
        const {email, password, username} = req.body;
        const user = new User({email,username});
        const registeredUser = await User.register(user,password);
        req.flash('success', 'Welcome to YelpCamp!');
        req.login(registeredUser, err => {
            if (err) { return next(err); }
            res.redirect('/campgrounds');
        });
    } catch (error) {
        req.flash('error', error.message);
        console.dir(error.message)
        res.redirect('/campgrounds')
    }
})

module.exports.loginForm = (req,res) => {
    res.render('auth/login')
}

module.exports.loginUser = catchAsync(async (req,res) => {
    req.flash('success', 'Welcome Back');
    const redirect = req.session.returnTo || '/campgrounds';
    delete req.session.returnTo;
    res.redirect(redirect);
})

module.exports.logoutUser = catchAsync(async (req,res) => {
    await req.logout();
    req.flash('success', 'Logged Out')
    res.redirect('/campgrounds');
})