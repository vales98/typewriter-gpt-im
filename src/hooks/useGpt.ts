
import { ref } from 'vue'
import { StreamGpt, Typewriter, GptMsgs } from '../scripts'
export const useGpt = (key: string, history: boolean = false) => {
  const streamingText = ref('')
  const streaming = ref(false)
  const msgList = ref<GptMsgs>([])
  const typewriter = new Typewriter((str: string) => {
    streamingText.value += str || ''
    console.log('str', str)
  })
  const gpt = new StreamGpt(key, {
    onStart: (prompt: string) => {
      streaming.value = true
      msgList.value.push({
        role: 'user',
        content: prompt
      })
    },
    onPatch: (text: string) => {
      console.log('onPatch', text)
      typewriter.add(text)
    },
    onCreated: () => {
      typewriter.start()
    },
    onDone: () => {
      typewriter.done()
      streaming.value = false
      msgList.value.push({
        role: 'system',
        content: streamingText.value
      })
      streamingText.value = ''
    }
  })
  const stream = (prompt: string) => {
    gpt.stream(prompt, history ? msgList.value : undefined)
  }
  return {
    streamingText,
    streaming,
    msgList,
    stream
  }
}
