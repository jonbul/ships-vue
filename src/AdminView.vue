<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue';
const injectedScripts: HTMLScriptElement[] = [];
onMounted(() => {
  const scripts = ["/js/canvas/admin.js",]
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
  <div class="container admin">
    <div class="form-register" id="form-register">
      <h1 class="h3 mb-3 font-weight-normal">Administration panel</h1>

      <div class="form-group">
        <label for="resolution" class="">Resolution</label>
        <select id="resolution" class="form-control" required autofocus name="resolution" value="">

        </select>
      </div>

      <div class="form-group">
        <label for="allowedPlayerType" class="">Players allowed</label>
        <select id="allowedPlayerType" class="form-control" required name="allowedPlayerType">

        </select>
      </div>

      <button class="btn btn-lg btn-primary btn-block" type="button" id="save">Save</button>
      <iframe id="statusMonitor" src=""
        style="width:100%; height: 1030px; border: solid 1px #ccc; margin-top:20px;"></iframe>
    </div>
  </div>
</template>

<style scoped></style>