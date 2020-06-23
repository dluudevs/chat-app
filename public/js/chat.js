// has access to io function because client side library is loaded first in index.html
// the io function needs to be called for the client to be connected to the server
const socket = io()

socket.on('message', (message) => {
  console.log(message)
})

document.querySelector('#message-form').addEventListener('submit', (e) => {
  e.preventDefault()
  // target accesss forms, message has access to elements by name
  const message = e.target.elements.message.value
  socket.emit('sendMessage', message)
}) 
