const { Server } = require("socket.io");
const Client = require("socket.io-client");
const ioClient = require('../../io')

const asyncWithDone = (f) => {
  return async () => {
    return new Promise(async (resolve, reject) => {
      await f(resolve)
    })
  }
}

/**
 * 
 * @param {*} clients 
 * @returns {Promise<Client.Manager>}
 */
function addClient(clients) {
  return new Promise((resolve, reject) => {
    /** @type {Client.Manager} */
    const client = new Client('http://localhost:3000');

    client.on('connect', () => {
      clients.push(client)
      resolve(client)
    })
  })
}

describe('tdd socket tests', () => {
  /** @type {Server} io */
  let io, clients = [];

  beforeAll(async () => {
    io = new Server(3000);
    ioClient.configure(io)
  });

  afterAll(() => {
    io.close();
    clients.forEach(c => c.close())
  });

  afterEach(() => {
    clients.forEach(c => c.off())
  })


  test("should return length 1", asyncWithDone(async done => {
    const client = await addClient(clients)

    client.on('getLength', length => {
      expect(length).toBe(1)
      expect(clients.length).toBe(1)
      done()
    })

    client.emit('getLength')
  }));

  test("should return length 2", asyncWithDone(async done => {
    const client = await addClient(clients)
    client.on('getLength', length => {
      expect(length).toBe(2)
      expect(clients.length).toBe(2)
      done()
    })

    client.emit('getLength')
  }));

  test("should update length realtime for one client", asyncWithDone(async done => {
    const client = addClient(clients)
    clients[0].on('length', async length => {
      expect(length).toBe(3)
      await client // without this following expect fails
      expect(clients.length).toBe(3)
      done()
    })
  }))

  test("should update length realtime for all clients", asyncWithDone(async done => {
    const times = jest.fn()
    clients.forEach(c => c.on('length', times))
    await addClient(clients)
    expect(times).toHaveBeenCalledTimes(3)
    done()
  }))

  test("should match someone", asyncWithDone(async done => {
    const index = Math.floor(Math.random() * (clients.length - 1));
    const client = clients[index]
    client.on('matched', id => {
      const ids = clients.map(x => x.id)
      expect(ids.includes(id)).toBe(true)
      done()
    })

    client.emit('match')
  }))
})