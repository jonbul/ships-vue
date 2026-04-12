<script setup lang="ts">
import { onMounted } from 'vue';
onMounted(() => {
  const scripts = ["/js/canvas/admin.js",]
  for (const scriptSrc of scripts) {
    const script = document.createElement('script');
    script.src = scriptSrc;
    script.type = 'module';
    document.body.appendChild(script);
  }
});
</script>

<template>
  <div class="container admin">
    <div class="form-register" id="form-register">
      <h1 class="h3 mb-3 font-weight-normal">Administration panel</h1>

      <div class="form-group">
        <label for="resolution" class="">Resolution</label>
        <select type="text" id="resolution" class="form-control" required="true" autofocus="true" name="resolution"
          value="">

        </select>
      </div>

      <div class="form-group">
        <label for="allowedPlayerType" class="">Players allowed</label>
        <select type="text" id="allowedPlayerType" class="form-control" required="true" name="allowedPlayerType">

        </select>
      </div>

      <button class="btn btn-lg btn-primary btn-block" type="submit" id="save">Save</button>
      <iframe id="statusMonitor" src=""
        style="width:100%; height: 1030px; border: solid 1px #ccc; margin-top:20px;"></iframe>
    </div>
  </div>
</template>

<style scoped></style>