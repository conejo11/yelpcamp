const mongoose = require('mongoose');
const Review = require('./review');
const User = require('./user')
const Schema = mongoose.Schema;


const ImageSchema = new Schema({
    url: String,
    filename: String
})

ImageSchema.virtual('thumbnail').get(function() {
    return this.url.replace('/upload', '/upload/c_scale,w_200/')
})

// schema for the campground model
const opts = {toJSON: {virtuals: true}};
const CampgroundSchema = new Schema({
    title: String,
    image: [ImageSchema],
    price: Number,
    description: String,
    location: String,
    geometry: {
        type: {
          type: String, 
          enum: ['Point'], 
          required: true
        },
        coordinates: {
          type: [Number],
          required: true
        }
        },
    owner: {type: Schema.Types.ObjectId, ref: 'User'},
    reviews: [
        {
            type: Schema.Types.ObjectId,
            ref: 'Review'
        }
    ]
},opts);

CampgroundSchema.virtual('properties.popUpMarkup').get(function (){
    return `
    <strong><a href="/campgrounds/${this._id}">${this.title}</a></strong>
    <p>${this.description.substring(0,30)}...</p>`
})

// https://res.cloudinary.com/drg6e9dw7/image/upload/c_scale,w_200/v1630092336/YelpCamp/zdke0xsducvcbrq2az8z.gif

// mongoose middleware to remove all reviews when a campground is deleted
CampgroundSchema.post('findOneAndDelete', async function (doc) {
    if(doc){
        await Review.deleteMany({
            _id: {$in: doc.reviews}
        })
    }
})

// creating a model from our schema and exporting it so it can be used by other files
module.exports = mongoose.model('Campground', CampgroundSchema);