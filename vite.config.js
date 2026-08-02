import { resolve } from 'path';
import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        party: resolve(__dirname, 'party.html'),
        singleplayer: resolve(__dirname, 'singleplayer.html'),
        offline: resolve(__dirname, 'offline.html'),
        console: resolve(__dirname, 'console.html'),
        controller: resolve(__dirname, 'controller.html'),
        blackholeninja: resolve(__dirname, 'games/blackholeninja.html'),
        blockblast: resolve(__dirname, 'games/blockblast.html'),
        blockblastExtreme: resolve(__dirname, 'games/blockblast-extreme.html'),
        molehammer: resolve(__dirname, 'games/molehammer.html'),
        pacman: resolve(__dirname, 'games/pacman.html'),
        pong: resolve(__dirname, 'games/pong.html'),
        snake: resolve(__dirname, 'games/snake.html'),
        snakebattle: resolve(__dirname, 'games/snakebattle.html'),
        spacerangers: resolve(__dirname, 'games/spacerangers.html'),
        tetris: resolve(__dirname, 'games/tetris.html'),
        troopers: resolve(__dirname, 'games/troopers.html'),
        wordle: resolve(__dirname, 'games/wordle.html')
      }
    }
  }
});
