const path = require('path')
const http = require('http')
const express = require('express')
const socketio = require('socket.io')
const Filter = require('bad-words')
const { generateMessage, generateLocationMessage } = require('./utils/messages')
const { addUser, removeUser, getUser, getUsersInRoom } = require('./utils/users')

// setup server to use express and socketio
const app = express()
// express createsServer behind the scenes but we're being explicit here as we want to use socket.io and express
const server = http.createServer(app)
// call socketio and pass raw http server to configure socketio to work with server. the server variable was declared for this purpose
const io = socketio(server)

const publicDirectoryPath = path.join(__dirname, '../public')
const port = process.env.PORT || 3000

// registers a middleware callback (express.static) that will be part of a request handler chain for incoming http requests
// since the callback is the only argument, this callback is called for all routes
// this callback serves static files 
app.use(express.static(publicDirectoryPath))

// event listener for when a client connects to socket.io
// runs all code for existing connection
io.on('connection', (socket) => {
  console.log('new web socket connection')

  // when working with socketio and transfering data, we are sending and receiving events
  // send event on server and receive event on client, almost all events will be custom made to fit the needs of the application
  // emits update to a single connection
  socket.on('join', ({ username, room }, callback) => {
    const { error, user } = addUser({ id: socket.id, username, room })

    if (error){
      // acknowlege user attempted to join and send back error
      // use acknowledge instead of emit because the client will get the value passed to the callback and can determine what to do with it
      return callback(error)  
    }

    // by using join, we are able to emit events exclusively to that room via new methods
    socket.join(user.room)

    // sends message to socket (new connection)
    socket.emit('message', generateMessage('Welcome'))
    // emits event to everyone in a room except new client
    socket.broadcast.to(user.room).emit('message', generateMessage(`${user.username} has joined!`))
    callback()
  })

  // callback is called to acknowledge the event. in client, a callback was passed to be called when event is acknowledged
  // whoever receives the event, calls the callback
  socket.on('sendMessage', (message, callback) => {
    const filter = new Filter()
    
    if(filter.isProfane(message)){
      return callback('Profanity is not allowed!')
    }
    // emits event to every connection available (so all connection sees same data)
    io.to('Another Room').emit('message', generateMessage(message))
    // can pass value to callback and which becomes accessible by the client
    callback()
  })

  // when socket (client) gets disconnected. not what you would expect as a connection uses io.on
  socket.on('disconnect', () => {

    const user = removeUser(socket.id)

    if (user) {
      // no need to use broadcast as the disconnected user would not receive this message
      return io.to(user.room).emit('message', generateMessage(`${user.username} has left!`))
    }
  })

  socket.on('sendLocation', ({latitude, longitude}, callback) => {
    io.emit('locationMessage', generateLocationMessage(`https://google.com/maps?q=${latitude},${longitude}`))
    callback()
  })
})

// starts up the server
server.listen(port, () => {
  console.log(`Listening on port ${port}`)
})