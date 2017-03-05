const mongoose = require('mongoose')

const consoSchema = new mongoose.Schema({
  date: { type: Date },
  month: Number,
  week: Number,
  weekday: String,
  hour: Number
},
{ collection: 'consos' })

module.exports = mongoose.model('Conso', consoSchema)
