const express = require('express')
const router = express.Router({mergeParams: true});
const {validateReview, isLoggedIn, isReviewAuthor} = require('../middleware');
const reviews = require('../controllers/reviews')


// route to create a new review for one campground
router.post('/', isLoggedIn, validateReview, reviews.createReview);

router.delete('/:reviewId', isLoggedIn, isReviewAuthor, reviews.destroyReview);

module.exports = router;