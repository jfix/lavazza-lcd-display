const path = require('path')
require('dotenv').config({path: path.join(__dirname, '.env')})

const bodyParser = require('body-parser')
const express = require('express')
require('./models/db')
const moment = require('moment-timezone')
const mongoose = require('mongoose')
const SlackWebhook = require('slack-webhook')

const conso = require('./models/conso')
const Conso = conso.Conso
const tenDayAggregation = conso.tenDayAggregation

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

// TODO: move this in a different module

async function query () {
  const totalCount = Conso.count()
  const luckyNumber = LotteryTicket.findOne().sort({date: -1})
  const tenDayStats = Conso.aggregate(tenDayAggregation)

  let total, lucky, tenDays
  try {
    [total, lucky, tenDays] = await Promise.all([
      totalCount.exec().catch(reason => console.error(reason)),
      luckyNumber.exec().catch(reason => console.error(reason)),
      tenDayStats.exec().catch(reason => console.error(reason))
    ])
  } catch (e) {
    console.error('ERROR IN query: ' + JSON.stringify(e))
  }
  return {
    total,
    lucky: lucky.ticketNumber,
    tenDays
  }
}
// get some data points from Mongo
app.get('/data', function (req, res) {
  query().then(data => {
    const last = data.tenDays[data.tenDays.length - 1] // count, date, weekday
    const now = moment().tz('Europe/Paris')
    if (now.isSame(last.date, 'day')) {
      data.today = last.count
      data.yesterday = data.tenDays[data.tenDays.length - 2].count
    } else {
      data.today = 0
      data.yesterday = last.count
    }
    res.setHeader('Content-Type', 'application/json')
    res.send(data)
  })
})

app.post('/notify-winner-slack', (req, res) => {
  const slackOptions = { defaults: { username: 'Lavazza Winneur !!!', channel: '#random', icon_emoji: ':trophy:' } }
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
