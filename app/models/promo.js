const mongoose = require('mongoose')

const promoSchema = new mongoose.Schema({
    code:{
        type: String,
        required: true,
        trim: true,
        uppercase: true
    },
    discount:{
        type: Number,
        required: true,
        default: 0,
    },
})

const Promo = mongoose.model('Promo',promoSchema)

module.exports = Promo