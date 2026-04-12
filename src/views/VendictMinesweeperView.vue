<script setup>
import { computed, ref } from 'vue'

const ROWS = 8
const COLS = 8
const MINES = 10

const status = ref('Click a tile to start')
const gameOver = ref(false)
const won = ref(false)
const firstMoveDone = ref(false)
const flagsUsed = ref(0)
const board = ref(createEmptyBoard())

function createEmptyBoard() {
  return Array.from({ length: ROWS }, (_, row) =>
    Array.from({ length: COLS }, (_, col) => ({
      row,
      col,
      hasMine: false,
      revealed: false,
      flagged: false,
      adjacent: 0,
    })),
  )
}

function neighbors(row, col) {
  const result = []

  for (let dr = -1; dr <= 1; dr += 1) {
    for (let dc = -1; dc <= 1; dc += 1) {
      if (dr === 0 && dc === 0) {
        continue
      }

      const nr = row + dr
      const nc = col + dc

      if (nr >= 0 && nr < ROWS && nc >= 0 && nc < COLS) {
        result.push([nr, nc])
      }
    }
  }

  return result
}

function placeMines(safeRow, safeCol) {
  const forbidden = new Set([`${safeRow}-${safeCol}`])
  const candidates = []

  for (let row = 0; row < ROWS; row += 1) {
    for (let col = 0; col < COLS; col += 1) {
      const key = `${row}-${col}`

      if (!forbidden.has(key)) {
        candidates.push([row, col])
      }
    }
  }

  for (let index = candidates.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1))
    const tmp = candidates[index]
    candidates[index] = candidates[swapIndex]
    candidates[swapIndex] = tmp
  }

  for (let i = 0; i < MINES; i += 1) {
    const [row, col] = candidates[i]
    board.value[row][col].hasMine = true
  }

  for (let row = 0; row < ROWS; row += 1) {
    for (let col = 0; col < COLS; col += 1) {
      board.value[row][col].adjacent = neighbors(row, col).reduce((sum, [nr, nc]) => {
        return sum + Number(board.value[nr][nc].hasMine)
      }, 0)
    }
  }
}

function revealTile(row, col) {
  const tile = board.value[row][col]

  if (tile.revealed || tile.flagged || gameOver.value) {
    return
  }

  if (!firstMoveDone.value) {
    placeMines(row, col)
    firstMoveDone.value = true
    status.value = 'Game on!'
  }

  tile.revealed = true

  if (tile.hasMine) {
    gameOver.value = true
    won.value = false
    status.value = 'Boom! You hit a mine.'
    revealAllMines()
    return
  }

  if (tile.adjacent === 0) {
    for (const [nr, nc] of neighbors(row, col)) {
      if (!board.value[nr][nc].revealed) {
        revealTile(nr, nc)
      }
    }
  }

  checkWin()
}

function toggleFlag(row, col) {
  const tile = board.value[row][col]

  if (tile.revealed || gameOver.value) {
    return
  }

  tile.flagged = !tile.flagged
  flagsUsed.value += tile.flagged ? 1 : -1
}

function revealAllMines() {
  for (const row of board.value) {
    for (const tile of row) {
      if (tile.hasMine) {
        tile.revealed = true
      }
    }
  }
}

function checkWin() {
  const safeTileCount = ROWS * COLS - MINES
  const revealedSafeTiles = board.value.flat().filter((tile) => tile.revealed && !tile.hasMine).length

  if (revealedSafeTiles === safeTileCount) {
    gameOver.value = true
    won.value = true
    status.value = 'Nice! You cleared the board.'
  }
}

function resetGame() {
  board.value = createEmptyBoard()
  status.value = 'Click a tile to start'
  gameOver.value = false
  won.value = false
  firstMoveDone.value = false
  flagsUsed.value = 0
}

const minesRemaining = computed(() => Math.max(MINES - flagsUsed.value, 0))

function tileClasses(tile) {
  return {
    tile: true,
    revealed: tile.revealed,
    mine: tile.revealed && tile.hasMine,
    flagged: tile.flagged,
  }
}

function tileText(tile) {
  if (tile.flagged && !tile.revealed) {
    return '🚩'
  }

  if (!tile.revealed) {
    return ''
  }

  if (tile.hasMine) {
    return '💣'
  }

  return tile.adjacent > 0 ? tile.adjacent : ''
}
</script>

<template>
  <section>
    <h2>Vendict Minesweeper</h2>
    <p>Left click to reveal. Right click to place/remove a flag.</p>

    <div class="minesweeper-toolbar">
      <span><strong>Status:</strong> {{ status }}</span>
      <span><strong>Mines:</strong> {{ minesRemaining }}</span>
      <button type="button" class="btn accent" @click="resetGame">Reset</button>
    </div>

    <div class="board" role="grid" aria-label="Vendict Minesweeper board">
      <div v-for="(row, rowIndex) in board" :key="`row-${rowIndex}`" class="board-row" role="row">
        <button
          v-for="tile in row"
          :key="`tile-${tile.row}-${tile.col}`"
          type="button"
          :class="tileClasses(tile)"
          role="gridcell"
          @click="revealTile(tile.row, tile.col)"
          @contextmenu.prevent="toggleFlag(tile.row, tile.col)"
          :aria-label="`Tile ${tile.row + 1}, ${tile.col + 1}`"
        >
          {{ tileText(tile) }}
        </button>
      </div>
    </div>

    <p class="status" v-if="gameOver">
      {{ won ? 'Victory! You found every safe tile.' : 'Game over. Tap reset and try again.' }}
    </p>
  </section>
</template>
