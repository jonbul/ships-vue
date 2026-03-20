<script setup lang="ts">
import NavBar from './NavBar.vue'
const username = 'Guest'
</script>

<template>
  <NavBar />
  <h1>Hello {{ username }}</h1>
  <p>
    Visit <a href="https://vuejs.org/" target="_blank" rel="noopener">vuejs.org</a> to read the
    documentation
  </p>
</template>

<style scoped></style>