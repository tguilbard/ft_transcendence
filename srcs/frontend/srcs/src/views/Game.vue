<template>
<section>
  <Menu page="game" />
  <!-- <div class="grid">
    <div id="a">
      <p>Lorem ipsum dolor sit amet consectetur adipisicing elit. Beatae aliquid iste a distinctio aspernatur. Dolorum repudiandae beatae adipisci, repellat tempore doloribus harum, cum, debitis obcaecati sint est quos similique explicabo?</p>
    </div>
    <div id="b">
    </div>
    <div id="c"></div>
  </div> -->
  <!-- <Pong class="pong_visible"/> -->
  <!-- <Pong id="PongBorder"/> -->
</section>
</template>

<script lang="ts">

import { Options, Vue } from "vue-class-component";
import Menu from "@/components/Menu.vue"; // @ is an alias to /src
import store from '../store';
import shared from '../mixins/Mixins'
import Pong from "../components/game/Pong.vue"

@Options({
  components: {
    Menu,
    Pong,
  },
  async created() {
    if (!(await shared.isLogin()))
      return this.$router.push("login");
     if (!store.state.sock_init)
       store.commit("SET_SOCKET");
    const user = await (shared.getMyUser());
    store.commit("SET_USERNAME", user.username);
  },
  computed: {
    getRoute(){
      return this.$route.name;
    }
  }
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

#a {
    grid-area: a;
    /* background-color: aqua; */
  }

  #b {
    grid-area: b;
    /* background-color:blue; */
  }

  #c {
    grid-area: c;
    /* background-color: blueviolet; */
  }


.grid {
   display: grid;
  grid-template-rows: 1fr 8fr;
  grid-template-columns: 2fr 1fr;
  grid-template-areas:
    "a c"
    "b c";
  width: 90vw;
  min-height: 75vh;
  margin: auto;
  margin-top: 1vh;
  gap: 0.2vmax;
  justify-items: stretch;
}

/* .pong_visible {
  visibility: hidden;
} */

</style>