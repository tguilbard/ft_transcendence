<template>
  <div v-if="GET_POPUP == 'profil'">
    <p>
      Lorem ipsum, dolor sit amet consectetur adipisicing elit. Ipsam aliquam
      harum quidem sunt tempore vero! Ipsa delectus architecto labore hic quasi
      tempora excepturi, blanditiis corrupti ex debitis? Alias, tempore velit.
    </p>
    <div @click="setPopup('')" class="container_popup"></div>
    <div class="block_popup">
      <div class="content_popup">
        <h1>PROFIL</h1>
        <div class="grid_profil">
          <div class="content_popup_profil">
            <div class="block_profil">
              <h1>ACHIEVEMENTS</h1>
            </div>
          </div>
          <div class="content_popup_profil">
            <div class="block_profil">
              <h1>GAMES</h1>
            </div>
          </div>
          <div class="content_popup_profil">
            <div class="block_profil">
              <div v-if="srcImg">
                <img class="avatar" v-bind:src="srcImg" />
              </div>
              <div class="btn_chan">
                <div>
                  <p>{{ GET_USER_TARGET.username }}</p>
                </div>
                <div>
                  <div v-if="GET_USER_TARGET.state == 'login'" class="mod">
                    <img src="../../assets/circle_green.png" alt="login" />
                  </div>
                  <div
                    v-else-if="GET_USER_TARGET.state == 'in game'"
                    class="mod"
                  >
                    <img src="../../assets/circle_orange.png" alt="in game" />
                  </div>
                  <div v-else class="mod">
                    <img src="../../assets/circle_grey.png" alt="in game" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="btn_select">
          <div>
            <button @click="setPopup('')">BACK</button>
          </div>
          <div v-if="GET_IS_FRIEND">
            <button @click="delete_friend">REMOVE</button>
          </div>
          <div v-else>
            <button @click="add_friend">ADD FRIEND</button>
          </div>
          <div v-if="GET_USER_TARGET.state == 'in game'">
            <button @click="setPopup('')">WATCH</button>
          </div>
          <div v-if="GET_USER_TARGET.state == 'login'">
            <button @click="setPopup('')">PLAY</button>
          </div>
           <div>
            <button @click="send_message">SEND MESSAGE</button>
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

// import shared from "../../mixins/Mixins";

export interface UserElement {
  name: string;
  state: string;
  mode: number;
}

export interface User {
  username: string;
  tfaActivated: boolean;
}

export type Avatar = File | null;

export default defineComponent({
  props: {
  },
  data: () => {
    return {
      file: null as Avatar,
      srcImg: "",
    };
  },
  computed: {
    ...mapGetters(["GET_USERNAME", "GET_POPUP", "GET_USER_TARGET", "GET_IS_FRIEND"]),
  },
  methods: {
    getImg(event: { target: { files: File[] } }) {
      this.file = event.target.files[0];
      this.srcImg = URL.createObjectURL(this.file);
    },
    add_friend(): void {
      store.state.socket.emit(
        "addFriend",
        store.getters.GET_USER_TARGET.username
      );
    },
    delete_friend(): void {
      store.state.socket.emit(
        "removeFriend",
        store.getters.GET_USER_TARGET.username
      );
    },
    setPopup(value: string): void {
      store.commit("SET_POPUP", value);
    },
    send_message(): void {
        store.commit("SET_POPUP", '');
        store.state.socket.emit('joinPrivateMessage', store.getters.GET_USER_TARGET.username);
    }
  },
  async created() {
    this.srcImg = "https://www.icone-png.com/png/3/2625.png";
  },
});
</script>

<style scoped>
.block_popup {
  display: block;
  position: absolute;
  border-radius: 7px 7px 7px 7px;
  background-color: #fff12c;
  border: 2px solid #8f8f8f;
  padding: 1px;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  text-align: center;
  z-index: 15;
  color: rgb(255, 255, 255);
}

.block_popup h1 {
  border-radius: 7px 7px 0px 0px;

  text-align: center;
  background-color: grey;
  color: #fff12c;
  padding: 4px;
  -webkit-text-stroke: 1px;
  -webkit-text-stroke-color: rgb(0, 0, 0);
  font-family: futura;
  font-weight: 900;
  font-size: 1.5vmax;
  border: 1px solid black;
  display: block;
}

.container_popup {
  display: block;
  position: absolute;
  height: 100vh;
  width: 100vmax;
  text-align: center;
  z-index: 10;
  visibility: hidden;
  background-color: rgba(0, 0, 0, 0);
  overflow: hidden;
}

.container_popup {
  z-index: 10;
  background-color: rgba(0, 0, 0, 0.8);
  visibility: visible;
}

.content_popup {
  border-radius: 7px 7px 7px 7px;
  background-color: #b8b8b8;
  border: 2px solid #a8a8a8;
  height: stretch;
  text-align: left;
  overflow: auto;
  z-index: 20;
  font-weight: 900;
  font-size: 1.2vmax;
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
  /* background-color: rgb(112, 112, 112); */
  margin: 0.5vmax;
  /* margin-top: 1vmax; */
}

.content_popup_profil p {
  margin-top: 2px;
}

.content_popup_profil img {
  text-align: center;
  width: 10vmax;
  height: auto;
  border: 2px solid #8f8f8f;
  display: block;
  margin-left: auto;
  margin-right: auto;
  border-inline: thick solid #9b9b9b;
}

.content_popup_profil input {
  position: relative;
  width: 20vh;
}

.content_popup_profil p {
  overflow-y: scroll;
  scrollbar-color: rebeccapurple green;
  scrollbar-width: thin;
}

.grid_profil {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 0.2vmax;
}

.block_profil {
  margin: 0.2vmax;
}

div.avatar {
  background-color: rgb(236, 236, 236);
  border: 2px solid #8f8f8f;
  border-inline: thick solid #9b9b9b;
}

.mod {
  display: inline;
  margin: 1px;
}

.btn_select {
  display: flex;
  justify-content: center;
}

.btn_select input,
.btn_select button {
  padding: 0.5vmax;
  text-align: center;
  margin: 0.5vmax;
  border-radius: 0.5vmax 0.5vmax 0.5vmax 0.5vmax;
  font-family: futura;
  font-size: 1vmax;
  font-weight: bold;
}

.btn_select input:hover,
.btn_select button:hover {
  color: #fff12c;
  cursor: grabbing;
  -webkit-text-stroke: 1px;
  -webkit-text-stroke-color: rgb(0, 0, 0);
  font-size: 1.05vmax;
  border-color: #fff12c;
}

.btn_chan {
  display: grid;
  grid-template-columns: minmax(min-content, auto) minmax(
      min-content,
      max-content
    );
}

.btn_chan p {
  color: #fff12c;
  cursor: grabbing;
  -webkit-text-stroke: 1px;
  -webkit-text-stroke-color: rgb(0, 0, 0);
  font-family: futura;
  font-size: 1.5vmax;
  margin: 0.2vmax;
  padding: 0.2vmax;
}

.btn_chan img {
  display: inline;
  border: none;
  margin: 0.2vmax;
  padding: 0.2vmax;
  max-width: 1.5vmax;
  height: auto;
}
</style> >