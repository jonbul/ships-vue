<script setup lang="ts">
import NavBar from './NavBar.vue'
import '../public/css/layout.css'
const username = 'Guest'
</script>

<template>
  <NavBar />
  <RouterView />
</template>

<style scoped></style>