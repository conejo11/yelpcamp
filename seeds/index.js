const mongoose = require('mongoose');
const cities = require('./cities');
const {places, descriptors} = require('./seedHelpers');
const Campground = require('../models/campground');

// connecting to database
mongoose.connect('mongodb://localhost:27017/yelp-camp', {useNewUrlParser: true, useCreateIndex: true, useUnifiedTopology: true});

// verifying if it connected or if there was an error
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
  console.log('Connected to DB');
});

const sample = (array) => array[Math.floor(Math.random()*array.length)];


// loop 50 times to get a random city from cities.js and save the city on the DB
const seedDB = async () => {
    // deleting all things from DB
    await Campground.deleteMany({});
    for(let i =0; i< 200; i++) {
        const random1000 = Math.floor(Math.random() * 1000);
        const price = Math.floor(Math.random() * 20)+10;
        const camp = new Campground({
            location: `${cities[random1000].city}, ${cities[random1000].state}`,
            // location: `Jaraguá do Sul, Brasil`,
            title: `${sample(descriptors)} ${sample(places)}`,
            image: [{
                url: 'https://res.cloudinary.com/drg6e9dw7/image/upload/v1630090616/YelpCamp/sgkqjqd0o2ljcmcwzkok.png',
                filename: 'YelpCamp/sgkqjqd0o2ljcmcwzkok'
            }],
            geometry: { type: 'Point', coordinates: [ cities[random1000].longitude,cities[random1000].latitude ] },
            owner: '6127cd2c88c529124c979b1e',
            description: 'Lorem ipsum dolor sit amet consectetur adipisicing elit. Nostrum aperiam reprehenderit magnam, est eos similique vitae quasi inventore repellat incidunt id vel ex blanditiis quos dolorum ad nesciunt, culpa beatae!Lorem ipsum dolor sit amet consectetur adipisicing elit. Nostrum aperiam reprehenderit magnam, est eos similique vitae quasi inventore repellat incidunt id vel ex blanditiis quos dolorum ad nesciunt, culpa beatae!',
            price: price
        })
        await camp.save();
    }
}

seedDB().then(()=> {
    mongoose.connection.close();
});