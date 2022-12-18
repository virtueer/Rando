const { Server } = require('socket.io')
const http = require('http')
const app = require('../app')
const { configure } = require('../io')

const port = 3000;

const server = http.createServer(app)
const io = new Server(server, { cors: true })
configure(io)
server.listen(port)