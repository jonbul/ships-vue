<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue';
const injectedScripts: HTMLScriptElement[] = [];
onMounted(() => {
  const scripts = ["/js/user/register.js",]
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
  <div class="container register">
    <div class="form-register" id="form-register">
      <h1 class="h3 mb-3 font-weight-normal">Register</h1>

      <div class="form-group">
        <label for="username" class="">User Name</label>
        <input type="text" id="username" class="form-control" placeholder="User Name" autofocus name="username">
      </div>

      <div class="form-group">
        <label for="inputEmail" class="">Email address</label>
        <input type="email" id="inputEmail" class="form-control" placeholder="Email address" name="email">
      </div>

      <div class="form-group">
        <label for="inputPassword" class="">Password</label>
        <input type="password" id="inputPassword" class="form-control" placeholder="Password" name="password">
      </div>

      <div class="form-group">
        <label for="inputRepeatPassword" class="">Repeat Password</label>
        <input type="password" id="inputRepeatPassword" class="form-control" placeholder="Repeat Password"
          name="cpassword">
      </div>

      <button class="btn btn-lg btn-primary btn-block" type="button" id="register">Register</button>
      <span class="ml-auto">Already have an account? <RouterLink to="/login">Login here</RouterLink></span>
    </div>
  </div>
</template>

<style scoped></style>