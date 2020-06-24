// has access to io function because client side library is loaded first in index.html
// the io function needs to be called for the client to be connected to the server
const socket = io()

socket.on('message', (message) => {
  console.log(message)
})

document.querySelector('#message-form').addEventListener('submit', (e) => {
  e.preventDefault()
  // target is the form, message has access to elements by name
  const message = e.target.elements.message.value
  socket.emit('sendMessage', message)
}) 

document.querySelector('#send-location').addEventListener('click', () => {
  // if property exists, user has support for geolocation api
  if(!navigator.geolocation){
    return alert('Geolocation is not supported by your browser.')
  }

  // below function is asynchronous, there is currently no promise support so a callback is used
  navigator.geolocation.getCurrentPosition((position) => {
    const { latitude, longitude } = position.coords
    socket.emit('sendLocation', { latitude, longitude })
  })
})