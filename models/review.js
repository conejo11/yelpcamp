const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// review schema
const reviewSchema = new Schema({
    body: String,
    rating: Number,
    owner: {type: Schema.Types.ObjectId, ref: 'User'}
});

// creating model from schema
module.exports = mongoose.model('Review', reviewSchema);