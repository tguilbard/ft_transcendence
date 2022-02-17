<template>
  <div v-if="GET_POPUP == 'modify_profil'">
    <div @click="setPopup('')" class="container_popup"></div>
    <div class="block_popup">
      <div class="content_popup">
        <h1>MODIFY PROFIL</h1>
        <div class="grid_modify">
          <div>
            <h1>MODIFY YOUR AVATAR</h1>
            <div v-if="GET_IMG" class="block_avatar">
              <img class="avatar" v-bind:src="GET_IMG" />
            </div>
            <div class="block_avatar_inf">
              <label for="avatar" class="btn"
                ><h2 style="ground: #f5ba1a">Choisis un avatar</h2></label
              >
              <input
                type="file"
                id="avatar"
                name="avatar"
                accept="image/*"
                @change="getImg"
                style="visibility: hidden"
                placeholder="Choississez un avatar"
              />
              <div>
                <button v-on:click="sendAvatar">ENREGISTRE AVATAR</button>
              </div>
            </div>
          </div>

          <div class="right">
            <div class="container_right">
              <h1>MODIFY YOUR USERNAME</h1>
              <div class="block_user">
                <span><i aria-hidden="true" class="fa fa-envelope"></i></span>
                <input
                  type="pseudo"
                  name="pseudo"
                  placeholder="Entre ton pseudo"
                  v-model="username"
                  required
                  :disabled="desable ? '' : disabled"
                />
                <div v-if="myerror">
                  <div v-for="msg in myerror.message" :key="msg">
                    <p style="color: red" v-if="msg.username">
                      {{ msg.username }}
                    </p>
                  </div>
                </div>
                <button v-if="desable" @click="toggle">MODIFIER</button>
                <button v-else @click="envoi">ENREGISTRER</button>
              </div>
              <h1>MODIFY YOUR DOUBLE AUTHENTIFICATION</h1>
              <div class="block_user" style="height: 25vmax">
                <div v-if="isCheck">
                  <button @click="switchCheck">DESACTIVATE TFA</button>
                  <!-- <input
                  type="checkbox"
                  id="cb1"
                  name="auth2"
                  v-model="check"
                  @click="switchCheck"
                /> -->
                  <!-- <label for="cb1">Desactiver la double authentification</label> -->
                </div>
                <div v-else>
                  <button @click="switchCheck">ACTIVATE TFA</button>
                  <!-- <input
                  type="checkbox"
                  id="cb2"
                  name="auth2"
                  v-model="check"
                  @click="switchCheck"
                />
                <label for="cb2">Activer la double authentification</label> -->
                </div>

                <div v-if="isQrCode">
                  <img :src="qrCode" alt="qrcode" />
                  <input
                    type="text"
                    name="code"
                    placeholder="Entre le code recus"
                    v-model="code"
                  />
                  <div v-if="myerror">
                    <div v-for="msg in myerror.message" :key="msg">
                      <p style="color: red" v-if="msg.code">{{ msg.code }}</p>
                    </div>
                  </div>
                  <button @click="submit_code">VALIDEZ CODE</button>
                </div>
              </div>
            </div>
          </div>
        </div>
          <div>
            <button class="btn" @click="setPopup('')">BACK</button>
          </div>
      </div>
    </div>
  </div>
  <div v-if="GET_POPUP == 'profil' || GET_POPUP == 'description'">
    <div
      v-if="GET_POPUP == 'profil'"
      @click="setPopup('')"
      class="container_popup"
    ></div>
    <div class="block_popup">
      <div class="content_popup">
        <h1>PROFIL</h1>
        <div class="grid_popup_profil">
          <div id='a'>
            <div class="grid_container">
              <div class="block_container">
                <div class="content_container">
                  <div class="friends_content">
                    <div>
                      <h1>GAMES HISTORY</h1>
                    </div>
                    <div class="list_history">
                      <div
                        v-for="item in getMatchs"
                        :key="item"
                        class="grid_history"
                      >
                        <div class="block_user1">
                          <span
                            :class="[
                              item.user1.username == GET_USERNAME
                                ? 'color1'
                                : 'color2',
                              'link',
                            ]"
                            @click="active_pop_profil(item.user1)"
                          >
                            {{ item.user1.username }}
                          </span>
                        </div>
                        <div class="block_score">
                          <span
                            >&nbsp;{{ item.scoreUser1 }} -
                            {{ item.scoreUser2 }}&nbsp;</span
                          >
                        </div>
                        <div class="block_user2">
                          <span
                            :class="[
                              item.user2.username == GET_USERNAME
                                ? 'color1'
                                : 'color2',
                              'link',
                            ]"
                            @click="active_pop_profil(item.user2)"
                          >
                            {{ item.user2.username }}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div id='b' class="elo">
            <p>420</p>
          </div>
          <div id='c' class="content_popup_profil">
            <div class="block_profil">
              <div v-if="GET_IMG_TARGET">
                <img v-bind:src="GET_IMG_TARGET" />
              </div>
              <div class="btn_chan_profil">
                <div>
                  <p>{{ GET_USER_TARGET.username }}</p>
                </div>
                <div>
                  <div v-if="GET_USER_TARGET.state == 'login'">
                    <img src="../../assets/circle_green.png" alt="login" />
                  </div>
                  <div v-else-if="GET_USER_TARGET.state == 'in match'">
                    <img src="../../assets/circle_orange.png" alt="in match" />
                  </div>
                  <div v-else>
                    <img src="../../assets/circle_grey.png" alt="in match" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        <div id="d">
          <Achievement />
        </div>
        </div>

        <div v-if="GET_USER_TARGET.username != GET_USERNAME" class="btn_select">
          <div>
            <button @click="setPopup('')">BACK</button>
          </div>
          <div v-if="GET_IS_FRIEND">
            <button @click="delete_friend">REMOVE</button>
          </div>
          <div v-else>
            <button @click="add_friend">ADD FRIEND</button>
          </div>
          <div v-if="GET_USER_TARGET.state == 'in match'">
            <button @click="active_watch">WATCH</button>
          </div>
          <div v-if="GET_USER_TARGET.state == 'login'">
            <button @click="active_game">PLAY</button>
          </div>
          <div>
            <button @click="send_message">SEND MESSAGE</button>
          </div>
        </div>
        <div v-else class="btn_select">
          <div>
            <button @click="setPopup('')">BACK</button>
          </div>
        </div>
      </div>
    </div>
  </div>
  <Description />
</template>

<script lang="ts">
import { defineComponent } from "@vue/runtime-core";
import { mapGetters } from "vuex";
import store, { Achievements } from "../../store";
import Achievement from "../popup/Achievement.vue";
import Description from "../popup/Description.vue";
import shared from "../../mixins/Mixins";

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
  components: {
    Achievement,
    Description,
  },
  data: () => {
    return {
      myerror: {},
      file: null as Avatar,
      activate: false,
      desable: true,
      user: {},
      username: "",
      save_username: "",
      check: "",
      qrCode: "",
      code: 0,
      listMatchs: [],
    };
  },
  computed: {
    ...mapGetters([
      "GET_USERNAME",
      "GET_POPUP",
      "GET_USER_TARGET",
      "GET_IS_FRIEND",
      "GET_LIST_ACHIEVEMENTS",
      "GET_ACHIEVEMENT",
      "GET_IMG",
      "GET_IMG_TARGET",
    ]),
    isCheck: function () {
      return this.check;
    },
    isQrCode: function () {
      return this.qrCode;
    },
    getMatchs() {
      return this.listMatchs;
    },
  },
  methods: {
    async getListMatchs(): Promise<string[]> {
      const response = await fetch(
        "http://localhost:3000/game-history/" + store.getters.GET_USERNAME,
        {
          method: "GET",
          mode: "cors",
          credentials: "include",
          headers: {
            Accept: "application/json",
            "Access-Control-Max-Age": "600",
            "Cache-Control": "no-cache",
          },
        }
      );
      if (response.ok) return await response.json();
      return [];
    },
    active_game() {
      // store.state.socket.emit("duel", 'aurelien');
      store.state.socket.emit(
        "invite_game",
        store.getters.GET_USER_TARGET.username
      );
      this.setPopup("");
      // this.$router.push('/');
    },
    active_watch() {
      store.state.socket.emit("spec", store.getters.GET_USER_TARGET.username);
      this.setPopup("");
      store.dispatch("SET_DUEL", true);
      this.$router.push("/");
    },
    async envoi() {
      fetch("http://localhost:3000/users/update", {
        method: "PATCH",
        mode: "cors",
        credentials: "include",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          "Access-Control-Max-Age": "600",
          "Cache-Control": "no-cache",
        },
        body: JSON.stringify({
          username: this.username,
        }),
      })
        .then((response) => {
          if (response.ok) {
            this.desable = true;
            //window.location.href = "http://localhost:8080/auth";
          } else {
            return response.json();
          }
        })
        .then((responseJson) => {
          // if (!responseJson.statusCode.ok)
          throw responseJson;
        })
        .catch((error) => {
          this.myerror = error;
        });
      //this.myerror = {};
    },
    async desactivedQrCode() {
      await fetch("http://localhost:3000/2fa", {
        method: "DELETE",
        mode: "cors",
        credentials: "include",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          "Access-Control-Max-Age": "600",
          "Cache-Control": "no-cache",
        },
        body: JSON.stringify({ tfaActivated: false }),
      })
        .then((response) => {
          if (response.ok) {
            this.qrCode = "";
            //window.location.href = "http://localhost:8080";
          } else {
            return response.json();
          }
        })
        .then((responseJson) => {
          // if (!responseJson.statusCode.ok)
          throw responseJson;
        })
        .catch((error) => {
          this.myerror = error;
        });
    },
    async submit_code() {
      // Création d'un formData obligatoire pour submit de l'image
      await fetch("http://localhost:3000/2fa/activate", {
        method: "POST",
        mode: "cors",
        credentials: "include",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          "Access-Control-Max-Age": "600",
          "Cache-Control": "no-cache",
        },
        body: JSON.stringify({ code: this.code }),
      })
        .then((response) => {
          if (response.ok) {
            this.qrCode = "";
            //window.location.href = "http://localhost:8080";
          } else {
            return response.json();
          }
        })
        .then((responseJson) => {
          // if (!responseJson.statusCode.ok)
          throw responseJson;
        })
        .catch((error) => {
          this.myerror = error;
        });
      //this.myerror = {};
    },
    async switchCheck() {
      if (this.check) {
        await this.desactivedQrCode();
        this.check = false;
      } else {
        this.qrCode = await shared.getQrCode();
        const tmp = this.qrCode;
        this.qrCode = tmp;
        this.check = true;
      }
    },
    toggle() {
      if (this.desable) this.desable = false;
      else this.desable = true;
    },
    async get_user() {
      var response = await fetch(
        "http://localhost:3000/users/" + this.save_username,
        {
          method: "GET",
          mode: "cors",
          credentials: "include",
          headers: {
            Accept: "application/json",
            "Access-Control-Max-Age": "600",
            "Cache-Control": "no-cache",
          },
        }
      );
      if (response.ok) {
        return await response.json();
      }
      return null;
    },
    async sendAvatar() {
      let img = this.file;
      var formData = new FormData();
      if (img) formData.append("img", img);
      fetch("http://localhost:3000/avatar", {
        method: "PATCH",
        mode: "cors",
        credentials: "include",
        headers: {
          //   Accept: "application/json",
          //  "Content-Type": "application/json",
          "Access-Control-Max-Age": "600",
          "Cache-Control": "no-cache",
        },
        body: formData,
      })
        .then((response) => {
          if (response.ok) {
            //window.location.href = "http://localhost:8080/auth";
          } else {
            return response.json();
          }
        })
        .then((responseJson) => {
          // if (!responseJson.statusCode.ok)
          throw responseJson;
        })
        .catch((error) => {
          this.myerror = error;
        });
      // }
      //this.myerror = {};
    },
    async submit() {
      let response = await fetch("http://localhost:3000/users/update", {
        method: "PATCH",
        mode: "cors",
        credentials: "include",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          "Access-Control-Max-Age": "600",
          "Cache-Control": "no-cache",
        },
        body: JSON.stringify({
          username: this.username,
        }),
      });
      if (response.ok) {
        this.desable = true;
        store.dispatch("SET_USERNAME", this.username);
        // console.log(response);
        console.log("juste avant emit");
        store.state.socket.emit("changeUsername", await response.json());
        return null;
        //window.location.href = "http://localhost:8080/auth";
      }
      return await response.json();
      // })
      // .then((responseJson) => {
      //   // if (!responseJson.statusCode.ok)
      //   throw responseJson;
      // })
      // .catch((error) => {
      //   this.myerror = error;
      // });
      //this.myerror = {};
    },
    getImg(event: { target: { files: File[] } }) {
      this.file = event.target.files[0];
      store.dispatch("SET_IMG", URL.createObjectURL(this.file));
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
    setAchievement(value: Achievements): void {
      store.dispatch("SET_ACHIEVEMENT", value);
      this.setPopup("description");
    },
    send_message(): void {
      store.commit("SET_POPUP", "");
      store.state.socket.emit(
        "joinPrivateMessage",
        store.getters.GET_USER_TARGET.username
      );
    },
  },
  async created() {
    this.username = store.getters.GET_USERNAME;
    this.check = (await shared.getMyUser()).tfaActivated;
    this.listMatchs = await this.getListMatchs();
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
  white-space: nowrap;
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
  margin: 0.5vmax;
}

.content_popup_profil p {
  margin-top: 2px;
}

.content_popup_profil img {
  text-align: center;
  max-width: 100%;
  max-height: 100%;
  border: 2px solid #8f8f8f;
  display: block;
  margin-left: auto;
  margin-right: auto;
  border-inline: thick solid #9b9b9b;
}

.content_popup_profil input {
  position: relative;
  /* width: 20vh; */
}

.content_popup_profil p {
  overflow-y: scroll;
  scrollbar-color: rebeccapurple green;
  scrollbar-width: thin;
}

.grid_popup_profil {
  display: grid;
  grid-template-columns: auto 1fr 1fr;
  gap: 0.2vmax;
  align-items: center;
  justify-content: center;


  display: grid;
  grid-template-rows: minmax(min-content, max-content) minmax(min-content, max-content);
  grid-template-columns: auto 1fr 1fr;
  grid-template-areas:
    "a b c"
    "a d d";
  /* width: 90vw;
  min-height: 75vh; */
  margin: auto;
  margin-top: 1vh;
  gap: 0.2vmax;
  justify-items: stretch;
}

#a {
  grid-area: a;
}

#b {
  grid-area: b;
}

#c {
  grid-area: c;
}

#d {
  grid-area: d;
}

.elo {
  display: block;
  font-size: 10vmax;
  text-align: center;
}

.block_profil p {
  display: block;
  margin: 0.2vmax;
  text-align: center;
  font-size: 5vmax;
}

.avatar {
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

.btn_chan_profil {
  display: grid;
  grid-template-columns: repeat(2, minmax(min-content, max-content));
  align-items: center;
  justify-content: center;
}

.btn_chan_profil p {
  color: #fff12c;
  cursor: grabbing;
  -webkit-text-stroke: 1px;
  -webkit-text-stroke-color: rgb(0, 0, 0);
  font-family: futura;
  font-size: 1.5vmax;
  margin: 0.2vmax;
  padding: 0.2vmax;
}

.btn_chan_profil img {
  display: inline;
  border: none;
  margin: 0.2vmax;
  padding: 0.2vmax;
  max-width: 1.5vmax;
  height: auto;
}

.grid_modify {
  display: grid;
  grid-template-columns: repeat(2, minmax(min-content, max-content));
  gap: 1vmax;
  margin: 1vmax;
  justify-content: center;
}

.avatar {
  display: block;
  position: relative;
  border: none;
  box-sizing: border-box;
  max-width: 100%;
  max-height: 100%;
  margin: auto;
}

.block_avatar {
  height: 20vmax;
  background-color: rgb(61, 61, 61);
  border-radius: 0px 0px 7px 7px;
}

.block_user {
  background-color: rgb(61, 61, 61);
  padding: 1vmax;
  margin-bottom: 1vmax;
  border-radius: 0px 0px 7px 7px;
}

.grid_modify input,
.grid_modify button,
.btn {
  display: block;
  position: relative;
  box-sizing: border-box;
  width: 75%;
  left: 50%;
  transform: translateX(-50%);
  /* top: 1vmax; */
}

.grid_modify button,
.btn {
  padding: 0.5vmax;
  text-align: center;
  border-radius: 0.5vmax 0.5vmax 0.5vmax 0.5vmax;
  font-family: futura;
  font-size: 1vmax;
  font-weight: bold;
  margin-top: 0.5vmax;
  margin-bottom: 0.5vmax;
}

.grid_modify button:hover,
.btn:hover {
  color: #fff12c;
  cursor: grabbing;
  -webkit-text-stroke: 1px;
  -webkit-text-stroke-color: rgb(0, 0, 0);
  font-size: 1.05vmax;
}

.block_user img {
  /* margin: auto; */
  max-width: 100%;
  max-height: 100%;
  display: block;
  position: relative;
  box-sizing: border-box;
  margin: 1vmax;
  left: 50%;
  transform: translateX(-50%);
}

.block_avatar_inf label {
  top: 1vmax;
  font-size: 1vmax;
  text-align: center;
}

/* .block_avatar_inf button {
  display: block;
  text-align: center;
  margin: auto;
  font-size: 1vmax;
  width: 90%;
  height: 100%;
  padding: 0.2vh;
} */

.right {
  border-left: solid 0.5vmax rgb(0, 0, 0);
}

.container_right {
  margin-left: 1vmax;
  margin-bottom: 1vmax;
}


.link:hover
{
    color: #fff12c;
    cursor: grabbing;
    -webkit-text-stroke: 1px;
    -webkit-text-stroke-color: rgb(0, 0, 0);
    font-family: futura;
}

.list_history {
  
  color: darkblue;
  background-color: #f6ecd2;
  overflow: auto;
  /* text-align: center; */
}

.grid_history {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
}

.block_user1 {
  background-color: rgb(237, 223, 244);
  text-align: center;
}
.block_user2 {
  text-align: center;
  background-color: rgb(197, 253, 253);
}

.block_score {
  background-color: #f5d5b1;
  text-align: center;
}

.grid_history span{
  /* display: block; */
  padding: 0.2vmax;
  font-family: futura;
  font-weight: 900;
  font-size: 1.5vmax;
  top: 0.5vmax;
  margin: auto;
  /* left: 50%; */
}

.color1 {
  color: brown;
}

.color2 {
  color: rgb(11, 133, 32);
}

.block_container {
  display: block;
  border-radius: 0.5vmax 0.5vmax 0.5vmax 0.5vmax;
  background-color: #fff12c;
  border: 2px solid #8f8f8f;
  padding: 1px;
  text-align: center;
  color: rgb(255, 255, 255);
}

.block_container h1 {
  border-radius: 0.5vmax 0.5vmax 0px 0px;
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

.content_container {
  border-radius: 0.5vmax 0.5vmax 0.5vmax 0.5vmax;
  background-color: #b8b8b8;
  border: 2px solid #a8a8a8;
  box-sizing: border-box;
  height: 100%;
  text-align: left;
  font-weight: 900;
  font-size: 1.2vmax;
}

.friends_content {
  display: grid;
  grid-template-rows: minmax(min-content, max-content) auto;
  height: 100%;
}

</style> >