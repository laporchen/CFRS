<script setup lang="ts">
import { ref, reactive, onMounted, computed, watch } from 'vue'
import { getPairedIndex } from './util/utils'

import Instruction from './components/Instruction.vue'

const canvaSize = ref(256 * 3)
const pixelSize = computed(() => {
  return canvaSize.value / 256
})
const directions = [
  { x: 0, y: -1 }, // up
  { x: 1, y: -1 }, // up right
  { x: 1, y: 0 }, // right
  { x: 1, y: 1 }, // down right
  { x: 0, y: 1 }, // down
  { x: -1, y: 1 }, // down left
  { x: -1, y: 0 }, // left
  { x: -1, y: -1 }, // up left
]

const colors = [
  '#ffffff',
  '#000000',
  '#3366ff',
  '#00cc00',
  '#00cccc',
  '#cc0000',
  '#cc00cc',
  '#cccc00',
]
const colorIndex = ref(0)
const currentDirection = ref(0) // up
const position = reactive({
  x: canvaSize.value / 2 - 1,
  y: canvaSize.value / 2 - 1,
})

const canvas = ref<HTMLCanvasElement | null>(null)
const initCanvas = () => {
  if (!canvas.value) {
    console.warn('Canvas not found')
    return
  }
  // fill canvas with black color
  const ctx = canvas.value.getContext('2d')
  if (!ctx) {
    console.warn('Canvas context not found')
    return
  }
  ctx.fillStyle = colors[1]
  ctx.fillRect(0, 0, canvaSize.value, canvaSize.value)
}

const drawPixel = () => {
  if (!canvas.value) {
    console.warn('Canvas not found')
    return
  } 
  const ctx = canvas.value.getContext('2d')
  if (!ctx) return
  ctx.fillStyle = colors[colorIndex.value]
  ctx.fillRect(position.x, position.y, pixelSize.value, pixelSize.value)
}
const commands = ref('')

const nextColor = () => {
  colorIndex.value = (colorIndex.value + 1) % colors.length
}

const turnClockwise = () => {
  currentDirection.value = (currentDirection.value + 1) % directions.length
}

const movePosition = () => {
  position.x += directions[currentDirection.value].x * pixelSize.value
  position.y += directions[currentDirection.value].y * pixelSize.value
  // wrap around
  if (position.x < 0) position.x = canvaSize.value - pixelSize.value
  if (position.x >= canvaSize.value) position.x = 0
  if (position.y < 0) position.y = canvaSize.value - pixelSize.value
  if (position.y >= canvaSize.value) position.y = 0
}

const commandOperations: Record<string, () => any>  = {
  'F': () => {
    movePosition()
    drawPixel()
  },
  'R': turnClockwise,
  'C': nextColor,
}

function validateCommand(command: string) {
  let stack = []
  for (let i = 0; i < command.length; i++) {
    const char = command[i]
    if (char === '[') {
      stack.push(i)
    } else if (char === ']') {
      if (!stack.length) return false
      stack.pop()
    }
    else {
      if (commandOperations[char] === undefined) return false
    }
  }

  return stack.length === 0
}

/**
* Parse commands
* Only pass in valid commands
* @param command
*/
function parseCommands(command: string) {
  const cleanCommand = command.trim()
  if (!cleanCommand.length) return

  let index = 0
  while (index < cleanCommand.length) {
    const char = cleanCommand[index]
    if (char === '[') {
      const pairedIndex = getPairedIndex(cleanCommand, index)
      const subCommand = cleanCommand.slice(index + 1, pairedIndex)
      parseCommands(subCommand)
      parseCommands(subCommand)
      index = pairedIndex + 1
    } else {
      commandOperations[char]()
      index++
    }
  }
}

const isCommandValid = computed(() => {
  return validateCommand(commands.value)
})

function run() {
  if (!validateCommand(commands.value)) {
    window.alert('Invalid command')
    return
  }
  initCanvas()
  currentDirection.value = 0
  colorIndex.value = 0
  position.x = Math.floor(canvaSize.value / 2) - 1
  position.y = Math.floor(canvaSize.value / 2) - 1
  
  parseCommands(commands.value)
}

onMounted(() => {
  initCanvas()
})

watch(canvaSize, () => {
  initCanvas()
})
</script>

<template>
  <div class="wrapper">
    <div class="inputs">
      <div>
        F - Move forward, R - Turn 45 degree clockwise, C - Change to next color <br>
        [ ] - Repeat commands inside square brackets
      </div>
      <div class="cmd">
        <input v-model="commands" class="cmdString" placeholder="Enter commands" />
        <button @click="run">Run</button>
      </div>
    </div>
    <Instruction class="instruction" v-if="isCommandValid" :command="commands" />
    <canvas ref="canvas" id="canvas" :width="canvaSize" :height="canvaSize"></canvas>
  </div>
</template>

<style scoped lang="css">
.wrapper {
  width: 100vw;
  height: 100vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  background-color: #f0f0f0;
}

.inputs {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}

.cmd {
  display: flex;
  justify-content: center;
  align-items: center;
}

.cmdString {
  width: 600px;
}

.instruction {
  position: absolute;
  top: 10px;
  left: 10px;
  font-size: 20px;
}

</style>
