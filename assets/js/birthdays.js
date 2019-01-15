import $ from 'jquery';
import lscache from 'lscache';
import moment from 'moment';

export default function() {
  try {
    // test presence in localStorage cache
    let bdays = lscache.get('birthdays')
    if (bdays === null) { /* local storage cache has expired */
      $.ajax({url: '/birthdays', cache: false})
      .done((data) => {
        const dayInMinutes = 24 * 60
        const midNight = moment().startOf('day')
        const now = moment()
        lscache.set('birthdays', data, (dayInMinutes - now.diff(midNight, 'minutes'))) /* keep until midnight */
        updateBirthdays(data)
      })
      .fail((jqXHR, textStatus, errorThrown) => { throw Error(errorThrown) })
    } else {
      updateBirthdays(bdays)
    }
  } catch(err) {
    console.log(err)
  }
};
const updateBirthdays = (birthdays) => {
  if (birthdays.today.length > 0) {
    const b = birthdays.today
    const l = b.length
    const c = b.map((i) => `<u>${i.summary}</u>`)
    const bc = formatChildren(c, true)
    writeBirthday(`Yay, today is ${bc} birthday!`)
  }
  if (birthdays.tomorrow.length > 0) {
    const b = birthdays.tomorrow
    const l = b.length
    const c = b.map((i) => `<u>${i.summary}</u>`)
    const bc = formatChildren(c, true)
    writeBirthday(`FYI, tomorrow is ${bc} birthday!`)
  }
  if (birthdays.week.length > 0) {
    const b = birthdays.week
    const l = b.length
    const c = b.map((i) => `<u>${i.summary}</u> (${moment(i.start).format('dddd, Do MMM')})`)
    const bc = formatChildren(c)
    writeBirthday(`Later this week, we have the birthday${l > 1 ? 's' : ''} of ${bc}.`)
  }
  if (birthdays.fortnight.length > 0) {
    // TODO
  }
  if (birthdays.month.length > 0) {
    // TODO
  }
}

const writeBirthday = (who) => $('#birthdays').append(`<p>${who}</p>`)
const formatChildren = (kids, addS) => kids.slice(0,-1).join(`${addS ? '\'s' : ''}, `) + ' and ' + kids[kids.length - 1] + (addS ? '\'s' : '')
