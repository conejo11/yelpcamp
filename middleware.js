const ExpressError = require('./utils/ExpressError');
const Campground = require('./models/campground');
const {campgroundSchema} = require('./schemas');
const catchAsync = require('./utils/catchAsync');
const Review = require('./models/review');
const {reviewSchema} = require('./schemas');

// middleware to verify if user is logged in
module.exports.isLoggedIn = (req,res,next) => {
    if(!req.isAuthenticated()){
        req.session.returnTo = req.originalUrl;
        req.flash('error', 'You must be signed in');
        return res.redirect('/login');
    }
    next();
}

// validation middleware to be called on campground registration or edit
module.exports.validateCampground = (req,res,next) =>{
    const {error} = campgroundSchema.validate(req.body);
    console.log(error);
    if(error){
        const msg = error.details.map(el => el.message).join(',')
        throw new ExpressError(msg, 400);
    } else {
        next();
    }
}

// middleware to verify if the logged in person is the author of the campground
module.exports.isAuthor = catchAsync( async (req,res,next) => {
    const campground = await Campground.findById(req.params.id);
    if(!campground.owner.equals(req.user.id)) {
        req.flash('error', 'You do not have permission');
        return res.redirect(`/campgrounds/${campground._id}`)
    };
    next();
})

// to see if user is the review author
module.exports.isReviewAuthor = catchAsync( async (req,res,next) => {
    const {id, reviewId} = req.params;
    const review = await Review.findById(reviewId);
    if(!review.owner.equals(req.user.id)) {
        req.flash('error', 'You do not have permission');
        return res.redirect(`/campgrounds/${id}`)
    };
    next();
})
// validation middleware to be called when a review is submitted
module.exports.validateReview = (req,res,next) =>{
    const {error} = reviewSchema.validate(req.body);
    console.log(error);
    if(error){
        const msg = error.details.map(el => el.message).join(',');
        throw new ExpressError(msg, 400);
    } else {
        next();
    }
}