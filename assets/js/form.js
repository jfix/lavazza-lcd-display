import $ from 'jquery'
import { responsiveVoice } from '../vendor/responsivevoice/responsivevoice.js'

$(document).ready(function () {
  $('#testButton').on('click', (evt) => {
    console.log(`now speaking this sentence: ${$('#phraseInput').val()}`)
    // TODO: render interface unusable during speaking
    responsiveVoice.speak($('#phraseInput').val())
  })

  $('#newPhrase').submit((evt) => {
    const phrase = $('#phraseInput').val()
    if (phrase.trim() === '' || phrase.length === 0 || phrase.length > 200) {
      $('#info').html(`<div class='error'>Your phrase no good (too short or too long)!</div>`)
      evt.preventDefault()
    }
  })
})
