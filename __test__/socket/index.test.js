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
 * @returns {Client.Manager}
 */
function addClient(clients) {

  /** @type {Client.Manager} */
  const client = new Client('http://localhost:3000');

  client.waitForConnect = () => new Promise((resolve, reject) => {
    client.on('connect', resolve)
  })

  clients.push(client)
  return client
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

  describe("length tests", () => {
    afterEach(() => {
      clients.forEach(c => c.off())
    })

    afterAll(() => {
      clients.forEach(c => c.close())
      clients.splice(0)
    });


    test("should return length 1", asyncWithDone(async done => {
      const client = addClient(clients)
      await client.waitForConnect()

      client.on('getLength', length => {
        expect(length).toBe(1)
        expect(clients.length).toBe(1)
        done()
      })

      client.emit('getLength')
    }));

    test("should return length 0", asyncWithDone(async done => {
      const client = addClient(clients)
      await client.waitForConnect()

      client.on('getLength', length => {
        expect(length).toBe(0)
        expect(clients.length).toBe(2)
        done()
      })

      client.emit('getLength')
    }));

    test("should update length realtime for one client", asyncWithDone(async done => {
      const client = addClient(clients)

      clients[0].on('length', async length => {
        expect(length).toBe(1)
        expect(clients.length).toBe(3)
        await client.waitForConnect() // for next test
        done()
      })

    }))

    test("should update length realtime for all clients", asyncWithDone(async done => {
      const times = jest.fn()
      clients.forEach(c => {
        c.on('length', times)
      })
      const client = addClient(clients)
      client.on('length', times)
      await client.waitForConnect()
      expect(times).toHaveBeenCalledTimes(4)
      done()
    }))
  })

  describe("matching and message arriving tests", () => {
    const rooms = new Map()

    test('should match', asyncWithDone(async done => {
      const _clients = [addClient(clients), addClient(clients)]
      const times = []

      _clients.forEach(c => {
        c.on('matched', room => {
          times.push(room)
          if (times.length === 2) {
            expect(times[0]).toBe(times[1])
            done()
          }
        })
      })
    }))

    test("should generate 2 rooms and length must be 1", asyncWithDone(async done => {
      const users = [addClient(clients), addClient(clients), addClient(clients), addClient(clients), addClient(clients)]

      for (let i = 0; i < users.length; i++) {
        const user = await users[i];

        user.on('matched', room => {
          const newArray = [rooms.get(room)]
          newArray.push(user)
          rooms.set(room, newArray.filter(x => x !== undefined).flat())
          if (rooms.size === 2)
            user.emit('getLength')
        })

        user.on('getLength', l => {
          expect(l).toBe(1)
          done()
        })
      }
    }));

    test('should leave room', asyncWithDone(async done => {
      const room = rooms.keys().next().value
      const users = rooms.get(room)
      let times = 0;

      const isDone = () => {
        if (times !== 2)
          return

        rooms.delete(room)
        done()
      }

      users[0].on('leave room', () => {
        times++
        isDone()
      })
      users[1].on('leave room', () => {
        times++
        isDone()
      })

      users[0].emit('leave room')
    }))

    test('should arrive message', asyncWithDone(async done => {
      const room = rooms.keys().next().value
      const users = rooms.get(room)
      const message = 'hello world'
      let arrived = 0

      users.map(user => {
        user.on('message', m => {
          expect(m).toBe(message)
          if (++arrived === 2)
            done()
        })

        user.emit('message', message)
      })
    }))
  })
})
