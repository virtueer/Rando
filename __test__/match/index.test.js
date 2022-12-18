const supertest = require('supertest')
const app = require('../../app')

test('should return login', async () => {
  await supertest(app)
    .get('/match')
    .expect(200, 'login')
})