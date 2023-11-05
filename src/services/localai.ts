import axiox, { type AxiosInstance } from 'axios';

export interface Message {
    role: string
    content: string
}

class LocalAI {
    private apiClient: AxiosInstance

    constructor(client: AxiosInstance) {
        this.apiClient = client
    }

    async createCompletion(prompt: string) {
        const { data } = await this.apiClient.post("/v1/chat/completions", {
            model: "baichuan-vicuna-7b.ggmlv3.q4_0.bin",
            messages: [{"role": "user", "content": prompt}],
            temperature: 0.9
        })
        console.log("localai response: ", data)
        return data.choices[0].message as Message
    }
}


const apiClient = axiox.create({baseURL: import.meta.env.VITE_LOCALAI_ENDPOINT})

export const localAI = new LocalAI(apiClient)
