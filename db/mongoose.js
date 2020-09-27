const mongoose = require('mongoose')

mongoose.connect('mongodb://127.0.0.1:27017/foodApp',{
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true,
    useFindAndModify: false
})

const connection = mongoose.connection
console.log('connected to db !')

module.exports = connection