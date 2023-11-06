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

    async anwser(context: string, question: string) {
        const prompt = `
            Use the following Context to answer the Question. If you can't answer the question based on the context, just reply "I've no idea.":

            Context:  ${context}
            Question: ${question}
            Anwser:`.trim()
        return this.createCompletion(prompt)
    }

    async anwserAsStream(context: string, question: string, onMessage: (message: string) => void, onStop: () => void) {
        const prompt = `
        Use the following Context to answer the Question. If you can't answer the question based on the context, just reply "I've no idea.":

        Context:  ${context}
        Question: ${question}
        Anwser:`.trim()

        console.log("prompt:", prompt)

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

          while (true) { // eslint-disable-line no-constant-condition
            const { value, done } = await reader.read()
            if (done) {
              onStop()
              break
            }
            const decoder = new TextDecoder('utf-8')
            const chunk = decoder.decode(value)

            const messages = chunk.trim().split('\n\n')
            for (const message of messages) {
              const messageData = message.substring("data: ".length)
              const messageObject = JSON.parse(messageData)

              if (messageObject.choices[0].finish_reason == "stop") {
                break
              }

              onMessage(messageObject.choices[0].delta.content)
            }
          }
    }
}

const apiClient = axiox.create({baseURL: import.meta.env.VITE_LLM_ENDPOINT})

export const llm = new LLM(apiClient)
