require('dotenv').config()
const mongoose = require('mongoose')
mongoose.Promise = require('q').Promise
const db = mongoose.connect(`mongodb://${process.env.MONGO_USER}:${process.env.MONGO_PWD}@${process.env.MONGO_HOST}:${process.env.MONGO_PORT}/${process.env.MONGO_DB}`)

const consoSchema = new mongoose.Schema({
  date: { type: Date },
  month: Number,
  week: Number,
  weekday: String,
  hour: Number
},
{ collection: 'consos' })

module.exports = db.model('Conso', consoSchema)
