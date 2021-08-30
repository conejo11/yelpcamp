const Campground = require('../models/campground');
const Review = require('../models/review');
const catchAsync = require('../utils/catchAsync');

module.exports.createReview = catchAsync(async (req,res)=>{
    const campground = await Campground.findById(req.params.id)
    const review = new Review(req.body.review); 
    campground.reviews.push(review);
    review.owner = req.user._id;
    await review.save();
    await campground.save();
    req.flash('success', 'Created new review');
    res.redirect(`/campgrounds/${campground._id}`);
})

module.exports.destroyReview = catchAsync(async (req,res) => {
    // res.send('DELETED REVIEW REACHED')
    const {id, reviewId} = req.params;
    await Campground.findByIdAndUpdate(id, {$pull: {'reviews':  reviewId}})
    const deleted = await Review.findByIdAndDelete(reviewId);
    req.flash('success', 'Successfully deleted review');
    res.redirect(`/campgrounds/${id}`);
})