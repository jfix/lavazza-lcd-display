require('dotenv').config()
const path = require('path')
const mongoose = require('mongoose')
mongoose.Promise = require('q').Promise
mongoose.connect(`mongodb://${process.env.MONGO_USER}:${process.env.MONGO_PWD}@${process.env.MONGO_HOST}:${process.env.MONGO_PORT}/${process.env.MONGO_DB}`)

// CONNECTION EVENTS
// When successfully connected
mongoose.connection.on('connected', function () {
  console.log(`Mongoose default connection open at ${process.env.MONGO_HOST}:${process.env.MONGO_PORT}`)
})

// If the connection throws an error
mongoose.connection.on('error', function (err) {
  console.log('Mongoose default connection error: ' + err)
})

// When the connection is disconnected
mongoose.connection.on('disconnected', function () {
  console.log('Mongoose default connection disconnected')
})

// If the Node process ends, close the Mongoose connection
process.on('SIGINT', function () {
  mongoose.connection.close(function () {
    console.log('Mongoose default connection disconnected through app termination')
    process.exit(0)
  })
})

// Require the schemas
require(path.join(__dirname, 'conso'))
require(path.join(__dirname, 'lottery-ticket'))
