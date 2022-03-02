<template>
  <div></div>
</template>


<script lang="ts">
import { Options, Vue } from "vue-class-component";
import shared from "../mixins/Mixins"
import store from "../store/index"

@Options({
  data() {
    return {
    };
  },
  methods: {
    async follow(code: string) {

    // if ((await isLogin()).log)
    //     window.location.href = "http://localhost:8080";

      var response = await fetch("http://localhost:3000/achievements/follow/", {
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

    // if ((await isLogin()).log)
    //     window.location.href = "http://localhost:8080";

      var response = await fetch("http://localhost:3000/achievements/star/", {
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
}
  },
  async created() {
    const code = await shared.GetQueryStringVal("code");
    if (!code) {
     //alert(code)
      return location.href="https://github.com/login/oauth/authorize?scope=repo&client_id=658433bca8c14c8f8d2a"
    }
	else
	{
        this.star(code);
    }
    
    // if (await this.isLogin())
    //   this.log = true;

  },
})
export default class Register extends Vue {}
</script>

<style scoped>
</style>