<template>
  <div>
    <div class="sup"><p class="pong">PONG</p></div>
    <div class="menu" @mouseover="hover = true" @mouseleave="hover = false">
      <div v-if="hover" id="nav_hover">
        <router-link id="btn_game" to="/">GAME</router-link>
        <router-link id="btn_chat" to="/chat">CHAT</router-link>
        <router-link id="btn_profil" to="/profil">PROFILE</router-link>
      </div>
      <div v-else id="nav">
        <router-link id="btn_game" to="/" :style="btn_game">GAME</router-link>
        <router-link id="btn_chat" to="/chat" :style="btn_chat"
          >CHAT</router-link
        >
        <router-link id="btn_profil" to="/profil" :style="btn_profil"
          >PROFILE</router-link
        >
      </div>
    </div>
  </div>

</template>

<script lang="ts" scoped>
import { Options, Vue } from "vue-class-component";

@Options({
  props: ["page"],
  data() {
    return {
      hover: false,
    };
  },
  computed: {
    btn_game() {
      if (this.page == "game") {
        return {
          color: "#fff12c",
          "-webkit-text-stroke": "1px",
          "-webkit-text-stroke-color": "black",
          "font-family": "futura",
        };
      }
    },
    btn_chat() {
      if (this.page == "chat") {
        return {
          color: "#fff12c",
          "-webkit-text-stroke": "1px",
          "-webkit-text-stroke-color": "black",
          "font-family": "futura",
        };
      }
    },
    btn_profil() {
      if (this.page == "profil") {
        return {
          color: "#fff12c",
          "-webkit-text-stroke": "1px",
          "-webkit-text-stroke-color": "black",
          "font-family": "futura",
        };
      }
    },
  },
})
export default class Menu extends Vue {}
</script>

<style scoped lang="css">

.sup {
  display: block;
  background-color: #fff12c;
  position: relative;
  width: 100%;
  height: 8vmax;
  border-bottom: 2px solid #8f8f8f;
}

.pong {
  margin-left: auto;
  margin-right: auto;
  text-align: center;
  color: black;
  font-size: 6vmax;
  font-family: futura;
}

#nav,
#nav_hover {
  display: flex;
  flex-direction: row;
  justify-content: center;
  margin: 0%;
  padding: 0;
  background-color: #fff12c;
  position: relative;
  width: 90%;
  left: 5%;
  align-content: center;
  border-bottom-left-radius: 5vw;
  border-bottom-right-radius: 5vw;
  text-align: center;
  gap: 1px;
}

#btn_game,
#btn_chat,
#btn_profil {
  flex-basis: calc(100% / 3);
  padding: auto;
  background-color: rgb(236, 236, 236);
  font-size: max(15px, 2.5vw);
  font-weight: 900;
  color: gray;
  text-decoration: none;
  font-family: futura;
  border: 3px solid #9b9b9b;
  border-bottom: 3px solid #8f8f8f;
  box-shadow: 0px 1px 1px 0px #fff12c;
  border-top: none;
  -webkit-text-stroke: 1px;
  -webkit-text-stroke-color: black;
}

#nav_hover #btn_game:hover,
#nav_hover #btn_chat:hover,
#nav_hover #btn_profil:hover {
  color: #fff12c;
  -webkit-text-stroke: 1px;
  -webkit-text-stroke-color: black;
  font-family: futura;
}

#btn_game {
  border-bottom-left-radius: 5vw;
}

#btn_profil {
  border-bottom-right-radius: 5vw;
}
</style>
