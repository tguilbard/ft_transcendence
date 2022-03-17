<template>
  <div class="container_popup3"></div>
  <div class="background" @click.self="leave">
    <div class="block_popup2">
      <div class="content_popup">
        <h1>ALERT</h1>
        <div class="grid_popup_inv">
          <div>
            <p>{{ GET_MSG_ALERT }}</p>
          </div>
          <div class="btn_select">
            <button @click="leave">BACK</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "@vue/runtime-core";
import { mapGetters } from "vuex";
import store from "../../store";

export default defineComponent({
  data: () => {
    return {
      selected: "pong",
      inv: false,
    };
  },
  computed: {
    ...mapGetters(["GET_POPUP", "GET_MSG_ALERT", "GET_SAVE_POPUP", "GET_USER"]),
  },
  methods: {
    leave() {
      if (store.getters.GET_POPUP == "alertduel")
        store.dispatch("SET_INV", false);
      this.setPopup(store.getters.GET_SAVE_POPUP);
    },
    sendInv(): void {
      this.inv = true;
      store.state.socket.emit(
        "invite_game",
        store.getters.GET_USER_TARGET,
        this.selected
      );
    },
    cancelInv(): void {
      this.inv = false;
      store.dispatch("SET_GAME", false);
      store.state.socket.emit(
        "cancel_invite_game",
        store.getters.GET_USER,
        store.getters.GET_USER_TARGET,
        this.selected
      );
      this.setPopup("profil");
    },

    setPopup(value: string): void {
      store.dispatch("SET_POPUP", value);
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
  z-index: 1000;
  margin: auto;
  justify-items: center;
}

.container_popup3 {
  display: block;
  position: fixed;
  height: 100vh;
  width: 100vw;
  text-align: center;
  z-index: 1000;
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
}

.content_popup p,
label {
  color: #794515;
  color: #05348d;
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
  padding: 2vw;
}

.block_popup2 {
  display: block;
  border-radius: 7px 7px 7px 7px;
  background-color: #fff12c;
  border: 2px solid #8f8f8f;
  padding: 1px;
  margin: auto;
  width: max-content;
  height: max-content;
  text-align: center;
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
  border: 1px solid black;
  display: block;
}

.btn_select {
  display: flex;
  justify-content: center;
}

button {
  padding: 0.5vw;
  text-align: center;
  margin: 0.5vw;
  border-radius: 0.5vw 0.5vw 0.5vw 0.5vw;
}

button:hover,
.on {
  color: #fff12c;
  cursor: grabbing;
  -webkit-text-stroke: 1px;
  -webkit-text-stroke-color: rgb(0, 0, 0);
  border-color: #fff12c;
}
</style> >