import { QdrantClient } from "@qdrant/js-client-rest";

export class Collection {
    name: string;

    constructor(name: string) {
        this.name = name
    }
}

export class Document {
    id: number | string
    content: string

    constructor(id: number | string, content: string) {
        this.id = id
        this.content = content
    }
}

export class DocumentResult {
    id: number | string
    content: string
    score?: number

    constructor(id: number | string, content: string) {
        this.id = id
        this.content = content
    }
}

export type DistanceType = "Cosine" | "Euclid" | "Dot"

export class VectorDB {
    apiClient: QdrantClient

    constructor(client: QdrantClient) {
        this.apiClient = client
    }

    async getCollections() {
        const qdrandCollection = await this.apiClient.getCollections()
        return qdrandCollection.collections.map(collection => new Collection(collection.name))
    }

    async createCollection(collectionName: string, size: number, distance: DistanceType) {
        return await this.apiClient.createCollection(collectionName, { vectors: {
            size: size,
            distance: distance
        }})
    }

    async addDocument(collectionName: string, vector: number[], documentId: number, documentContent: string) {
        return await this.apiClient.upsert(collectionName, {
            wait: true,
            points: [
                {id: documentId, vector: vector, payload: {content: documentContent}}
            ]
        })
    }

    async getDocuments(collectionName: string, limit: number = 10, offset: number | null = null) {
        const points = await this.apiClient.scroll(collectionName, {offset: offset, limit: limit})
        return points.points.map(point => new Document(point.id, (point.payload! as {content: string}).content))
    }

    async search(collection_name: string, vector: number[], limit: number) {
        const points = await this.apiClient.search(
            collection_name, {
                vector: vector,
                limit: limit,
            }
        )

        return points.map(point => {
            const document = new DocumentResult(point.id, (point.payload! as {content: string}).content)
            document.score = point.score
            return document
        })
    }
}

const defaultVectorDB = () => {
    const client = new QdrantClient({ url: import.meta.env.VITE_QDRAND_ENDPOINT});
    return new VectorDB(client)
}

export const vectorDB = defaultVectorDB()
