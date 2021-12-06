<template>
  <div>
    <img :src="srcImg" alt="pb" />
    <form action="http://localhost:3000/2fa/activate" method="post" >
    <input type="text" name="code" placeholder="Entre le code recus">
    <input type="submit" value="VALIDEZ">
    </form>
  </div>
</template>

<script lang="ts">
import { Options, Vue } from "vue-class-component";
// const qrcode = require("qrcode");
// const speakeasy = require("speakeasy");

@Options({
  data() {
    return {
      srcImg: ''
    };
  },
  methods: {
    async getImg() {
      await fetch("http://localhost:3000/2fa/generate", {
        method: "POST",
        mode: "cors",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Max-Age": "600",
          "Cache-Control": "no-cache",
        }
      })
        .then((response) => response.blob())
        .then((blob) => {
          this.srcImg = URL.createObjectURL(blob);
        });
    },
  },
  created() {
    this.getImg();
  },
})
export default class Register extends Vue {}
</script>

<style scoped>
</style>