const express = require('express')
//const MongoClient = require('mongodb').MongoClient
const path = require('path')
require('dotenv').config({path: path.join(__dirname, '.env')})
require('pug')
const request = require('request')

const app = express()
app.use(express.static(path.join(__dirname, 'assets')))
app.set('view engine', 'pug')

app.listen(process.env.PORT || 5000, (e, r) => {
  if (e) {
    console.log(`✗ Error encountered: ${e}.`)
  } else {
    console.log(`✓ Server is now listening.`)
  }
})

app.get('/', function (req, res) {
    const mlab_url = `${process.env.MLAB_URL}${process.env.MONGO_DB}/collections/${process.env.MONGO_COLLECTION}?c=true&apiKey=${process.env.MLAB_APIKEY}`
    console.log(`Accessing this URL: ${mlab_url}.`)
    request.get({
        url: mlab_url
    }, function (err, resp, body) {
        if (err) {
            (err) => console.log(`ERROR: ${err}`)
        } else {
	        res.render(path.join(__dirname, 'views', 'index'), {total: body})

	        const d = new Date()
   	        console.log(`✓ ${d.toDateString()} ${d.toTimeString()} served a request for ${body} coffees.`)
        }
    })
 })

