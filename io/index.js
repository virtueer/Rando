const { Server } = require('socket.io')
let server = undefined

const emitLength = async (io) => {
  const sockets = await io.fetchSockets()
  io.emit('length', sockets.length)
}

/**
 * @param {Server} io 
 */
function configure(io) {
  io.on('connection', async socket => {
    socket.on('disconnect', () => {
      emitLength(io)
    })
    emitLength(io)

    socket.on('getLength', async () => {
      const sockets = await io.fetchSockets()
      socket.emit('getLength', sockets.length)
    })

  })

  server = io
}

module.exports = {
  configure,
  get: () => server,
}