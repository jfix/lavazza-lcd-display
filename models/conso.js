const mongoose = require('mongoose')

const consoSchema = new mongoose.Schema({
  date: { type: Date },
  month: Number,
  week: Number,
  weekday: String,
  hour: Number
},
{ collection: 'consos' })

const tenDayAggregation = [
  {
    '$project': {
      'yearMonthDay': { '$dateToString': { 'format': '%Y-%m-%d', 'date': '$date' } },
      'time': { '$dateToString': { 'format': '%H:%M:%S:%L', 'date': '$date' } },
      'weekday': '$weekday'
    }
  },
  {
    '$group': {
      '_id': {
        'date': '$yearMonthDay',
        'weekday': '$weekday'
      },
      'count': { '$sum': 1 }
    }
  },
  // sort from most recent to oldest
  {
    '$sort': { '_id.date': -1 }
  },
  // select first ten results
  {
    '$limit': 10
  },
  // reverse order of ten results
  {
    '$sort': { '_id.date': 1 }
  },
  {
    '$project': {
      '_id': 0,
      'date': '$_id.date',
      'weekday': '$_id.weekday',
      'count': 1
    }
  }
]
module.exports.tenDayAggregation = tenDayAggregation
module.exports.Conso = mongoose.model('Conso', consoSchema)
