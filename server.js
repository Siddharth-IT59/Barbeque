require('dotenv').config()
const path = require('path')
const express = require('express')
const bodyParser = require('body-parser')
const app = express()
const session = require('express-session')
const flash = require('express-flash')
const MongoDbStore = require('connect-mongo')(session)

const passport = require('passport')
const Emitter = require('events')
const mongoose = require('mongoose')
const connection = require('./db/mongoose')

//session store
let mongoStore = new MongoDbStore({
    mongooseConnection : connection,
    collection: 'sessions'
})

// Event emitter
const eventEmitter = new Emitter()
app.set('eventEmitter', eventEmitter)


//session config
app.use(session({
    secret: process.env.COOKIE_SECRET,
    resave: false,
    store: mongoStore,
    saveUninitialized: false,
    cookie: { maxAge: 1000*60*60*24 } // 24 hrs
}))

// passport confg.
const passportInit = require('./app/config/passport')
passportInit(passport)
app.use(passport.initialize())
app.use(passport.session())

const ejs = require('ejs')
const expressLayout = require('express-ejs-layouts')
const port = process.env.PORT || 3000

const initRoutes = require('./routes/web')

app.use(flash())

app.use(express.static(path.join(__dirname, '/public')))
app.use(express.urlencoded({
    extended : false
}))
app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(express.json())
// Global middleware
app.use((req, res, next) => {
    res.locals.session = req.session
    res.locals.user = req.user
    next()
})
// view engine
app.use(expressLayout)
app.set('views', path.join(__dirname,'/resources/views'))
app.set('view engine', 'ejs')

initRoutes(app)
app.use((req, res) => {
    res.status(404).render('error')
})

const server = app.listen(port, () => {
    console.log(`Server started at port ${port}`)
})

// Socket
const io = require('socket.io')(server)
io.on('connection', (socket) => {
    // Join
    socket.on('join',(orderId) => {
        socket.join(orderId)
    })
})

eventEmitter.on('orderUpdated', (data) => {
    io.to(`order_${data.id}`).emit('orderUpdated', data)
})

eventEmitter.on('orderPlaced', (data) => {
    io.to('adminRoom').emit('orderPlaced', data)
})

eventEmitter.on('cancelledByCustomer', (data) => {
    io.to('adminRoom').emit('cancelledByCustomer', data)
})

eventEmitter.on('orderCanceled', (data) => {
    console.log('order cancelled')
    if(data){
        var notification = 'Order cancelled by the restaurant'
        io.to(`order_${data.id}`).emit('orderCanceled', notification)
    }
})
