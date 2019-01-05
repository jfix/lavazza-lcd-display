import lscache from 'lscache'
import moment from 'moment'

module.exports = () => {
  try {
    // test presence in lscache
    let birthdays = lscache.get('birthdays')
    if (birthdays === null) { /* local storage cache has expired */
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
      updateBirthdays(birthdays)
    }
  } catch(err) {
    console.log(err)
  }
}
const updateBirthdays = (birthdays) => {
  Object.keys(birthdays).forEach(bucket => {
    if (!!birthdays[bucket].length) { // bucket is not empty
      updateBirthdayBucket(bucket, birthdays[bucket])
    }
  })
}

const updateBirthdayBucket = (bucket, birthdays) => {
  const birthdayChildrenString = getChildren(birthdays)
  switch(bucket) {
    case 'month':
      `Later this month, it's also ${birthdayChildrenString} birthday.`
  }
}

const getChildren = (birthdays) => {
  if (birthdays.length === 1) return `${mkDwn(birthdays[0].summary)}'s`
  if (birthdays.length === 2) return ``
  return ``
}

const mkDwn = (name) => `#[u ${birthdays[0].summary}]`
