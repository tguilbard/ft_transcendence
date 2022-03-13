<template>
  <router-view />
</template>

<script lang="ts">
import { Options, Vue } from "vue-class-component";

@Options({
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

.html {
  font-family: futura;
  font-size: large;
  cursor: default;
}

h1 {
  font-size: xx-large;
  font-weight: bold;
}

button {
    font-weight: bold;
}

p, label, input, span, button {
  white-space: nowrap;
  font-family: futura;
  font-size: x-large;
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

@media (max-width: 1000px) {
  h1 {
    font-size: x-large;
  }
  p, label, input, span, button  {
    font-size: large;
}

}

@media (max-width: 700px) {
  h1 {
    font-size: large;
  }
  p, label, input, span, button {
  font-size: medium;
}

}

@media (max-width: 500px) {
  h1 {
    font-size: medium;
  }
  p, label, input, span, button {
  font-size: small;
}
}


</style>
