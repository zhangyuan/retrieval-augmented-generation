import axiox, { type AxiosInstance } from 'axios';

class Text2Vec {
    apiClient: AxiosInstance

    constructor(client: AxiosInstance) {
        this.apiClient = client
    }

    async getEmbedding(input: string) {
        return await this.apiClient.post("/embeddings", {
            input: input
        })
    }
}


const apiClient = axiox.create({baseURL: "http://localhost:8000"})
export const text2vec = new Text2Vec(apiClient)
