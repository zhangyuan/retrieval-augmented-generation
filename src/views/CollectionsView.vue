<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { vectorDB, Collection, type DistanceType } from '@/services/vectordb'

const collectionName = ref<string>()
const size = ref<number>(384)
const distanceType = ref<DistanceType>("Cosine")

const collections = ref<Collection[]>([])

const refreshCollections = async () => {
  collections.value = await vectorDB.getCollections()
}

onMounted(async () => {
  await refreshCollections()
})

const onSubmit = async () => {
  if (collectionName.value && size.value && distanceType.value) {
    await vectorDB.createCollection(collectionName.value, size.value, distanceType.value)
    collectionName.value = undefined
  }

  await refreshCollections()
}

</script>

<template>
  <main>
    <div class="container">
      <h1 class="title">Collections</h1>
      <div class="columns">
        <div class="column">
          <h2 class="title is-4">Create Collections</h2>
          <div class="form">
            <div class="field">
              <label class="label">Name</label>
              <div class="control">
                <input type="text" v-model="collectionName" class="input">
              </div>
            </div>

            <div class="field">
              <label class="label">Size</label>
              <div class="control">
                <div class="select">
                  <select v-model="size">
                    <option value="384">384</option>
                  </select>
                </div>
              </div>
            </div>

            <div class="field">
              <label class="label">Distance Type</label>
              <div class="control">
                <div class="select">
                  <select v-model="distanceType">
                    <option value="Cosine">Cosine</option>
                  </select>
                </div>
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
          <div>
            <h2 class="title is-4">Collection List</h2>
            <div class="block" v-for="collection in collections" v-bind:key="collection.name" >
              <div class="box">
                <div><b>{{  collection.name }}</b> </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </main>
</template>
