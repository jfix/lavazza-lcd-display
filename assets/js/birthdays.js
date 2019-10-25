import $ from 'jquery';
import lscache from 'lscache';
import moment from 'moment';

export function checkBirthdays() {
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

export function happyBirthday() {
  try {
    lscache.set('happyBirthday', true, 14*60 /* would expire at midnight */)
    console.log('now playing a song!!!!')
    const bdays = lscache.get('birthdays')
    if (bdays === null) return
    if (bdays.today.length > 0) {
      const hb = document.getElementById('happyBirthday')
      hb.setAttribute('src', lscache.get('birthdays').audioFile)
      const r = hb.play()
      r
        .then(() => { console.log('playing...') })
        .catch((e) => { console.log(`Error playing: ${e}`) })
    }
  } catch(err) {
    console.log(err)
  }
};

const updateBirthdays = (birthdays) => {
  // TODAY
  let b = []
  let l = 0
  let c = []
  let bc = ''
  if (birthdays.today.length > 0) {
    b = birthdays.today
    l = b.length
    c = b.map((i) => `<u>${i.summary}</u>`)
    bc = formatChildren(c, true)
    writeBirthday(`Yay, today is ${bc} birthday!<br/><br/>Cake, cake, cake! :-)`, true)
  
  // when it's someone's birthday today don't mention any other
  } else {
    // TOMORROW
    if (birthdays.tomorrow.length > 0) {
      b = birthdays.tomorrow
      l = b.length
      c = b.map((i) => `<u>${i.summary}</u>`)
      bc = formatChildren(c, true)
      writeBirthday(`FYI, tomorrow is ${bc} birthday!`)
    }
    if (birthdays.week.length > 0) {
      b = birthdays.week
      l = b.length
      c = b.map((i) => `<u>${i.summary}</u> (on ${moment(i.start).format('dddd')})`)
      bc = formatChildren(c)
      writeBirthday(`Later this week, we have the birthday${l > 1 ? 's' : ''} of ${bc}.`)
    }
    if (birthdays.fortnight.length > 0) {
      b = birthdays.fortnight
      l = b.length
      c = b.map((i) => `<u>${i.summary}</u> (${moment(i.start).format('dddd, Do MMM')})`)
      bc = formatChildren(c)
      writeBirthday(`In the week after, there will be the birthday${l > 1 ? 's' : ''} of ${bc}.`)
    }
    if (birthdays.month.length > 0) {
      b = birthdays.month
      l = b.length
      c = b.map((i) => `<u>${i.summary}</u> (on ${moment(i.start).format('dddd [the] Do [of] MMMM')})`)
      bc = formatChildren(c)
      writeBirthday(`Even further out, ${bc} will celebrate their birthday${l > 1 ? 's' : ''}.`)
    }

    if (birthdays.month.length == 0
      && birthdays.fortnight.length == 0
      && birthdays.week.length == 0
      && birthdays.tomorrow.length == 0
      && birthdays.today.length == 0) {
        writeBirthday(`<br/><p style="text-align:center">There aren't <u>any</u> birthdays<br/>in the next thirty days! :-(<br/><br/>What <u>did</u> your parents do nine months ago?!</p>`)
    }
  }
}

const writeBirthday = (who, birthday) => $('#birthdays').append(`<p ${birthday ? 'style="text-align: center;"' :''}>${who}</p>`)
const formatChildren = (kids, addS) => {
  if (kids.length === 1) return `${kids[0] + (addS ? '\'s' : '')}`
  return kids.slice(0,-1).join(`${addS ? '\'s' : ''}, `) + ' and ' + kids[kids.length - 1] + (addS ? '\'s' : '')
}
