<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { vectorDB, Collection, DocumentResult } from '@/services/vectordb'
import { text2vec } from '@/services/text2vec'
import { localAI, type Message } from '@/services/localai'

const collections = ref<Collection[]>([])
const collectionName = ref<string>()
const query = ref<string>()
const documentResults = ref<DocumentResult[]>([])
const reply = ref<Message>()
const isLoading = ref<boolean>(false)

onMounted(async () => {
  collections.value = await vectorDB.getCollections()
})

const onAsk = async() => {
  if (query.value && collectionName.value) {
    reply.value = undefined
    const vector = await text2vec.getEmbedding(query.value)
    documentResults.value = await vectorDB.search(collectionName.value, vector, 3)

    if (documentResults.value.length == 0) {
      return
    }

    const prompt = `
    根据下面的“上下文”作为事实基础，回答问题；如果无法在下面的“上下文“中生成回答，那么回答”对不起，我无法回答“：

    上下文： ${documentResults.value[0].content}
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
                <button class="button is-info" @click="onAsk" :disabled="isLoading">Ask</button>
              </div>
            </div>
          </div>

          <div class="block" v-if="isLoading">
            <p>Loading...</p>
          </div>
          <div class="block" v-if="reply">
            <p class="reply">{{  reply.content }}</p>
          </div>
        </div>

        <div class="column">
          <div>
            <div class="block" v-for="document in documentResults" v-bind:key="document.id">
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

<style scoped>
.reply {
  margin-top: 1em;
  white-space: pre-line;
  word-wrap: break-word;
}
</style>
