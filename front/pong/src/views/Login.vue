<template>
  <div id="nav">
    <div class="p">je suis dans login</div>
    <a v-bind:href='"https://api.intra.42.fr/oauth/authorize?client_id=61094fffbf3140a13c461779c220cbc96dfbad643921a60e345ff8a99928a7a2&redirect_uri=http%3A%2F%2Flocalhost%3A8080%2Fok&response_type=code"'>LOGIN</a>

  </div>
  <router-view/>
</template>


<script>
//   window.location.href = "https://api.intra.42.fr/oauth/authorize?client_id=61094fffbf3140a13c461779c220cbc96dfbad643921a60e345ff8a99928a7a2&redirect_uri=http%3A%2F%2Flocalhost%3A8080&response_type=code";
</script>

<!--<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
}

#nav {
  padding: 30px;
}

#nav a {
  font-weight: bold;
  color: #2c3e50;
}

#nav a.router-link-exact-active {
  color: #42b983;
}
</style>-->
