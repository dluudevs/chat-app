// an array of objects with id, username and room properties
const users = []

const addUser = ({ id, username, room}) => {
  // Clean the data
  username = username.trim().toLowerCase()
  room = room.trim().toLowerCase()

  // Validate the data
  if (!username || !room){
    return {
      error: 'Username and room are required!'
    }
  }

  // Check for existing user
  const existingUser = users.find(user => user.room === room && user.username === username)

  // Validate username
  if (existingUser){
    return {
      error: 'Username is in use!'
    }
  }

  // Store user
  const user = { id, username, room }
  users.push(user)
  return { user }
}

const removeUser = (id) => {
  // faster than filter because filter would look for all matches. this callback will stop running as soon as one match is found
  // returns match if found, undefined if nothing found
  const index = users.findIndex(user => user.id === id)

  // if a match is found
  if (index !== -1){
    // remove one item at index - mutates users array and returns array with all removed items
    return users.splice(index, 1)[0]
  }
}

const getUser = (id) => users.find(user => user.id === id)

const getUsersInRoom = (room) => users.filter(user => user.room === room.trim().toLowerCase())

module.exports = {
  addUser,
  removeUser,
  getUser,
  getUsersInRoom,
}