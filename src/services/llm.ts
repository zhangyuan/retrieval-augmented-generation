import axiox, { type AxiosInstance } from 'axios';

export interface Message {
    role: string
    content: string
}

class LLM {
    private apiClient: AxiosInstance

    constructor(client: AxiosInstance) {
        this.apiClient = client
    }

    async createCompletion(prompt: string) {
        const { data } = await this.apiClient.post("/v1/chat/completions", {
            model: import.meta.env.VITE_LLM_MODEL,
            messages: [{"role": "user", "content": prompt}],
            temperature: 0.9
        })
        return data.choices[0].message as Message
    }

    buildPrompt(references: string[], question: string) {
      // set to max chars for now
      const context = references.join("\r\n")

      const prompt = `
      Asssume you are a chatbot that anwser user question based on the Reference below. If you can't answer the question based on the context, just reply "I've no idea.":

      Reference:  ${context}

      User question: ${question}
      Anwser:`.trim()

      return prompt
    }

    async anwser(references: string[], question: string) {
      const prompt = this.buildPrompt(references, question)
      console.log("prompt: ", prompt)
      return this.createCompletion(prompt)
  }

    async anwserAsStream(references: string[], question: string, onMessage: (message: string) => void, onStop: () => void) {
        const prompt = this.buildPrompt(references, question)
        console.log("prompt: ", prompt)

        const payload = {
            model: import.meta.env.VITE_LLM_MODEL,
            messages: [{ role: 'user', content: prompt }],
            temperature: 0.8,
            stream: true
        }

        const fetchResponse = await fetch(`${import.meta.env.VITE_LLM_ENDPOINT}/v1/chat/completions`, {
            method: 'POST',
            body: JSON.stringify(payload),
            headers: {
              "Content-Type": "application/json"
            }
          })

          const reader = fetchResponse.body?.getReader()
          if (!reader) {
            return
          }

          let chunk = ""
          while (true) { // eslint-disable-line no-constant-condition
            const { value, done } = await reader.read()
            if (done) {
              onStop()
              break
            }
            const decoder = new TextDecoder('utf-8')
            const chunkReceived = decoder.decode(value)

            console.log(`chunkReceived: [${chunkReceived}]`)

            chunk += chunkReceived

            if (!chunkReceived.endsWith("\n\n")) {
              continue
            }

            const messages = chunk.trim().split('\n\n')
            for (const message of messages) {
              if (message.trim() == "") {
                continue
              }
              const messageData = message.substring("data: ".length)
              const messageObject = JSON.parse(messageData)

              onMessage(messageObject.choices[0].delta.content)

              if (messageObject.choices[0].finish_reason == "stop") {
                onStop()
                break
              }
            }

            chunk = ""
          }
    }
}

const apiClient = axiox.create({baseURL: import.meta.env.VITE_LLM_ENDPOINT})

export const llm = new LLM(apiClient)
