const path = require('path')
const crypto = require('crypto')
require('dotenv').config({ path: path.join(__dirname, '.env') })
const ics = require('node-ical')
const moment = require('moment')
const R = require('ramda')

// global constants
const url = process.env.BIRTHDAY_CALENDAR
const now = moment()

// function definitions
const getEvents = (item) => item.type === 'VEVENT'
const extractStuff = (item) => {
    const d = moment(item.start)
    return {
            ...R.pick(['start', 'summary'], item),
            uid: crypto.createHash('md5').update(item.uid).digest('hex'),
        date: d.format('MM-DD'),
        day: d.date(),
        month: d.month() // zero-based!
}}
const byDate = (a, b) => moment(a.start).isSameOrBefore(moment(b.start)) ? -1 : 1
const next = (item, days) => {
    const max = now.clone().add(days, 'days')
    const bday = moment(item.start)
    return bday.isBefore(max) && bday.isSameOrAfter(now)
}
// const year = (item) => next(item, 365)
const month = (item) => next(item, 30)
const fortnight = (item) => next(item, 14)
const week = (item) => next(item, 7)
const tomorrow = (item) => next(item, 1)
const today = (item) => next(item, 0)
const contains = (a, b) => a.uid === b.uid

module.exports = () => {
    return new Promise((resolve, reject) => {
        ics.fromURL(url, {}, (err, data) => {
            if (err) return reject(err)
            
            const events = R.pipe(
                R.values,
                R.filter(getEvents),
                R.map(extractStuff),
                R.sort(byDate),
            )(data)
            // R.differenceWith: make sure we're not repeating birthdays in several time buckets
            // R.reduce(R.concat, [], ...): need to get an array of all previous birthdays so as not to repeat them 
            const zero = R.filter(today, events)
            const one = R.differenceWith(contains, R.filter(tomorrow, events), zero)
            const seven = R.differenceWith(contains, R.filter(week, events), R.reduce(R.concat, [], [one, zero]))
            const fourteen = R.differenceWith(contains, R.filter(fortnight, events), R.reduce(R.concat, [], [seven, one, zero]))
            const thirty = R.differenceWith(contains, R.filter(month, events), R.reduce(R.concat, [], [fourteen, seven, one, zero]))

            resolve({
                today: zero,
                tomorrow: one,
                week: seven,
                fortnight: fourteen,
                month: thirty
            })
        })
    })
}