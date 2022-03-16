<template>
    <div class="sup">
      <p class="pong">PONG</p>
    </div>
    <button class="button_login" v-on:click="login">42connect</button>
    <button class="button_guest" v-on:click="add_guest">GUEST</button>
    <img class="background_pong" v-bind:src="require('../assets/background_pong.gif')"/>

</template>

<script lang="ts">
import router from "@/router";
import { Options, Vue } from "vue-class-component";
import store from "../store/index";

@Options({
  data() {
    return {
      log: false,
    };
  },
  methods: {
    async add_guest() {
      const response = await fetch(`http://localhost:3000/users/guest`, {
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
        .catch((error) => {
          this.myerror = error;
          return { state: "", username: "" };
        });
      if (response.state) {
        await sessionStorage.setItem("src", await JSON.stringify(response.src));
        await sessionStorage.setItem(
          "login",
          await JSON.stringify(response.login)
        );
        if (response.state == "register") return router.push("register");
        else if (response.state == "2fa") return this.$router.push("authLogin");
        else if (response.state == "ok") return this.$router.push("/");
      }
    },
    login() {
      window.location.href =
        `https://api.intra.42.fr/oauth/authorize?client_id=61094fffbf3140a13c461779c220cbc96dfbad643921a60e345ff8a99928a7a2&redirect_uri=http%3A%2F%2Flocalhost%3A3000%2Fok&response_type=code`;
    },
  },
})
export default class Register extends Vue {}
</script>

<style scoped>

.background_pong {
   position: absolute;
    display: block;
    width: 100%;
    left: 0;
    z-index: -1;
    height: 50%;
    top: 50%;
  }

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
</style>
