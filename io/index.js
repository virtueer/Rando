const { Server } = require('socket.io')
const { nanoid } = require('nanoid')
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

    socket.on('match', async () => {
      const room = nanoid(21)
      const sockets = await io.fetchSockets()
      const otherSockets = sockets.filter(x => x.id !== socket.id)
      const index = Math.floor(Math.random() * (otherSockets.length - 1));
      const targetSocket = otherSockets[index]
      targetSocket.join(room)
      socket.join(room)

      io.to(room).emit('matched', room)
    })

  })

  server = io
}

module.exports = {
  configure,
  get: () => server,
}