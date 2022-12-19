const { Server } = require('socket.io')
const { nanoid } = require('nanoid')
let server = undefined

const emitLength = async (io) => {
  const sockets = await io.in('posibilities').fetchSockets()
  io.emit('length', sockets.length)
}

async function matchAlgorithm(io, socket) {
  const room = nanoid(6)
  const sockets = await io.in('posibilities').fetchSockets()
  const otherSockets = sockets.filter(x => x.id !== socket.id)
  if (otherSockets.length < 1)
    return
  const index = Math.floor(Math.random() * (otherSockets.length - 1));
  const targetSocket = otherSockets[index]
  targetSocket.join(room)
  socket.join(room)

  targetSocket.leave('posibilities')
  socket.leave('posibilities')

  io.to(room).emit('matched', room)
}

/**
 * @param {Server} io 
 */
function configure(io) {
  io.on('connection', async socket => {
    socket.on('disconnect', () => {
      emitLength(io)
    })

    socket.join('posibilities')
    emitLength(io)
    matchAlgorithm(io, socket)

    socket.on('getLength', async () => {
      const sockets = await io.in('posibilities').fetchSockets()
      socket.emit('getLength', sockets.length)
    })

    socket.on('message', message => {
      const room = Array.from(socket.rooms)[1]
      socket.to(room).emit('message', message)
    })

    socket.on('leave room', async () => {
      const room = Array.from(socket.rooms)[1]
      const sockets = await io.to(room).fetchSockets()
      sockets.forEach(s => {
        s.leave(room)
        if (s.id !== socket.id)
          s.emit('leave room')

        setTimeout(() => {
          s.join('posibilities')
          matchAlgorithm(io, s)
        }, 5000);
      });
    })
  })

  server = io
}

module.exports = {
  configure,
  get: () => server,
}