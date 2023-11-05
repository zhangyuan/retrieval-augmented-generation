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

    async getDocuments(collectionName: string, limit: number = 10, offset: number | null) {
        const points = await this.apiClient.scroll(collectionName, {offset: offset, limit: limit})
        return points.points.map(point => new Document(point.id, (point.payload! as {content: string}).content))
    }
}

const defaultVectorDB = () => {
    const client = new QdrantClient({ host: "localhost", port: 6333 });
    return new VectorDB(client)
}

export const vectorDB = defaultVectorDB()
