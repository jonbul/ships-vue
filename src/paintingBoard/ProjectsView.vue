<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue';
import '/public/css/paintingBoard/paintingBoard.css'
const injectedScripts: HTMLScriptElement[] = [];
onMounted(() => {
  const scripts = ["/js/paintingBoard/projects.js",]
  for (const scriptSrc of scripts) {
    const script = document.createElement('script');
    script.src = `${scriptSrc}?t=${Date.now()}`;
    script.type = 'module';
    document.body.appendChild(script);
    injectedScripts.push(script);
  }
});
onUnmounted(() => {
  injectedScripts.forEach(script => script.remove());
  injectedScripts.length = 0;
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