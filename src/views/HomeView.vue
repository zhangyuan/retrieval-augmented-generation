<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { vectorDB, Collection, DocumentResult } from '@/services/vectordb'
import { text2vec } from '@/services/text2vec'
import { localAI, type Message } from '@/services/localai'

const collections = ref<Collection[]>([])
const collectionName = ref<string>()
const query = ref<string>()
const documents = ref<DocumentResult[]>([])
const reply = ref<Message>()
const isLoading = ref<boolean>(false)

onMounted(async () => {
  collections.value = await vectorDB.getCollections()
})

const onAsk = async() => {
  if (query.value && collectionName.value) {
    const vector = await text2vec.getEmbedding(query.value)
    documents.value = await vectorDB.search(collectionName.value, vector, 3)

    if (documents.value.length == 0) {
      return
    }


    const prompt = `
    总结以下的上下文，并回答问题。如果你不确定怎么回答，那么回答：“对不起，我无法回答。”

    上下文： ${documents.value[0].content}
    问题： ${query.value}
    回答：
    `

    console.log("prompt: ", prompt);

    isLoading.value = true
    try {
      reply.value = await localAI.createCompletion(prompt)
    } finally {
      isLoading.value = false
    }
  }
}
</script>

<template>
  <main>
    <div class="container">
      <h1 class="title">Retrieval Augmented Generation</h1>

      <div class="columns">
        <div class="column">
          <div>
            <div class="field has-addons">
              <div class="control">
                <span class="select">
                  <select v-model="collectionName">
                    <option v-for="collection in collections" v-bind:key="collection.name">{{ collection.name }}</option>
                  </select>
                </span>
              </div>
              <div class="control is-expanded">
                <input type="text" class="input" v-model="query" placeholder="search"></div>
              <div class="control">
                <button class="button is-info" @click="onAsk">Ask</button>
              </div>
            </div>
          </div>

          <div class="block" v-if="isLoading">
            <p>Loading...</p>
          </div>
          <div class="block" v-if="reply">
            <div class="content">
              {{  reply.content }}
            </div>
          </div>
        </div>

        <div class="column">
          <div>
            <div class="block" v-for="document in documents" v-bind:key="document.id">
              <h2 class="title is-4">Documents retrieved</h2>
              <p class="content">Note that only the first document is used for text generation.</p>
              <div class="box">
                <div><b>ID</b> {{ document.id }}</div>
                <div><b>Score</b> {{ document.score }}</div>
                <div class="content">{{ document.content }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </main>
</template>
