<template>
  <div></div>
</template>


<script lang="ts">
import { AchievementType } from "@/enums/enums";
import { Options, Vue } from "vue-class-component";
import shared from "../mixins/Mixins";
import store from "../store/index";

@Options({
  data() {
    return {};
  },
  methods: {
    async follow(code: string) {
      await fetch("http://localhost:3000/achievements/follow", {
        method: "POST",
        mode: "cors",
        credentials: "include",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          "Access-Control-Max-Age": "600",
          "Cache-Control": "no-cache",
        },
        body: JSON.stringify({
          code: code,
        }),
      });
    },
    async star(code: string) {
      await fetch("http://localhost:3000/achievements/star", {
        method: "POST",
        mode: "cors",
        credentials: "include",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          "Access-Control-Max-Age": "600",
          "Cache-Control": "no-cache",
        },
        body: JSON.stringify({
          code: code,
        }),
      });
    },
  },
  async created() {
    if (!(await shared.isLogin())) return this.$router.push("login");
    if (!store.state.sock_init) store.commit("SET_SOCKET");

    const user = await shared.getMyUser();
    store.dispatch("SET_USER", user);

    const code = await shared.GetQueryStringVal("code");
    if (code) {
      const git = localStorage.getItem("git");
      if (git == "Galaxie") {
        await this.star(code);
        store.state.socket.emit(
          "unlock_achievements",
          store.getters.GET_USER,
          AchievementType.galaxie
        );
      } else if (git == "Follower") {
        await this.follow(code);
        store.state.socket.emit(
          "unlock_achievements",
          store.getters.GET_USER,
          AchievementType.follower
        );
      }
    }
    return this.$router.push("/profil");
  },
})
export default class Register extends Vue {}
</script>

<style scoped>
</style>