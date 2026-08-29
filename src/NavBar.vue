<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue'
import "../public/css/layout.css"

const injectedScripts: HTMLScriptElement[] = [];

function closeMenu() {
    const menu = document.getElementById('navbarMenu')
    if (menu) menu.removeAttribute('collapsed-expanded')
}

onMounted(() => {
    const scripts = ["/js/navbar.js",]
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
    <nav id="mainNavbar">
        <!-- vue -->
        <RouterLink class="mainNavbar-brand" to="/">JAES</RouterLink>
        <button class="navbar-button" type="button" data-toggle="collapse" data-target="#navbarNav"
            aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
            &#9776;
        </button>
        <ul class="navbarMenu collapsable" id="navbarMenu">
            <li class="nav-item">
                <RouterLink class="nav-link" to="/" @click="closeMenu">Home</RouterLink>
            </li>
            <li class="nav-item">
                <RouterLink class="nav-link" to="/game" @click="closeMenu">Game</RouterLink>
            </li>
            <li class="nav-item logged">
                <RouterLink class="nav-link" to="/paintingBoard/projects" @click="closeMenu">Painting Projects</RouterLink>
            </li>
            <li class="nav-item logged admin">
                <RouterLink class="nav-link" to="/game/status" @click="closeMenu">GameStatus</RouterLink>
            </li>
            <li class="nav-item logged admin">
                <RouterLink class="nav-link" to="/game/admin" @click="closeMenu">Admin</RouterLink>
            </li>
        </ul>
        <ul class="navbarMenu" id="navbarMenuRight">
            <li class="nav-item nologged">
                <RouterLink to="/login" class="nav-link">Login</RouterLink>
            </li>
            <li class="nav-item nologged">
                <RouterLink to="/register" class="nav-link">Register</RouterLink>
            </li>

            <li class="nav-item logged profile">
                <RouterLink to="/profile" class="nav-link">
                    👤
                    <span name="username"></span>
                </RouterLink>
            </li>
            <li class="nav-item logged">
                <a class="nav-link" id="logoutLink">Logout</a>
            </li>
        </ul>
    </nav>

</template>