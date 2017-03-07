import $ from 'jquery'
import Cookies from 'js-cookie'
import moment from 'moment'

let flash

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
}

function update () {
  const current = $('#total').text()
  console.log(current)
  $.ajax({
    url: '/total',
    success: function (data) {
      if (data.total && data.total !== current) {
        $('#total').text(data.total)
      }
      // 1) before the winning ticket (no Cookie)
      if (flash) stopFlashing(flash)

      // 2) during the winning ticket (data.lucky)
      if (data.lucky === data.total) {
        Cookies.set('lucky-number', data.lucky, { expires: moment().day(7).toDate() })
        $('#lottery').html('<span class=\'number\'>' + data.lucky + '</span> is the winning number!! 🤑')
        // TODO: play sound
        // flash screen
        startFlashing()
        // TODO: Slack Notification
      }
      // 3) after the winning ticket (Cookie)
      if (Cookies.get('lucky-number') && data.total !== data.lucky) {
        $('#lottery').html('This week\'s winning number was <span class=\'number\'>' + Cookies.get('lucky-number') + '</span>!!')
        if (flash) stopFlashing(flash)
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
