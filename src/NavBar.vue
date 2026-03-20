<script setup lang="ts">
import { ref } from 'vue'
const isMenuOpen = ref(false)
</script>

<template>
    <link rel="stylesheet" href="/css/layout.css">
    <nav id="mainNavbar">
        <a class="mainNavbar-brand" href="#">JAES</a>
        <button @click="isMenuOpen = !isMenuOpen" class="navbar-button" type="button" data-toggle="collapse"
            data-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
            &#9776;
        </button>
        <ul @click="isMenuOpen = !isMenuOpen" :class="{ 'collapsed-expanded': isMenuOpen }"
            class="navbarMenu collapsable" id="navbarMenu">
            <li class="nav-item">
                <RouterLink class="nav-link" to="/">Home<!--span class="sr-only"> (current)</span--></RouterLink>
            </li>
            <li class="nav-item">
                <RouterLink class="nav-link" to="/game">Game</RouterLink>
            </li>
            <!--% if (username) { %-->
            <li class="nav-item">
                <a class="nav-link" href="/paintingBoard2/projects">Painting Projects</a>
            </li>
            <!--% if (isAdmin) { %-->
            <li class="nav-item">
                <a class="nav-link" href="/game/status">GameStatus</a>
            </li>
            <li class="nav-item">
                <a class="nav-link" href="/game/admin">Admin</a>
            </li>
            <!--% } } %-->
        </ul>
        <ul class="navbarMenu" id="navbarMenuRight">
            <!--% if (!username) { %-->
            <li class="nav-item">
                <a href="/login" class="nav-link">Login</a>
            </li>
            <li class="nav-item">
                <a href="/register" class="nav-link">Register</a>
            </li>
            <!--% } else { %-->
            <li class="nav-item">
                <a href="/profile" class="nav-link" alt="<%= username %>">
                    <i class="fa fa-user"></i>
                    <%= username %>
                </a>
            </li>
            <li class="nav-item">
                <a href="/logout" class="nav-link">Logout</a>
            </li>
            <!--% } %-->
        </ul>
    </nav>

</template>