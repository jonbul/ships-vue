<script setup lang="ts">
import { onMounted } from 'vue';
import '/public/css/paintingBoard/paintingBoard.css'
import WindowsView from './WindowsView.vue'
onMounted(() => {
  const scripts = ["/js/paintingBoard/paintingBoard.js",]
  for (const scriptSrc of scripts) {
    const script = document.createElement('script');
    script.src = scriptSrc;
    script.type = 'module';
    document.body.appendChild(script);
  }
});
</script>

<template>
  <div class="container paintingBoard">
    <div id="paintingBoard" class="paintingBoardWindowed">
      <div id="projectTitleBar">
        <input id="projectName" class="" placeholder="Name">
        <button class="btn btn-primary" value="save" id="save">Save</button>

        Resolution
        <input type="number" id="boardW" min="0" />
        x
        <input type="number" id="boardH" min="0" />
        Zoom
        <input type="number" id="boardZoom" value="100" title="Ctrl + Scroll" step="5" />%
      </div>

      <div id="canvasBorder">
        <canvas id="canvas" width="800" height="600" tool="pencil"></canvas>
      </div>

      <WindowsView />
    </div>
  </div>
</template>

<style scoped></style>