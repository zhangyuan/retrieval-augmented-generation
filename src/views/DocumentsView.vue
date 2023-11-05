<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';
import { vectorDB, Collection, Document } from '@/services/vectordb'
import { text2vec } from '@/services/text2vec'

const collections = ref<Collection[]>([])

const collectionName = ref<string>()
const documentId = ref<number>()
const documentContent = ref<string>()

const documents = ref<Document[]>([])

onMounted(async () => {
  collections.value = await vectorDB.getCollections()
})

watch(collectionName, async newValue => {
  if (newValue) {
    documents.value = await vectorDB.getDocuments(newValue, 10, null)
  }
})


const onSubmit = async () => {
  if (documentId.value && collectionName.value && documentContent.value) {
    const vector = await text2vec.getEmbedding(documentContent.value)

    await vectorDB.addDocument(
      collectionName.value, vector, documentId.value, documentContent.value
    )

    documentId.value = undefined
    documentContent.value = undefined

    documents.value = await vectorDB.getDocuments(collectionName.value, 10, null)
  }

}

</script>

<template>
  <main>
    <div class="container">
      <h1 class="title">Documents</h1>
      <div class="columns">
        <div class="column">
          <div class="form" v-if="collections.length">
            <h2 class="title is-4">Create or update document</h2>
            <div class="field">
              <label class="label">Collection</label>
              <div class="control">
                <div class="select">
                  <select v-model="collectionName">
                  <option v-for="collection in collections" v-bind:key="collection.name">{{  collection.name }}</option>
                </select>
                </div>
              </div>
            </div>
            <div class="field">
              <label class="label">Document ID</label>
              <div class="control">
                <input class="input" type="number" min="1" step="1" v-model="documentId" />
              </div>
            </div>
            <div class="field">
              <label class="label">Document content</label>
              <div class="control">
                <textarea v-model="documentContent" cols="30" rows="10" class="textarea"></textarea>
              </div>
            </div>

            <div class="field">
              <div class="control">
                <button class="button is-link" @click="onSubmit">Create</button>
              </div>
            </div>
          </div>

        </div>
        <div class="column">
          <div class="block" v-for="document in documents" v-bind:key="document.id">
            <div class="box">
              <div><b>ID</b> {{ document.id }} </div>
              <div class="content"> {{ document.content }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </main>
</template>
