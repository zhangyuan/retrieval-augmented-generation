<script setup lang="ts">
import { RouterView } from 'vue-router'
</script>

<template>
  <nav class="navbar" role="navigation" aria-label="main navigation">
    <div class="navbar-brand">
      <router-link class="navbar-item" to="/">Home</router-link>
      <router-link class="navbar-item" to="/documents">Documents</router-link>
      <router-link class="navbar-item" to="/collections">Collections</router-link>
    </div>
  </nav>

  <RouterView />
</template>

<style scoped>

</style>
