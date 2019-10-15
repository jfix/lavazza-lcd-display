const path = require('path')
require('dotenv').config({ path: path.join(__dirname, '.env') })

const bodyParser = require('body-parser')
const express = require('express')
require('./models/db')
const moment = require('moment-timezone')
const mongoose = require('mongoose')
const SlackWebhook = require('slack-webhook')

const conso = require('./models/conso')
const Conso = conso.Conso
const tenDayAggregation = conso.tenDayAggregation

const birthdays = require('./birthdays')

const LotteryTicket = mongoose.model('LotteryTicket')
const emojiFavicon = require('emoji-favicon')
require('pug')

const app = express()

app.use(bodyParser.urlencoded({ extended: true }))
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

app.get('/new', function (req, res) {
  res.render(path.join(__dirname, 'views', 'phrase'), {})
})
app.post('/new', function (req, res) {
  // TODO: create a pull request with the phrase submitted
  const phrase = req.body.phraseInput
  console.log(`POSTED BODY: ${JSON.stringify(phrase)}`)
  res.render(path.join(__dirname, 'views', 'phrase'), { status: 'ok', phrase })
})

app.get('/birthdays', async (req, res) => {
  // passed in dates are mainly for testing/debugging
  const argDate = req.query.date // for testing '2019-10-15T22:00:00.000Z' //
  // make sure it's a valid date string and can be converted into a valid moment object
  const date = (argDate && (moment(argDate) instanceof moment)) ? moment(argDate) : undefined

  const bdays = await birthdays(date)

  // TODO: if there is a birthday today, generate audio file and inject URL/filename into bdays object
  // TODO: this is just an existing file, remove this with a reference to the real thing
  bdays.audioFile = 'sounds/happy-birthday.mp3'

  res.setHeader('Content-Type', 'application/json')
  res.status(200).send(bdays)
})
/* endpoint for wally consumption level... */
app.get('/wally', function (req, res) {
  res.setHeader('Content-Type', 'application/json')
  res.send({ total: Math.floor(Math.random() * 10000) + 1 })
})

// TODO: move this in a different module

async function query () {
  let total, lucky, tenDays

  const totalCount = Conso.count()
  const luckyNumber = LotteryTicket.findOne().sort({ date: -1 })
  const tenDayStats = Conso.aggregate(tenDayAggregation).option({ cursor: {} })

  try {
    [total, lucky, tenDays] = await Promise.all([
      totalCount.exec().catch(reason => console.error(reason)),
      luckyNumber.exec().catch(reason => console.error(reason)),
      tenDayStats.exec().catch(reason => console.error(reason))
    ])
    return {
      total,
      lucky: lucky.ticketNumber,
      tenDays
    }
  } catch (e) {
    console.error('ERROR IN query: ' + JSON.stringify(e))
  }
}
// get some data points from Mongo
app.get('/data', function (req, res) {
  query()
    .then(data => {
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
    .catch(err => {
      console.log(`QUERY ERROR: ${err}`)
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
