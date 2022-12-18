const matchRoute = require('./match')

module.exports = app => {
  app.use('/match', matchRoute)
}