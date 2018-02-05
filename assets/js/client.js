import Chart from 'chart.js'
import $ from 'jquery'
import moment from 'moment'
import '../vendor/slick/slick.min.js'
import { responsiveVoice } from '../vendor/responsivevoice/responsivevoice.js'

import phrases from './cent-raisons'
import drawHistogram from './ten-day'

let flash
let justOnce = false

$(document).ready(function () {
  startTime()
  $('.slider').slick({
    autoplay: true,
    arrows: false,
    dots: false,
    fade: true,
    speed: 600
  })
})

function startTime () {
  document.getElementById('time').innerHTML = moment().format('HH:mm:ss')
  setTimeout(startTime, 500)
}

function startFlashing () {
  let bgColor = 'black'
  let fgColor = 'yellow'
  flash = setInterval(function () {
    $('body').css('background-color', bgColor)
    $('#total').css('color', fgColor)
    $('#lottery').css('color', fgColor)
    bgColor = bgColor === 'black' ? 'yellow' : 'black'
    fgColor = fgColor === 'yellow' ? 'black' : 'yellow'
  }, 1000)
}

function stopFlashing (id) {
  console.log('about to clear interval: ' + id)
  clearInterval(id)
  flash = undefined
  $('body').css('background-color', 'black')
  $('#total').css('color', 'yellow')
  $('#lottery').css('color', 'yellow')
  // FIXME dirty workaround
  window.location.reload()
}

function lotteryWinner (data) {
  if (data.lucky === data.total) {
    $('#lottery').html(`<span class='number'>${data.lucky}</span> is the winning number!! 🤑`)
    document.getElementById('winner').play()
    startFlashing()
    notifySlack(data.lucky)
  } else {
    if (flash) stopFlashing(flash)
  }
  if (data.lucky < data.total) {
    if (flash) stopFlashing(flash)
    $('#lottery').html(`This week's winning number was <span class='number'>${data.lucky}</span>!!`)
  }
}

function notifySlack (number) {
  if (!justOnce) {
    console.log('about to notify slack: ' + number)
    $.post({
      url: '/notify-winner-slack',
      data: JSON.stringify({ 'number': number }),
      contentType: 'application/json',
      success: () => (justOnce = true),
      error: () => (justOnce = true)
    })
  }
}

function officeHours () {
  const now = moment()
  if (now.weekday() === 6 /* Saturday */ ||
    now.weekday() === 0 /* Sunday */ ||
    now.hours() < 6 || /* before 6am */
    now.hours() > 20 /* after 9pm */) {
    return false
  }
  return true
}

function update () {
  if (!officeHours()) {
    setTimeout(() => { update() }, (60 * 60 * 1000)) /* wait an hour */
  } else {
    const current = $('#total').text()
    $.ajax({
      url: '/data',
      cache: false,
      success: function (data) {
        // if the value has changed
        if (data.total && data.total !== parseInt(current)) {
          document.title = `${data.total} coffees served`
          if (responsiveVoice) {
            const phrase = phrases[Math.floor(Math.random() * phrases.length)]
            responsiveVoice.speak(`Et pour ce café ${data.total}, voila une raison d'aimer votre travail: -- Raison ${phrase}`, 'French Female')
          } else {
            console.log('ERROR: responsiveVoice was not found!')
          }

          // update overall total display
          $('#total').text(data.total)
          $('#today-value').text(data.today)
          $('#yesterday-value').text(data.yesterday)
          // do we have a winner?
          lotteryWinner(data)
          drawHistogram(data.tenDays)
        }
      },
      error: function () {
        $('#total').text(':-(')
      },
      complete: function () {
        setTimeout(function () { update() }, 4000)
      }
    })
  }
}

update()
