<script setup lang="ts">
import '../public/css/game.css'
import { onMounted } from 'vue';
onMounted(() => {
  const scripts = ["/js/canvas/gameStatus.js",]
  for (const scriptSrc of scripts) {
    const script = document.createElement('script');
    script.src = scriptSrc;
    script.type = 'module';
    document.body.appendChild(script);
  }
});
</script>

<template>
  <div class="container gameStatus">
    <canvas class="mt-2" id="canvas"></canvas>
    <table>
      <thead>
        <tr>
          <th style="width: 25%;">Name</th>
          <th style="width: 25%;">Deaths</th>
          <th style="width: 25%;">Kills</th>
          <th style="width: 25%;">socketId</th>
        </tr>
      </thead>
      <tbody id="playersDetails">

      </tbody>
    </table>
  </div>
</template>

<style scoped></style>