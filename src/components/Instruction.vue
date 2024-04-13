<script setup lang="ts">
import { computed } from 'vue'
import { getPairedIndex } from '../util/utils'

const props = defineProps<{
  command?: string
}>()

const commands = computed(() => {
  if (!props.command) return []
  let ret = []
  let index = 0 
  while (index < props.command.length) {
    const char = props.command[index]
    if (char === '[') {
      const pairedIndex = getPairedIndex(props.command, index)
      const subCommand = props.command.slice(index, pairedIndex + 1)
      ret.push(subCommand)
      index = pairedIndex + 1
    } else {
      ret.push(char)
      index++
    }
  }
  console.log(props.command, ret)
  return ret
})

const isNestedCommand = (cmd: string) => {
  return cmd[0] === '['
}
</script>
<template>
  <div class="cmdWrapper">
    <div v-if="commands.length">
      <template v-for="command in commands" class="cmds">
        <div v-if="isNestedCommand(command)" class="nested">
          REPEAT
          <Instruction :command="command.slice(1, command.length - 1)" />
        </div>
        <div v-else v-for="cmd in command.split('')" class="cmd">{{ cmd }}</div>
      </template>
    </div> 
  </div>
</template>

<style scoped>
.cmdWrapper {
  width: 50px; 
  height: 100%;
}
.cmd {
  width: 100%; 
  height: 20px;
  padding: 4px;
  color: red;
  overflow: hidden;
}
.cmds {
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100px;
  background-color: #888;
  color: white;
  border: 2px solid #333;
}

.nested {
  padding-bottom: 8px;
  margin-left: 12px;
  padding-left: 4px;
  border-left: 2px solid #000;
}
</style>
