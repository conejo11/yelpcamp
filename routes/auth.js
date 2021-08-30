const express = require('express');
const passport = require('passport');
const auth = require('../controllers/auth');
const router = express.Router();
const catchAsync = require('../utils/catchAsync');

router.route('/register')
    .get(auth.registerForm)
    .post(auth.registerUser)


router.route('/login')
    .get(auth.loginForm)
    .post(passport.authenticate('local', {failureFlash: true, failureRedirect: '/login'}), auth.loginUser)

router.get('/logout', auth.logoutUser)

module.exports = router;