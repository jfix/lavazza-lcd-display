const path = require('path')
require('dotenv').config({path: path.join(__dirname, '.env')})

const bodyParser = require('body-parser')
const express = require('express')
require('./models/db')
const mongoose = require('mongoose')
const SlackWebhook = require('slack-webhook')

const Conso = mongoose.model('Conso')
const LotteryTicket = mongoose.model('LotteryTicket')
const emojiFavicon = require('emoji-favicon')
require('pug')

const app = express()

app.use(bodyParser.json())
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
  .then((total) => {
    LotteryTicket.findOne().sort({date: -1})
    .then((doc) => doc.ticketNumber)
    .then((lucky) => {
      res.setHeader('Content-Type', 'application/json')
      res.send({total: 612, lucky: 614})
      // res.send({total, lucky})

      const d = new Date()
      console.log(`✓ ${d.toDateString()} ${d.toTimeString()} served a request for ${total} coffees.`)
    })
  })
  .catch((err) => console.log(`ERROR: ${err}`))
})

app.post('/notify-winner-slack', (req, res) => {
  const slackOptions = { defaults: { username: 'Lavazza Winneur !!!', channel: '#test', icon_emoji: ':trophy:' } }
  const slack = new SlackWebhook(process.env.SLACK_WEBHOOK, slackOptions)

  slack.send(`And this week's winner is number .... :tada: *${req.body.number}*!\nCongratulations, come and get your free :coffee: :coffee:!`)
  .then(
    (body) => {
      console.log(`Slack was correctly notified: ${body} for ${req.body.number}.`)
      res.status(200).end()
    },
    (err) => {
      console.error(`ERROR notifying Slack: ${JSON.stringify(err)}`)
      res.status(500).end()
    })
})
