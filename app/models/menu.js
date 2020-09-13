const mongoose = require('mongoose')

const dishSchema = new mongoose.Schema({
    name:{
        type: String,
        required: true,
    },
    image:{
        type: String,
        required: true,
    },
    price:{
        type: Number,
        required: true,
    },
    size:{
        type: String,
        required: true,
    }
})

const Dish = mongoose.model('Dish',dishSchema)

module.exports = Dish