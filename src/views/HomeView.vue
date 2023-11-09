<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { vectorDB, Collection, DocumentResult } from '@/services/vectordb'
import { text2vec } from '@/services/text2vec'
import { llm } from '@/services/llm'

const collections = ref<Collection[]>([])
const collectionName = ref<string>()
const query = ref<string>()
const documentResults = ref<DocumentResult[]>([])
const isLoading = ref<boolean>(false)
const reply = ref<string>()
const isFinished = ref<boolean>(false)
const referenceCount = 2

onMounted(async () => {
  collections.value = await vectorDB.getCollections()
})

const onAsk = async() => {
  if (query.value && collectionName.value) {
    reply.value = ""
    isFinished.value = false
    const vector = await text2vec.getEmbedding(query.value)
    documentResults.value = await vectorDB.search(collectionName.value, vector, 3)

    if (documentResults.value.length == 0) {
      return
    }

    isLoading.value = true
    const promptContext = documentResults.value.slice(0, referenceCount).map(d => d.content)
    if(typeof fetch === 'undefined') {
      try {
        reply.value = (await llm.anwser(promptContext, query.value)).content
      } finally {
        isLoading.value = false
      }
    } else {
      llm.anwserAsStream(promptContext, query.value, (message) => {
        reply.value += message
        if (reply.value) {
          isLoading.value = false
        }
      }, () => {
        isLoading.value = false
        isFinished.value = true
      })
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
            <p class="reply">{{  reply }}</p>
          </div>

          <div class="block" v-if="isFinished">
            [Completed]
          </div>
        </div>

        <div class="column">
          <div v-if="documentResults.length">
            <h2 class="title is-4">Documents retrieved</h2>
            <p class="content">Note that only the top {{  referenceCount  }} documents are used for text generation.</p>
            <div class="block" v-for="document in documentResults" v-bind:key="document.id">
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
@/services/llm
