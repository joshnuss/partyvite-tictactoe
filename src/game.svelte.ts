import PartySocket from 'partysocket'

type Player = 'x' | 'o'
type Row = [ Player | null, Player | null, Player | null]

export class Game {
  private socket: PartySocket

  state = $state()
  cells = $state<[Row, Row, Row]>()
  player = $state()

  constructor(player: string | null) {
    this.socket = new PartySocket({
      host: window.location.host,
      room: 'room1',
      party: 'my-server',
      id: player || 'anonymous'
    })

    this.socket.addEventListener('message', (event) => this.onMessage(event))
  }

  play({x, y}: { x: number, y: number }) {
    this.send({ type: 'play', x, y })
  }

  reset() {
    this.send({ type: 'reset' })
  }

  private send(message: unknown) {
    const payload = JSON.stringify(message)
    this.socket.send(payload)
  }

  private onMessage(event: MessageEvent) {
    const { cells, state } = JSON.parse(event.data)

    this.state = state
    this.cells = cells
  }
}

