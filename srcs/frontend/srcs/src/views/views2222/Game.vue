<template>
<section>
  <Menu page="game" />
</section>
</template>

<script lang="ts">

import { Options, Vue } from "vue-class-component";
import Menu from "@/components/Menu.vue"; // @ is an alias to /src
import store from '../store';
import Pong from "../components/game/Pong.vue"

@Options({
  components: {
    Menu,
    Pong,
  },
  async created() {
    if (!(await this.isLogin()))
      return this.$router.push("login");

     if (!store.state.sock_init)
       store.commit("SET_SOCKET");
    const username = await (this.getMyUsername());
    store.commit("SET_USERNAME", username.username);
  },
})
export default class Home extends Vue {}


</script>

<style>
#PongBorder{
    height : 70%;
    margin-left: 3vw;
    margin-right: 3vw;
    margin-bottom: 5vh;
    margin-top: 2vh;
    border-radius: 7px 7px 7px 7px;
    background-color: black;
    border: 2px solid #8f8f8f;
    padding: 1px;
}
</style>