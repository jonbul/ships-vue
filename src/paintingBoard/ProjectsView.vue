<script setup lang="ts">
import { onMounted } from 'vue';
import '/public/css/paintingBoard/paintingBoard.css'
onMounted(() => {
  const scripts = ["/js/paintingBoard/projects.js",]
  for (const scriptSrc of scripts) {
    const script = document.createElement('script');
    script.src = scriptSrc;
    script.type = 'module';
    document.body.appendChild(script);
  }
});
</script>

<template>
  <div class="container projects">
    <a id="newProjectBtn" href="/paintingBoard" class="btn btn-primary mt-5">New</a>
    <div id="projectBoard">


    </div>
  </div>
</template>

<style scoped></style>