const router = require('express').Router()
const { matchService } = require('../../services')

router.get('/', async (req, res) => {
  res.send('login')
})

module.exports = router