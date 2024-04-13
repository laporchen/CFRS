export function getPairedIndex(command: string, index: number) {
  let stack: number[] = []
  for (let i = 0; i < command.length; i++) {
    const char = command[i]
    if (char === '[') {
      stack.push(i)
    } else if (char === ']') {
      if (!stack.length) return -1
      if (stack[stack.length - 1] === index) return i
      stack.pop()
    }
  }
  return -1
}
