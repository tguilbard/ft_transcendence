<template>
  <div></div>
</template>

<script lang="ts">
import { Options, Vue } from "vue-class-component";
import shared from "../mixins/Mixins";

@Options({
  data() {
    return {};
  },
  methods: {
    async login(code: string) {
      var response = await fetch("http://localhost:3000/users/login", {
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
      const data = await response.json();
      await sessionStorage.setItem("login", await JSON.stringify(data.login));
      await sessionStorage.setItem("src", await JSON.stringify(data.src));
      if (data.state == "ok") {
        return this.$router.push("/");
      } else if (data.state == "register") {
        return this.$router.push("/register");
      } else if (data.state == "2fa") {
        return this.$router.push("/authLogin");
      }
    },
  },
  async created() {
    const code = await shared.GetQueryStringVal("code");
    if (!code) {
      this.$router.push('/')
    }
    this.login(code);
  },
})
export default class Register extends Vue {}
</script>

<style scoped>
</style>