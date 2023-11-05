import axiox, { type AxiosInstance } from 'axios';
import process from 'process';

class Text2Vec {
    private apiClient: AxiosInstance

    constructor(client: AxiosInstance) {
        this.apiClient = client
    }

    async getEmbedding(input: string) {
        const { data } = await this.apiClient.post("/embeddings", {
            input: input
        })
        return data
    }
}


const apiClient = axiox.create({baseURL: import.meta.env.VITE_TEXT2VEC_ENDPOINT})
export const text2vec = new Text2Vec(apiClient)
