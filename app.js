const cors = require('cors')
const express = require('express')
const initRoutes = require('./routes')
const app = express()

app.use(cors())
initRoutes(app)

module.exports = app