# Vue Usage Suggestions

Currently Vue is used as a thin shell: each view mounts a `<script>` tag pointing to a vanilla JS file that takes over the DOM directly. This works, but it means Vue's core strengths (reactivity, components, composables, type safety) go completely unused. Below are concrete suggestions for each area.

---

## 1. Replace DOM manipulation with Vue templates and reactivity

**Current pattern** (`projects.js`):
```js
const card = document.createElement('div');
card.classList.add('projectCard');
card.appendChild(title);
projectBoard.appendChild(card);
```

**Vue way** (`ProjectsView.vue`):
```vue
<script setup lang="ts">
import { ref, onMounted } from 'vue'
const projects = ref([])
onMounted(async () => {
  projects.value = await asyncRequest({ path: '/paintingBoard/projects/all', method: 'GET' })
})
</script>

<template>
  <div id="projectBoard">
    <div v-for="project in projects" :key="project._id" class="projectCard">
      <h5><a :href="`/paintingBoard?id=${project._id}`">{{ project.name }}</a></h5>
      <label>Created: {{ new Date(project.dateCreated).toLocaleDateString() }}</label>
    </div>
  </div>
</template>
```

---

## 2. Move API calls into composables

Shared logic like `asyncRequest`, `refreshToken`, and session handling is duplicated across JS files. Composables centralise it.

```ts
// src/composables/useApi.ts
export function useApi() {
  async function request<T>(path: string, method = 'GET', data?: unknown): Promise<T> {
    const res = await fetch(path, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: data ? JSON.stringify(data) : undefined,
    })
    return res.json()
  }
  return { request }
}
```

---

## 3. Move auth/session state to a Pinia store

Currently `localStorage` is read and written in multiple files (navbar.js, login.js, router). A single store removes the duplication and makes auth state reactive across all components.

```ts
// src/stores/auth.ts
import { defineStore } from 'pinia'

export const useAuthStore = defineStore('auth', {
  state: () => ({ user: null as User | null }),
  getters: {
    isLogged: (s) => !!s.user,
    isAdmin: (s) => !!s.user?.admin,
  },
  actions: {
    async fetchUser() { /* GET /userInfo */ },
    logout() { this.user = null; localStorage.removeItem('user') },
  },
})
```

The router guard and NavBar would then both read from `useAuthStore()` instead of directly from `localStorage`.

---

## 4. Replace navbar.js DOM manipulation with reactive NavBar component

`navbar.js` manually shows/hides nav items based on `user.admin` and `logged`. Since NavBar is already a Vue component, it can use the auth store directly:

```vue
<script setup lang="ts">
import { useAuthStore } from '@/stores/auth'
const auth = useAuthStore()
</script>

<template>
  <nav>
    <RouterLink v-if="!auth.isLogged" to="/login">Login</RouterLink>
    <RouterLink v-if="auth.isLogged && auth.isAdmin" to="/game/admin">Admin</RouterLink>
    <button v-if="auth.isLogged" @click="auth.logout">Logout</button>
  </nav>
</template>
```

No `document.querySelectorAll`, no `style.display = 'none'`.

---

## 5. Replace login/register JS with Vue form handling

```vue
<script setup lang="ts">
import { reactive } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useRouter } from 'vue-router'

const form = reactive({ email: '', password: '' })
const auth = useAuthStore()
const router = useRouter()

async function submit() {
  await auth.login(form.email, form.password)
  router.push('/')
}
</script>

<template>
  <form @submit.prevent="submit">
    <input v-model="form.email" type="email" placeholder="Email" />
    <input v-model="form.password" type="password" placeholder="Password" />
    <button type="submit">Login</button>
  </form>
</template>
```

---

## 6. Keep the canvas/game engine as-is, but isolate it

The game canvas logic (`game.js`, `canvasClasses.js`, etc.) is complex imperative code that is reasonable to keep in vanilla JS. The suggestion is to keep it, but load it properly as a TypeScript module imported directly into `GameView.vue` rather than injecting a `<script>` tag at runtime:

```ts
// src/game/game.ts  (rename/move from public/js/canvas/game.js)
export function initGame(canvas: HTMLCanvasElement) { ... }
```

```vue
<script setup lang="ts">
import { onMounted, onUnmounted, useTemplateRef } from 'vue'
import { initGame, destroyGame } from '@/game/game'

const canvas = useTemplateRef('gameCanvas')
onMounted(() => initGame(canvas.value!))
onUnmounted(() => destroyGame())
</script>

<template>
  <canvas ref="gameCanvas" />
</template>
```

This gives proper TypeScript checking, tree-shaking, and clean lifecycle management.

---

## Summary

| Area | Current | Suggested |
|---|---|---|
| DOM rendering | `document.createElement` in JS files | Vue templates + `v-for` / `v-if` |
| API calls | `asyncRequest` duplicated in each JS file | `useApi()` composable |
| Auth state | `localStorage` read in 4+ places | Pinia `useAuthStore` |
| Nav visibility | `querySelectorAll` + `style.display` | Reactive bindings in NavBar component |
| Forms | DOM event listeners in JS files | `v-model` + `@submit.prevent` |
| Game engine | Runtime `<script>` injection | TypeScript module imported in `GameView.vue` |
