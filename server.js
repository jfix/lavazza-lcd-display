const express = require('express')
const MongoClient = require('mongodb').MongoClient
const path = require('path')
require('dotenv').config({path: path.join(__dirname, '.env')})
require('pug')

var db
const app = express()
app.use(express.static(path.join(__dirname, 'assets')))
app.set('view engine', 'pug')

MongoClient.connect(`mongodb://${process.env.MONGO_USER}:${process.env.MONGO_PWD}@${process.env.MONGO_HOST}/${process.env.MONGO_DB}`, (err, database) => {
  if (err) return console.log(err)
  console.log(`✓ Database connection established.`)
  db = database
  app.listen(process.env.HTTP_PORT, () => {
    console.log(`✓ Server is now listening.`)
  })
})

app.get('/', function (req, res) {
  db.collection(process.env.MONGO_COLLECTION).find().count()
  .then(
    (total) => {
	res.render(path.join(__dirname, 'views', 'index'), {total})

	const d = new Date()
    	console.log(`✓ ${d.toDateString()} ${d.toTimeString()} served a request for ${total} coffees.`)
    }
  )
  .catch(
    (err) => console.log('problem with query')
  )
})

