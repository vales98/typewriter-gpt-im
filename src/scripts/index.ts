export class Typewriter {
  private queue: string[] = []
  private consuming = false
  private timmer: any
  constructor(private onConsume: (str: string) => void) {
  }
  dynamicSpeed() {
    const speed = 2000 / this.queue.length
    if (speed > 200) {
      return 200
    } else {
      return speed
    }
  }
  add(str: string) {
    if (!str) return
    this.queue.push(...str.split(''))
  }
  consume = () => {
    if (this.queue.length > 0) {
      const str = this.queue.shift()
      str && this.onConsume(str)
    }
  }
  next = () => {
    this.consume()
    this.timmer = setTimeout(() => {
      this.consume()
      if (this.consuming) {
        this.next()
      }
    }, this.dynamicSpeed())
  }
  start = () => {
    this.consuming = true
    this.next()
  }
  done = () => {
    this.consuming = false
    clearTimeout(this.timmer)
    this.onConsume(this.queue.join(''))
    this.queue = []
  }
}

const parsePack = (str: string) => {
  const pattern = /data:\s*({.*?})\s*\n/g
  const result = []
  let match
  while ((match = pattern.exec(str)) !== null) {
    const jsonStr = match[1]
    try {
      const json = JSON.parse(jsonStr)
      result.push(json)
    } catch (e) {
      console.log(e)
    }
  }
  return result
}

export interface GptMsg {
  role: string
  content: string
}
export type GptMsgs = Array<GptMsg>
export class StreamGpt {
  onStart: (prompt: string) => void
  onCreated: () => void
  onDone: () => void
  onPatch: (text: string) => void
  constructor(private key: string, options: {
    onStart: (prompt: string) => void
    onCreated: () => void
    onDone: () => void
    onPatch: (text: string) => void
  }) {
    const { onStart, onCreated, onDone, onPatch } = options
    this.onStart = onStart
    this.onCreated = onCreated
    this.onPatch = onPatch
    this.onDone = onDone
  }
  async stream(prompt: string, history: GptMsgs = [], preset: GptMsgs = []) {
    let finish = false
    let count = 0
    const _history = [...history]
    this.onStart(prompt)
    const res = await this.fetch([...preset, ..._history, { 'role': 'user', content: prompt }])
    if (!res.body) return
    const reader = res.body.getReader()
    const decoder: TextDecoder = new TextDecoder()
    while (!finish) {
      const { done, value } = await reader.read()
      if (done) {
        finish = true
        this.onDone()
        break
      }
      count++
      const jsonArray = parsePack(decoder.decode(value))
      if (count === 1) {
        this.onCreated()
      }
      jsonArray.forEach((json: any) => {
        if (!json.choices || json.choices.length === 0) {
          return
        }
        const text = json.choices[0].delta.content
        this.onPatch(text)
      })
    }
  }
  async fetch(messages: GptMsgs) {
    return await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages,
        stream: true
      }),
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.key}`
      }
    })
  }
}
