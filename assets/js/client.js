import $ from 'jquery'
import phrases from './phrases.js'

let flash
let justOnce = false

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

function update () {
  const current = $('#total').text()

  $.ajax({
    url: '/total',
    success: function (data) {
      // if the value has changed
      if (data.total && data.total !== parseInt(current)) {
        const phrase = phrases[Math.floor(Math.random() * phrases.length)]
        responsiveVoice.speak('Et maintenant la phrase du jour: -- ' + phrase, 'French Female')

        // update overall total display
        $('#total').text(data.total)
        // do we have a flash?
        lotteryWinner(data)
      }
    },
    error: function () {
      $('#total').text(':-(')
    },
    complete: function () {
      setTimeout(function () { update() }, 3000)
    }
  })
}

update()
