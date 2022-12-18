let server = undefined

function configure(io) {
  io.on('connection', socket => {
    console.log('new connection')
  })

  server = io
}

module.exports = {
  configure,
  get: () => server,
}