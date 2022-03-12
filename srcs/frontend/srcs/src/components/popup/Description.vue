<template>
  <div class="container_popup3"></div>
  <div v-if="GET_POPUP == 'description2'" @click.self="leave('')" class="background">
    <div class="block_popup2">
      <div class="content_popup">
        <h1>{{ GET_ACHIEVEMENT.name }}</h1>
        <div class="content_popup_profil">
          <div class="block_description">
            <p>{{ GET_ACHIEVEMENT.description }}</p>
          </div>
          <div
            v-if="
              (GET_POPUP == 'description2' ||
                GET_USER.username == GET_USER_TARGET.username) &&
              GET_ACHIEVEMENT.name == 'Galaxie'
            "
            class="block_description btn_select"
          >
            <button @click="setGithub">STAR PROJECT ON GITHUB</button>
          </div>
          <div
            v-if="
              (GET_POPUP == 'description2' ||
                GET_USER.username == GET_USER_TARGET.username) &&
              GET_ACHIEVEMENT.name == 'Follower'
            "
            class="block_description btn_select"
          >
            <button @click="setGithub">FOLLOW ADMINS ON GITHUB</button>
          </div>
        </div>
      </div>
    </div>
  </div>
  <div
    v-else-if="GET_POPUP == 'description'"
    @click.self="leave('profil')"
    class="background"
  >
    <div class="block_popup2">
      <div class="content_popup">
        <h1>{{ GET_ACHIEVEMENT.name }}</h1>
        <div class="content_popup_profil">
          <div class="block_description">
            <p>{{ GET_ACHIEVEMENT.description }}</p>
          </div>
          <div
            v-if="
              (GET_POPUP == 'description2' ||
                GET_USER.username == GET_USER_TARGET.username) &&
              GET_ACHIEVEMENT.name == 'Galaxie'
            "
            class="block_description btn_select"
          >
            <button @click="setGithub">STAR PROJECT ON GITHUB</button>
          </div>
          <div
            v-if="
              (GET_POPUP == 'description2' ||
                GET_USER.username == GET_USER_TARGET.username) &&
              GET_ACHIEVEMENT.name == 'Follower'
            "
            class="block_description btn_select"
          >
            <button @click="setGithub">FOLLOW ADMINS ON GITHUB</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "@vue/runtime-core";
import { mapGetters } from "vuex";
import store from "@/store";

export default defineComponent({
  computed: {
    ...mapGetters([
      "GET_POPUP",
      "GET_SAVE_POPUP",
      "GET_ACHIEVEMENT",
      "GET_USER_TARGET",
      "GET_USER",
    ]),
  },
  methods: {
    leave(pop: string) {
      this.setPopup(pop);
      store.dispatch("SET_SAVE_POPUP");
    },
    setPopup(value: string): void {
      store.commit("SET_POPUP", value);
    },
    setGithub() {
      localStorage.setItem("git", store.getters.GET_ACHIEVEMENT.name);
      if (store.getters.GET_ACHIEVEMENT.name == "Galaxie")
        return (document.location.href =
          "https://github.com/login/oauth/authorize?scope=repo&client_id=658433bca8c14c8f8d2a");
      else if (store.getters.GET_ACHIEVEMENT.name == "Follower")
        return (document.location.href =
          "https://github.com/login/oauth/authorize?scope=user&client_id=658433bca8c14c8f8d2a");
    },
  },
});
</script>

<style scoped>

.background {
  display: grid;
  position: absolute;
  grid-template-rows: 1;
  width: 100%;
  height: 100%;
  z-index: 110;
  margin: auto;
  justify-items: center;
}

.container_popup3 {
  display: block;
  position: fixed;
  height: 100vh;
  width: 100vw;
  text-align: center;
  z-index: 110;
  visibility: hidden;
  background-color: rgba(0, 0, 0, 0);
  overflow: hidden;
}

.container_popup3 {
  background-color: rgba(0, 0, 0, 0.8);
  visibility: visible;
}

.content_popup {
  border-radius: 7px 7px 7px 7px;
  background-color: #b8b8b8;
  border: 2px solid #a8a8a8;
  text-align: left;
  overflow: auto;
  font-weight: 900;
  font-size: 1.2vw;
}

.content_popup p,
label {
  color: #794515;
  color: #05348d;
}

.content_popup form {
  text-indent: 10px;
  align-self: center;
  line-height: 40px;
  padding: 5px;
}

.content_popup_profil {
  display: block;
  width: auto;
  margin: 0.5vw;
}

.block_description {
  display: block;
  margin: 0.2vw;
  text-align: center;
  font-size: 1.5vw;
  padding: 2vw;
}

.block_popup2 {
  /* display: block; */
  /* position: absolute; */
  border-radius: 0.5vw 0.5vw 0.5vw 0.5vw;
  background-color: #fff12c;
  border: 2px solid #8f8f8f;
  padding: 1px;
  margin: auto;
  height: max-content;
  text-align: center;
  /* z-index: 110; */
  color: rgb(255, 255, 255);
}

.block_popup2 h1 {
  border-radius: 7px 7px 0px 0px;

  text-align: center;
  background-color: grey;
  color: #fff12c;
  padding: 4px;
  -webkit-text-stroke: 1px;
  -webkit-text-stroke-color: rgb(0, 0, 0);
  font-family: futura;
  font-weight: 900;
  font-size: 1.5vw;
  border: 1px solid black;
  display: block;
}
</style> >