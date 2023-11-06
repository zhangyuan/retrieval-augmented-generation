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
}


const apiClient = axiox.create({baseURL: import.meta.env.VITE_LLM_ENDPOINT})

export const llm = new LLM(apiClient)