<template>
  <div class="container">
    <div class="msg" ref="listEl">
      <Msg v-for="(msg, index) in msgList" :role="msg.role" :content="msg.content" :key="index"></Msg>
      <Msg v-if="streaming" role="system" :content="streamingText" :streaming="true"></Msg>
    </div>
    <div class="input">
      <InputDiv v-model:value="inputValue" @submit="handleSubmit"></InputDiv>
    </div>
  </div>
</template>
<script lang="ts" setup>
import { ref, nextTick, watch } from 'vue'
import InputDiv from '../components/InputDiv.vue'
import Msg from '../components/Msg.vue'
import { useScroll } from '@vueuse/core'
import { useGpt } from '../hooks/useGpt'
import config from '../config'
interface Msg {
  role: string
  content: string
}
const inputValue = ref('')
const { msgList, streaming, streamingText, stream } = useGpt(config.key, true)
const listEl = ref()
const { y } = useScroll(listEl)
const scrollToBottom = () => {
  nextTick(() => {
    y.value = listEl.value?.scrollHeight || 0
  })
}
watch(streamingText, (val) => {
  if (val) {
    scrollToBottom()
  }
})
const handleSubmit = (content: string) => {
  if (content === '') return
  stream(content)
}
</script>
<style lang="scss" scoped>
.container {
  height: 100%;
  width: 100%;
  display: flex;
  flex-direction: column;
  background-color: #f5f5f5;

  .input {
    width: 100%;
    min-height: 150px;
  }

  .msg {
    width: 100%;
    flex: 1;
    overflow-y: auto;
    padding: 24px;
  }
}
</style>