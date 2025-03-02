<script lang="ts">
  import PartySocket from 'partysocket'
  import { onMount } from 'svelte'

  class Game {
    private socket: PartySocket

    state = $state()
    cells = $state()
    player = $state()

    constructor(player: 'x' | 'o') {
      this.socket = new PartySocket({
        host: window.location.host,
        room: 'room1',
        party: 'my-server',
        id: player
      })

      this.socket.addEventListener('message', (event) => this.onMessage(event))
    }

    play({x, y}) {
      this.send({
        type: 'play',
        player: this.player,
        x,
        y
      })
    }

    reset() {
      this.send({ type: 'reset' })
    }

    private send(message: unknown) {
      const payload = JSON.stringify(message)
      this.socket.send(payload)
    }

    private onMessage(event: MessageEvent) {
    console.log(event.data)
      const { cells, state } = JSON.parse(event.data)

      this.state = state
      this.cells = cells
    }
  }

  const url = new URL(window.location.href)
  const player = url.searchParams.get('player')
  const game = new Game(player)

  function play({ x, y }) {
    console.log({ x, y })

    game.play({ x, y })
  }
</script>

<header>
  Player: {player}
</header>
<main>
  {#if game.cells}
    {#each { length: 3 }, y}
      {#each { length: 3 }, x}
        <button onclick={() => play({x, y})}>
          <svg viewBox="0 0 10 10">
            {#if game.cells[y][x]}
              {#if game.cells[y][x] == 'x'}
                <line x1=0 y1=0 x2=10 y2=10/>
                <line x1=10 y1=0 x2=0 y2=10/>
              {:else}
                <circle cx=5 cy=5 r=5/>
              {/if}
            {/if}
          </svg>
        </button>
      {/each}
    {/each}
  {/if}
</main>

<style>
  main {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: var(--size-4);
    max-width: min(90vw, 90vh);
    background: var(--gray-7);
    border-radius: var(--radius-2);

    button {
      background: var(--gray-1);
      border: none;
      border-radius: none;
      aspect-ratio: 1 / 1;
      display: grid;
      place-items: center;
      font-size: 30px;
    }
  }

  svg {
    width: 70%;
    margin: 1rem;
    overflow: visible;
  }

  circle, line {
    stroke-width: 3px;
    animation: var(--animation-slide-in-up);
  }

  line {
    stroke: var(--blue-5);
    stroke-linecap: round;
  }

  circle {
    stroke: var(--red-5);
    fill: none;
  }

  header {
    position: fixed;
    top: 0;
    font-size: var(--font-size-5);
  }
</style>
