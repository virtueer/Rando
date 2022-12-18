const router = require('express').Router()

router.get('/', async (req, res) => {
  res.send('login')
})

module.exports = router