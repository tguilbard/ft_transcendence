<template>
  <router-view />
  <img class="background_star" v-bind:src="getBackground"/>
</template>

<script lang="ts">
import { Options, Vue } from "vue-class-component";

@Options({
  computed: {
    getBackground()
    {
      return require('@/assets/background.gif');
    },
  }
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

/* width */
::-webkit-scrollbar {
    width: 7px;
  }
  
  /* Track */
  ::-webkit-scrollbar-track {
    background: #ffffff;
  }
  
  /* Handle */
  ::-webkit-scrollbar-thumb {
    background: #c8c7c7;
  }
  
hr {
  background-color: #8f8f8f;
  height: 2px;
}

.background_star {
   position: fixed;
    display: block;
    top: 0;
    left: 0;
    z-index: -2;
    height: 100%;
    width: 100%;
    pointer-events: none;
  }

.html {
  font-family: futura;
  font-size: 2vw;
  cursor: default;
}

h1 {
  font-size: max(20px, 2.5vw);
  font-weight:900;
  cursor: default;
}


button, label, input{
  white-space: nowrap;
  font-family: futura;
  font-weight:900;
  font-size: max(12px, 1.3vw);
}

p, span {
  cursor: default;
  white-space: nowrap;
  font-family: futura;
  font-weight:500;
  font-size: max(12px, 1.3vw);
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
