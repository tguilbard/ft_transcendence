<template>
  <!-- <div :style="styles" class="back"></div> -->
  <!-- <div id="nav">
    <router-link to="/">Home</router-link> |
    <router-link to="/about">About</router-link> |
    <router-link to="/auth">Auth</router-link> |
    <router-link to="/login">Login</router-link> |
    <router-link to="/register">Register</router-link> |
    <router-link to="/profil">Profil</router-link> |
    <router-link to="/authLogin">auth login</router-link>
<<<<<<< HEAD:srcs/frontend/src/src/views/About.vue
  </div>
  <div class="about">
    <h1>This is an about page</h1>
  </div>
</template>
=======
  </div> -->
  <router-view />
</template>

<script lang="ts">
import { Options, Vue } from "vue-class-component";

@Options({
  computed: {
    styles() {
      return {
        "background-image": `url(https://i.giphy.com/media/9bTjZrytydVRK/giphy.webp)`,
        // 'background-image': `url(https://i.gifer.com/3qR.gif)`,
        // 'background-image': `url(https://miro.medium.com/max/1200/1*N-45to24pMCH1pX2_VA-Gw.gif)`,
        "background-repeat": "repeat",
        "background-size": "100% 100%",
      };
    },
  },
})
export default class Profil extends Vue {}
</script>

<style lang="scss">

* {
  margin: 0px;
  padding: 0px;
  top: 0px;
  left: 0px;
}

.back {
  height: 100%;
  width: 100%;
  left: 0;
  top: 0;
  overflow: hidden;
  position: fixed;
  z-index: -1;
}

#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
}

#nav {
  padding: 30px;

  a {
    font-weight: bold;
    color: #2c3e50;

    &.router-link-exact-active {
      color: #42b983;
    }
  }
}
</style>
>>>>>>> origin/tmp:srcs/frontend/srcs/src/App.vue
