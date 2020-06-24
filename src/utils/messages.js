const generateMessage = (text) => {
  return { 
    text, 
    createdAt: new Date().getTime() 
  }
}

const generateLocationMessage = (url) => {
  return {
    url,
    createdAt: new Date().toString()
  }
}

module.exports = {
  generateMessage,
  generateLocationMessage
}