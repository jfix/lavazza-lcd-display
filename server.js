const express = require('express')
const Conso = require('./models/conso')
const path = require('path')
require('dotenv').config({path: path.join(__dirname, '.env')})
const emojiFavicon = require('emoji-favicon')

require('pug')
const request = require('request')

const app = express()
app.use(express.static(path.join(__dirname, 'assets')))
app.use(emojiFavicon('coffee'))

app.set('view engine', 'pug')

app.listen(process.env.PORT || 5000, (e, r) => {
  if (e) {
    console.log(`✗ Error encountered: ${e}.`)
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
    res.setHeader('Content-Type', 'application/json')
    res.send({ total: number })

    const d = new Date()
    console.log(`✓ ${d.toDateString()} ${d.toTimeString()} served a request for ${number} coffees.`)
  })
  .catch((err) => {
    console.log(`ERROR: ${err}`)
  })
})
