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
const locationTemplate = document.querySelector('#location-message-template').innerHTML
const sidebarTemplate = document.querySelector('#sidebar-template').innerHTML

// Options
// QS parses query string. Query string is created when a user submits a display name / room (key names determined with name attribute in html)
const { username, room } = Qs.parse(location.search, { ignoreQueryPrefix: true })

const autoscroll = () => {
  // new messages are added to the bottom of the div
  const $newMessage = $messages.lastElementChild

  // Height of the new message
  // getComputedStyle is a method of window object - returns an object with css styles
  const newMessageStyles = getComputedStyle($newMessage)
  const newMessageMargin = parseInt(newMessageStyles.marginBottom)
  // offsetHeight returns height of element including vertical padding and border (excluding margin)
  const newMessageHeight = $newMessage.offsetHeight + newMessageMargin

  // Visible height of container
  const visibleHeight = $messages.offsetHeight

  // Height of messages container
  // total available height to scroll through
  const containerHeight = $messages.scrollHeight

  // How far have I scrolled?
  // how far scrolled from the top - the distance from the top of the SCROLLBAR to the top of the CONTENT
  // height of the visible container = scrollbar height
  // the sum is the height from the bottom of the scroll bar to the top of the content
  const scrollOffset = $messages.scrollTop + visibleHeight

  // determine if scrolled to the bottom BEFORE new message added - if we dont account for the new message we will never be scrolled to the bottom
  // because we would be running this code AFTER the newMessageHeight is added to containerHeight (containerHeight includes all of the newMessageHeights)
  // total height of the container - newMessageHeight

  // if the height of the container (beforeNewMessages)  is less than the height scrolled from the top of the content 
  // then autoscroll. checking if user is at bottom of the container before the last message
  if (containerHeight - newMessageHeight <= scrollOffset){
    // scrollTop (top of scrollbar to top of content) set to equal to the total available scroll height (all the way to the bottom)
    $messages.scrollTop = $messages.scrollHeight
  }
}

socket.on('message', ({ username, text, createdAt }) => {
  // render with template. second argument is object where the keys can be referenced in the script template
  const html = Mustache.render(messageTemplate, {
    username,
    message: text,
    createdAt: moment(createdAt).format('h:mm a')
  })
  $messages.insertAdjacentHTML('beforeend', html)
  autoscroll()
})

socket.on('locationMessage', ({ username, url, createdAt }) => {
  console.log(url)
  const html = Mustache.render(locationTemplate, {
    username,
    url,
    createdAt: moment(createdAt).format('h:mm a')
  })
  $messages.insertAdjacentHTML('beforeend', html)
})

socket.on('roomData', ({ room, users }) => {
  const html = Mustache.render(sidebarTemplate, {
    room,
    users
  })

  document.querySelector('#sidebar').innerHTML = html
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
      })
  })
})

socket.emit('join', {username, room}, (error) => {
  if (error){
    alert(error)
    // redirect to homepage
    location.href = '/'
  }
})