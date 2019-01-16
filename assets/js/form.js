import $ from 'jquery'
import { responsiveVoice } from '../vendor/responsivevoice/responsivevoice.js'

$(document).ready(function () {
  $('#testButton').on('click', (evt) => {
    const phrase = $('#phraseInput').val()
    if (phrase.length > 0) {
      console.log(`now speaking this sentence: ${phrase}`)
      // TODO: render interface unusable during speaking
      responsiveVoice.speak(phrase)
      $('#phraseInput').select()
    } else {
      $('#info').show().html(`<div class='error'>How do you want me to pronounce nothing?!</div>`).delay(5000).fadeOut('slow')
      $('#phraseInput').focus()
    }
  })

  $('#newPhrase').submit((evt) => {
    const phrase = $('#phraseInput').val()
    if (phrase.trim() === '' || phrase.length === 0 || phrase.length > 200) {
      $('#info').show().html(`<div class='error'>Your phrase is no good (too short or too long)!</div>`).delay(5000).fadeOut('slow')
      evt.preventDefault()
    }
  })
})
