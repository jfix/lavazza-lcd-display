const mongoose = require('mongoose')

const ticketSchema = new mongoose.Schema({
  date: { type: Date, default: new Date() },
  ticketNumber: Number,
  projectedTotal: Number,
  currentTotal: Number
},
{ collection: 'lottery-ticket' })

module.exports = mongoose.model('LotteryTicket', ticketSchema)
