// has access to io function because client side library is loaded first in index.html
// the io function needs to be called for the client to be connected to the server
const socket = io()

// Elements - prefix is convention to denote DOM elements
const $messageForm = document.querySelector('#message-form')
const $messageFormInput = $messageForm.querySelector('input')
const $messageFormButton = $messageForm.querySelector('button')
const $sendLocationButton = document.querySelector('#send-location')
const $messages = document.querySelector('#messages')

// Templates - templates need access to the script's innerHTML property
const messageTemplate = document.querySelector('#message-template').innerHTML

socket.on('message', (message) => {
  // render with template. second argument is object where the keys can be referenced in the script template
  const html = Mustache.render(messageTemplate, {
    message
  })
  $messages.insertAdjacentHTML('beforeend', html)
})

$messageForm.addEventListener('submit', (e) => {
  e.preventDefault()
  // disable form, prevent user from sending another message when a message is being sent
  $messageFormButton.setAttribute('disabled', 'disabled')

  // target is the form, message has access to elements by name
  const message = e.target.elements.message.value
  // last argument is acknowledgement to client when event is acknowledged by server - whoever is emitting event sets up callback
  // argument in callback is a value being passed by the server

  socket.emit('sendMessage', message, (error) => {
    // renable button once event is acknowledged
    $messageFormButton.removeAttribute('disabled')
    $messageFormInput.value = ''
    $messageFormInput.focus()

    if(error){
      // server only passes a value to callback when profanity is being used
      return console.log(error)
    }

    console.log('Message delivered!')
  })
}) 

$sendLocationButton.addEventListener('click', () => {
  // if property exists, user has support for geolocation api
  if(!navigator.geolocation){
    return alert('Geolocation is not supported by your browser.')
  }

  $sendLocationButton.setAttribute('disabled', 'disabled')
  
  // below function is asynchronous, there is currently no promise support so a callback is used
  navigator.geolocation.getCurrentPosition((position) => {
    const { latitude, longitude } = position.coords
    socket.emit('sendLocation', 
      { latitude, longitude }, 
      () => {
        $sendLocationButton.removeAttribute('disabled')
        console.log('Location shared!')
      })
  })
})