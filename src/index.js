const path = require('path')
const http = require('http')
const express = require('express')
const socketio = require('socket.io')

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

const message = "Welcome"
// event listener for when a client connects to socket.io
// runs all code for existing connection
io.on('connection', (socket) => {
  console.log('new web socket connection')

  // when working with socketio and transfering data, we are sending and receiving events
  // send event on server and receive event on client, almost all events will be custom made to fit the needs of the application
  // emits update to a single connection
  socket.emit('message', message)

  socket.on('sendMessage', (message) => {
    // emits event to every connection available (so all connection sees same data)
    io.emit('message', message)
  })
})

// starts up the server
server.listen(port, () => {
  console.log(`Listening on port ${port}`)
})