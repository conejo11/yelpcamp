const catchAsync = require('../utils/catchAsync');
const Campground = require('../models/campground');
const {cloudinary} = require('../cloudinary');
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
const mapBoxToken = process.env.MAPBOX_TOKEN;
const geocoder = mbxGeocoding({accessToken:mapBoxToken});

module.exports.index = catchAsync(async (req,res)=>{
    const campgrounds = await Campground.find({});
    res.render('campgrounds/index', {campgrounds});
})

module.exports.newCampgroundForm = (req,res)=>{
    res.render('campgrounds/new');
}

module.exports.createCampground =  catchAsync(async (req,res,next)=>{
    // if(!req.body.campground) throw new ExpressError('Invalid Campground Data', 400)
    const geoData = await geocoder.forwardGeocode({
        query: req.body.campground.location,
        limit: 1
    }).send();
    const images = req.files.map(file => ({url: file.path, filename: file.filename}))
    const campground = new Campground(req.body.campground);
    campground.geometry = geoData.body.features[0].geometry;
    campground.owner = req.user._id;
    campground.image = images;
    await campground.save();
    req.flash('success', 'Successfully made a new campground');
    res.redirect(`campgrounds/${campground._id}`);
})

module.exports.showCampground = catchAsync(async (req,res)=>{
    const campground = await Campground.findById(req.params.id).populate({
        path: 'reviews',
        populate: 'owner'
    }).populate('owner');
    // console.log(campground)
    if(!campground) {
        req.flash('error', 'Could not find campground');
        res.redirect('/campgrounds')
    }
    res.render('campgrounds/show', {campground});
})

module.exports.editCampgroundForm = catchAsync(async (req,res)=>{
    const {id} = req.params;
    const campground = await Campground.findById(id);
    if(!campground) {
        req.flash('error', 'Could not find campground');
        res.redirect('/campgrounds')
    }
    res.render('campgrounds/edit', {campground});
})

module.exports.updateCampground = catchAsync(async (req,res)=>{
    const campground = await Campground.findByIdAndUpdate(req.params.id, {...req.body.campground});
    const images = req.files.map(file => ({url: file.path, filename: file.filename}))
    campground.image.push(...images);
    await campground.save();
    if(req.body.deleteImages) {
        for(let filename of req.body.deleteImages){
            await cloudinary.uploader.destroy(filename);
        }
        await campground.updateOne({$pull: {image: {filename: {$in: req.body.deleteImages}}}});
    }
    req.flash('success', 'Successfully updated campground');
    res.redirect(`/campgrounds/${campground._id}`)
})

module.exports.destroyCampground = catchAsync(async (req,res) => {
    const {id} = req.params;
    const deleted = await Campground.findByIdAndDelete(id);
    req.flash('success', 'Successfully deleted campground');
    res.redirect(`/campgrounds`);
})