const path = require('path')
require('dotenv').config({path: path.join(__dirname, '.env')})
const express = require('express')
require('./models/db')
const mongoose = require('mongoose')
const Conso = mongoose.model('Conso')
const LotteryTicket = mongoose.model('LotteryTicket')
const emojiFavicon = require('emoji-favicon')
require('pug')

const app = express()

app.use(express.static(path.join(__dirname, 'assets')))
app.use(emojiFavicon('coffee'))
app.set('view engine', 'pug')

app.listen(process.env.PORT || 5000, (err, res) => {
  if (err) {
    console.log(`✗ Error encountered: ${err}.`)
  } else {
    console.log(`✓ Server is now listening on ${process.env.PORT || 5000}.`)
  }
})

/* home endpoint */
app.get('/', function (req, res) {
  res.render(path.join(__dirname, 'views', 'index'), { total: '☕' })
})

/* endpoint for wally consumption level... */
app.get('/wally', function (req, res) {
  res.setHeader('Content-Type', 'application/json')
  res.send({ total: Math.floor(Math.random() * 10000) + 1 })
})

/* get the total number of coffees from Mongo */
app.get('/total', function (req, res) {
  Conso.count({})
  .then((number) => {
    LotteryTicket.findOne().sort({date: -1})
    .then((doc) => doc.ticketNumber === number)
    .then((lucky) => {
      res.setHeader('Content-Type', 'application/json')
      res.send({total: number, lucky: lucky ? number : false})

      const d = new Date()
      console.log(`✓ ${d.toDateString()} ${d.toTimeString()} served a request for ${number} coffees.`)
    })
  })
  .catch((err) => console.log(`ERROR: ${err}`))
})
