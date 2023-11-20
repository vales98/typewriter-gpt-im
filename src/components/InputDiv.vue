<template>
  <div class="msg-editor-container">
    <div ref="inputDiv" class="msg-editor" :contenteditable="!disabled" :placeholder="disabled ? disabledText : '请输入你的问题'"
      @input="handleInput" @keydown.enter.exact="handleKeydown" @paste="handlePaste"></div>
  </div>
</template>
<script lang="ts" setup>
import { ref, watch } from 'vue'
interface Props {
  disabled?: boolean
  disabledText?: string
}
withDefaults(defineProps<Props>(), {
  disabled: false,
  disabledText: ''
})
const handlePaste = function (e: ClipboardEvent) {
  e.preventDefault()
  const text = e?.clipboardData?.getData('text/plain')
  const div = document.createElement('div')
  div.innerHTML = text || ''
  const strippedText = div.textContent || div.innerText
  document.execCommand('insertHTML', false, strippedText)
}
const inputValue = ref('')
const emits = defineEmits(['submit'])
const handleInput = (e: Event) => {
  const _evnet = e as InputEvent
  const target = _evnet.target as HTMLElement
  inputValue.value = target.innerText || ''
}
const handleKeydown = (e: Event) => {
  e.stopPropagation()
  e.returnValue = false
  if (inputValue.value === '') return

  emits('submit', inputValue.value)
  inputValue.value = ''
}
const inputDiv = ref()
watch(inputValue, value => {
  const el = inputDiv.value
  if (!el) return
  if (value !== el.innerText) {
    el.innerText = value
  }
})
defineExpose({
  focus: () => {
    const el = inputDiv.value
    if (!el) return
    el.focus()
  }
})
</script>
<style lang="scss" scoped>
.msg-editor-container {
  height: 100%;
  max-height: 350px;
  overflow-y: auto;
  position: relative;
  padding: 5px;
  border: 1px solid #dee0e3;
  border-radius: 4px;
  min-height: 44px;
  padding: 9px 10px;
  box-sizing: border-box;
  display: flex;
  align-items: flex-start;

  div,
  input[type='text'] {
    padding: 0;
    outline: none;
    border: none;
  }

  .msg-editor {
    width: 100%;
    min-height: 25px;
    white-space: pre-wrap;
    word-break: break-all;
  }

  .msg-editor:empty:before {
    content: attr(placeholder);
    color: #8f959e;
    cursor: text;
    margin-left: 3px;
  }
}
</style>
