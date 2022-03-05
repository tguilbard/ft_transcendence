<template>
  <router-view />
</template>

<script lang="ts">
import { Options, Vue } from "vue-class-component";

@Options({
  computed: {
    styles() {
      return {
        "background-image": `url(https://i.giphy.com/media/9bTjZrytydVRK/giphy.webp)`,
        "background-repeat": "repeat",
        "background-size": "100% 100%",
      };
    },
  },
})
export default class App extends Vue {}
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
