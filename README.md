Tic-Tac-Toe
------------

A multi-player Tic-Tac-Toe game using PartyServer + CloudFlare Durable Objects + Svelte.

## Usage

The game does not have any authentication.

To choose the player, pass `player` in the URL as a query string:

- http://localhost:5173?player=x
- http://localhost:5173?player=o

Without the `player` param, the session is in read-only mode, where the user can view the game, but cannot perform moves.

## License

MIT
