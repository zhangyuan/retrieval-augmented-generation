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
        console.log("llm response: ", data)
        return data.choices[0].message as Message
    }

    async anwser(context: string, question: string) {
        const prompt = `
            Use the following Context to answer the Question. If you can't answer the question based on the context, just reply "I've no idea.":

            Context:  ${context}
            Question: ${question}
            Anwser:`
        return this.createCompletion(prompt)
    }
}


const apiClient = axiox.create({baseURL: import.meta.env.VITE_LLM_ENDPOINT})

export const llm = new LLM(apiClient)
