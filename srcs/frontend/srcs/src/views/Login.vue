<template>
  <div class="sup">
    <p class="pong">PONG</p>
  </div>
    <button class="button_login" v-on:click="login">42connect</button>
    <button class="button_guest" v-on:click="add_guest">GUEST</button>
  <div :style="inf"></div>
</template>

<script lang="ts">
import router from "@/router";
import { Options, Vue } from "vue-class-component";
import shared from "../mixins/Mixins"
import store from "../store/index"

@Options({
  data() {
    return {
      log: false,
    };
  },
  computed: {
    inf() {
      return {
        width: "100%",
        left: "0",
        overflow: "hidden",
        "z-index": "-1",
        position: "absolute",
        height: "50%",
        top: "50%",

        //'background-image': `url(https://i.giphy.com/media/9bTjZrytydVRK/giphy.webp)`,
        // 'backgrouhttps://i.gifer.com/RY6p.gifnd-image': `url(https://i.gifer.com/3qR.gif)`,
        "background-image": `url(https://profgra.org/lycee/img/pong.gif)`,
        // 'background-image': `url(https://miro.medium.com/max/1200/1*N-45to24pMCH1pX2_VA-Gw.gif)`,

        // 'background-repeat': 'repeat',
        "background-size": "100% 100%",
      };
    },
  },
  methods: {
    async add_guest(){
      const response = await fetch("http://localhost:3000/users/guest", {
        method: "POST",
        mode: "cors",
        credentials: "include",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          "Access-Control-Max-Age": "600",
          "Cache-Control": "no-cache",
        },
      })
        .then((response) => {
          if (response.ok) {
            return response.json();
          }
        })
        // .then((responseJson) => {
        //   throw responseJson;
        // })
        .catch((error) => {
          this.myerror = error;
          return {state: '', username: ''};
        });
        if (response.state)
        {
          await sessionStorage.setItem("src", await JSON.stringify(response.src));
          await sessionStorage.setItem("login", await JSON.stringify(response.login));
            store.dispatch("SET_USERNAME", await JSON.stringify(response.username));
          if (response.state == "register")
            return router.push('register');
          else if (response.state == "2fa")
              return this.$router.push("authLogin");
          else if (response.state == "ok")
              return this.$router.push("/");
        }
    },
    login() {
      window.location.href =
        "https://api.intra.42.fr/oauth/authorize?client_id=61094fffbf3140a13c461779c220cbc96dfbad643921a60e345ff8a99928a7a2&redirect_uri=http%3A%2F%2Flocalhost%3A8080%2Fok&response_type=code";
    },
  },
  async created() {
    if (await shared.isLogin())
      this.log = true;
  },
})
export default class Register extends Vue {}
</script>

<style scoped>
button:hover {
  color: #fff12c;
  border-color: #fff12c;
  opacity: 1;
}

.sup {
  background-color: #fff12c;
  position: relative;
  width: 100vw;
  height: 50vh;
}

.pong {
  position: relative;
  top: 40%; /* poussé de la moitié de hauteur du référent */
  left: 50%;
  transform: translate(-50%, -50%);
  color: black;
  font-size: 10vmax;
  font-family: futura;
}

.button_login {
  border-radius: 15px;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-family: futura-pt;
  font-size: 7vmax;
  z-index: 1;
  color: #fff12c;
  background-color: black;
  box-shadow: -3px 3px 0px 0px white;
  padding: 15px 15px 15px 15px;
}

.button_login:hover {
  color: white;
}

.button_guest {
  padding: 15px 15px 15px 15px;
  position: absolute;
  top: 75%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-family: futura-pt;
  font-size: 2vmax;
  z-index: 1;
  color: white;
  background-color: gray;
  box-shadow: -2px 2px 5px 2px white;
  border-radius: 15px;
}

/* #app {
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
} */
</style>
