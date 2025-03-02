type Player = 'x' | 'o'
type Point = { x: number, y: number }
type Row = [ Player | null, Player | null, Player | null ]
type Cells = [ Row, Row, Row ]
type Callback = (game: Game) => void

type PlayingState = {
  status: 'playing'
  turn: Player
}

type TiedState = {
  status: 'tied'
}

type WonState = {
  status: 'won'
  style:
    { type: 'x', x: number } |
    { type: 'y', y: number } |
    { type: 'slash' } |
    { type: 'backslash' }
  winner: Player
}

type State = PlayingState | TiedState | WonState

export class Game {
  cells: Cells = [
    [ null, null, null ],
    [ null, null, null ],
    [ null, null, null ]
  ]
  state: State = {
    status: 'playing',
    turn: 'x'
  }

  private callbacks = new Set<Callback>()

  subscribe(callback: Callback) {
    this.callbacks.add(callback)

    return () => {
      this.callbacks.delete(callback)
    }
  }

  play(player: Player, position: Point) {
    if (this.state.status != 'playing') throw new Error(`Cannot play when ${this.state.status}.`)
    if (player != this.state.turn) throw new Error(`Cannot play ${player}. It's ${this.state.turn}'s turn.`)
    if (this.cells[position.y][position.x]) throw new Error(`Cell is already occupied by ${this.cells[position.y][position.x]}`)

    this.cells[position.y][position.x] = player
    this.state.turn = player == 'x' ? 'o' : 'x'
    
    this.maybeFinished(player)
    this.broadcast()
  }

  reset() {
    this.state = {
      status: 'playing',
      turn: 'x'
    }
    this.cells = [
      [ null, null, null ],
      [ null, null, null ],
      [ null, null, null ],
    ]
    this.broadcast()
  }

  private maybeFinished(player: Player): boolean {
    return this.maybeTied() || this.maybeWon(player)
  }

  private maybeTied(): boolean {
    const tied = this.cells.every((row) => {
      return !row.includes(null)
    })

    if (tied) {
      this.state = { status: 'tied' }
      return true
    }

    return false
  }

  private maybeWon(player: Player): boolean {
    for (let y = 0; y < 3; y++) {
      if (this.cells[y].every((cell) => cell == player)) {
        this.state = {
          status: 'won',
          style: { type: 'y', y },
          winner: player
        }
        return true
      }
    }

    for (let x = 0; x < 3; x++) {
      const cells = []
      
      for (let y = 0; y < 3; y++) {
        cells.push(this.cells[y][x])
      }

      if (cells.every((cell) => cell == player)) {
        this.state = {
          status: 'won',
          style: { type: 'x', x },
          winner: player
        }
        return true
      }
    }

    for (let i=0; i < 3; i++) {
      if (this.cells[i][i] != player) {
        break
      }

      if (i==2) {
        this.state = {
          status: 'won',
          style: { type: 'backslash' },
          winner: player
        }

        return true
      }
    }

    for (let i=0;i<3; i++) {
      if (this.cells[2-i][i] != player) {
        break
      }

      if (i==2) {
        this.state = {
          status: 'won',
          style: { type: 'slash' },
          winner: player
        }

        return true
      }
    }

    return false
  }

  private broadcast() {
    this.callbacks.forEach((callback) => callback(this))
  }
}

