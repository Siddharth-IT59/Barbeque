require('dotenv').config()
const path = require('path')
const express = require('express')
const app = express()
const session = require('express-session')
const flash = require('express-flash')
const MongoDbStore = require('connect-mongo')(session)

const mongoose = require('mongoose')
const connection = require('./db/mongoose')

//session store
let mongoStore = new MongoDbStore({
    mongooseConnection : connection,
    collection: 'sessions'
})

//session config
app.use(session({
    secret: process.env.COOKIE_SECRET,
    resave: false,
    store: mongoStore,
    saveUninitialized: false,
    cookie: { maxAge: 1000*60*60*24 } // 24 hrs
}))

const ejs = require('ejs')
const expressLayout = require('express-ejs-layouts')
const port = process.env.PORT || 3000

const initRoutes = require('./routes/web')

app.use(flash())

app.use(express.static(path.join(__dirname, '/public')))
app.use(express.json())
// Global middleware
app.use((req, res, next) => {
    res.locals.session = req.session
    next()
})
// Global middleware
app.use(expressLayout)
app.set('views', path.join(__dirname,'/resources/views'))
app.set('view engine', 'ejs')

initRoutes(app)

app.listen(port, () => {
    console.log(`Server started at port ${port}`)
})