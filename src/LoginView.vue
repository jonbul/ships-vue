<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue';
const injectedScripts: HTMLScriptElement[] = [];
onMounted(() => {
  const scripts = ["/js/user/login.js",]
  for (const scriptSrc of scripts) {
    const script = document.createElement('script');
    script.src = scriptSrc;
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
  <div class="container login">
    <div id="form-login" class="form-signin">
      <div class="form-group">

        <h1 class="h3 mb-3 font-weight-normal mt-5">Sign in</h1>

        <div class="form-group">
          <label for="inputEmail" class="sr-only">Email address</label>
          <input type="email" id="inputEmail" class="form-control" placeholder="Email address" autofocus name="email"
            value="">
        </div>

        <div class="form-group">
          <label for="inputPassword" class="sr-only">Password</label>
          <input type="password" id="inputPassword" class="form-control" placeholder="Password" name="password">
        </div>

        <div class="form-check">
          <input class="form-check-input" type="checkbox" id="rememberMe">
          <label class="form-check-label" for="rememberMe">
            Remember me
          </label>
        </div>

        <button class="btn btn-lg btn-primary btn-block" type="button" id="btnLogin">Login</button>
        <span>Don't have an account? <a href="/register">Register here</a></span>
      </div>
    </div>
  </div>
</template>

<style scoped></style>