const express = require('express')
// const MongoClient = require('mongodb').MongoClient
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

/* get the actual value from Mongo */
app.get('/total', function (req, res) {
  const mlabUrl = `${process.env.MLAB_URL}${process.env.MONGO_DB}/collections/${process.env.MONGO_COLLECTION}?c=true&apiKey=${process.env.MLAB_APIKEY}`
  console.log(`Accessing this URL: ${mlabUrl}.`)
  request.get({
    url: mlabUrl
  }, function (err, resp, body) {
    if (err) {
      (err) => console.log(`ERROR: ${err}`)
    } else {
      res.setHeader('Content-Type', 'application/json')
      res.send({ total: body })

      const d = new Date()
      console.log(`✓ ${d.toDateString()} ${d.toTimeString()} served a request for ${body} coffees.`)
    }
  })
})
