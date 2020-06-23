const path = require('path')
const express = require('express')

const app = express()
const publicDirectoryPath = path.join(__dirname, '../public')
const port = process.env.PORT || 3000

// registers a middleware callback (express.static) that will be part of a request handler chain for incoming http requests
// since the callback is the only argument, this callback is called for all routes
// this callback serves static files 
app.use(express.static(publicDirectoryPath))

// starts up the server
app.listen(port, () => {
  console.log(`Listening on port ${port}`)
})