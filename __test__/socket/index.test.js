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

  describe("length and message arriving tests", () => {
    afterEach(() => {
      clients.forEach(c => c.off())
    })

    afterAll(() => {
      clients.forEach(c => c.close())
      clients.splice(0)
    });


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
      const message = 'hello world'
      const index = Math.floor(Math.random() * (clients.length - 1));
      const mockFunc = jest.fn()
      let times = 0
      clients.forEach(c => {
        c.on('matched', (room) => {
          c.emit('message', { room, message })
        })

        c.on('message', message => {
          mockFunc(message)
          if (++times === 2) {
            expect(mockFunc.mock.calls.length).toBe(2)
            expect(mockFunc.mock.calls).toEqual([[message], [message]])
            done()
          }
        })
      })
      const client = clients[index]
      client.emit('match')
    }))
  })


  describe("matching tests", () => {
    test("should return length 4", asyncWithDone(async done => {
      const client = await addClient(clients)
      await addClient(clients)
      await addClient(clients)
      await addClient(clients)

      client.on('getLength', length => {
        expect(length).toBe(4)
        expect(clients.length).toBe(4)
        done()
      })

      client.emit('getLength')
    }));

    test('should length exclude matched sockets', asyncWithDone(async done => {
      const [client1, client2, client3, client4] = clients

      [client1, clien2].forEach(c => {
        c.on('matched', () => {
          client3.emit('getLength', l => {
            expect(l).toBe(2)
          })

          client4.emit('getLength', l => {
            expect(l).toBe(2)
          })
        })
      })

      client1.emit('match')
      client2.emit('match')
    }))
  })
})
