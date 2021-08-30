const express = require('express')
const router = express.Router();
const {
    isLoggedIn,
    isAuthor,
    validateCampground
} = require('../middleware');
const campgrounds = require('../controllers/campgrounds')
const multer = require('multer')
const {
    storage
} = require('../cloudinary')
const upload = multer({
    storage
})

router.route('/')
    // route to all campgrounds list
    .get(campgrounds.index)
    // route to which the new campground form will be sent
    .post(isLoggedIn, upload.array('image'), validateCampground, campgrounds.createCampground);

// get new campground form (neds to come before :id if not the app will think new is an id)
router.get('/new', isLoggedIn, campgrounds.newCampgroundForm);

router.route('/:id')
    // show the campground corresponding to id passed on url
    .get(campgrounds.showCampground)
    // route to which the edit form will send the data
    .put(isLoggedIn, isAuthor, upload.array('image'), validateCampground, campgrounds.updateCampground)
    // Route to delete the campground
    .delete(isLoggedIn, isAuthor, campgrounds.destroyCampground);

// get the edit form to edit a campground
router.get('/:id/edit', isLoggedIn, isAuthor, campgrounds.editCampgroundForm);

module.exports = router;