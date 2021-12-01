<template>
  <div class="home">
    <img alt="Vue logo" src="../assets/logo.png">
    <HelloWorld msg="Welcome to Your Vue.js + TypeScript App"/>
  </div>
</template>

<script lang="ts">


async function get_token()
{
  let token: string = await localStorage.getItem('xsrfToken') || "";
  console.log('before token');
  if (token)
  {
      const xsrfToken: string = await JSON.parse(token);
      console.log('tok = ', xsrfToken);
  }
  console.log('after token');
}

get_token();
  


import { Options, Vue } from 'vue-class-component';
import HelloWorld from '@/components/HelloWorld.vue'; // @ is an alias to /src

@Options({
  components: {
    HelloWorld,
  },
})
export default class Home extends Vue {}
</script>
