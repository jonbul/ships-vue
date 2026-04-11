<script setup lang="ts">
import { ref, onMounted } from 'vue'
import "../public/css/layout.css"

const isMenuOpen = ref(false);

onMounted(() => {
    const scripts = ["/js/navbar.js",]
    for (const scriptSrc of scripts) {
        const script = document.createElement('script');
        script.src = scriptSrc;
        script.type = 'module';
        document.body.appendChild(script);
    }
});

</script>

<template>
    <nav id="mainNavbar">
        <a class="mainNavbar-brand" href="#">JAES</a>
        <button class="navbar-button" type="button" data-toggle="collapse" data-target="#navbarNav"
            aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
            &#9776;
        </button>
        <ul class="navbarMenu collapsable" id="navbarMenu">
            <li class="nav-item">
                <a class="nav-link" href="/">Home</a>
            </li>
            <li class="nav-item">
                <a class="nav-link" href="/game">Game</a>
            </li>
            <li class="nav-item logged">
                <a class="nav-link" href="/paintingBoard/projects">Painting Projects</a>
            </li>
            <li class="nav-item logged admin">
                <a class="nav-link" href="/game/status">GameStatus</a>
            </li>
            <li class="nav-item logged admin">
                <a class="nav-link" href="/game/admin">Admin</a>
            </li>
        </ul>
        <ul class="navbarMenu" id="navbarMenuRight">
            <li class="nav-item nologged">
                <a href="/login" class="nav-link">Login</a>
            </li>
            <li class="nav-item nologged">
                <a href="/register" class="nav-link">Register</a>
            </li>

            <li class="nav-item logged profile">
                <a href="/profile" class="nav-link" alt="<%= username %>">
                    👤
                    <span name="username"></span>
                </a>
            </li>
            <li class="nav-item logged">
                <a href="/logout" class="nav-link">Logout</a>
            </li>
        </ul>
    </nav>

</template>