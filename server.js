const path = require('path')
const express = require('express')
const app = express()

const ejs = require('ejs')
const expressLayout = require('express-ejs-layouts')

const port = process.env.PORT || 3000

app.get('/', (req, res) => {
    res.render('home')
})

app.use(expressLayout)
app.set('views', path.join(__dirname,'/resources/views'))
app.set('view engine', 'ejs')


app.listen(port, () => {
    console.log(`Server started at port ${port}`)
})