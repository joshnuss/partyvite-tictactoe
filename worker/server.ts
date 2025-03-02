import { Server, type Connection, routePartykitRequest } from "partyserver"
import { Game } from './game.ts'

type Env = {
  MyServer: DurableObjectNamespace<MyServer>
}

export class MyServer extends Server<Env> {
  private game = new Game()

  onStart() {
    console.log(this.ctx.storage)
    this.game.subscribe((game) => {
      const payload = JSON.stringify({
        state: game.state,
        cells: game.cells
      })
      this.broadcast(payload)
    })
  }

  onConnect(conn: Connection) {
    const message = JSON.stringify({
      state: this.game.state,
      cells: this.game.cells
    })
    conn.send(message)
  }

  onMessage(conn: Connection, payload: string) {
    const message = JSON.parse(payload)

    if (conn.id != 'x' && conn.id != 'o') {
      throw Error('Only active players can make moves')
    }

    this.game.play(conn.id, message)
  }

  onError(conn: Connection, error: Error) {
    console.error(error)
  }
}

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext) {
    return (
      (await routePartykitRequest(request, env)) ||
      new Response("Not found", {
        status: 404,
      })
    )
  },
} satisfies ExportedHandler<Env>
