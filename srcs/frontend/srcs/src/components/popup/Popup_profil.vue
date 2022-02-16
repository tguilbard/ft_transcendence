<template>
  <div v-if="GET_POPUP == 'modify_profil'">
    <div @click="setPopup('')" class="container_popup"></div>
    <div class="block_popup">
      <div class="content_popup">
        <h1>MODIFY PROFIL</h1>
        <div class="grid_modify">
          <div>
              <h1>MODIDY YOUR AVATAR</h1>
              <div class="block_avatar">
                <div v-if="GET_IMG">
                  <img class="avatar" v-bind:src="GET_IMG" />
                </div>
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
                <h1>MODIDY YOUR USERNAME</h1>
                <div class="input_field">
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
                </div>
                <button v-if="desable" @click="toggle">MODIFIER</button>
                <button v-else @click="envoi">ENREGISTRER</button>

                <div v-if="isCheck" class="input_field checkbox_option">
                  <input
                    type="checkbox"
                    id="cb1"
                    name="auth2"
                    v-model="check"
                    @click="switchCheck"
                  />
                  <label for="cb1">Desactiver la double authentification</label>
                </div>
                <div v-else class="input_field checkbox_option">
                  <input
                    type="checkbox"
                    id="cb2"
                    name="auth2"
                    v-model="check"
                    @click="switchCheck"
                  />
                  <label for="cb2">Activer la double authentification</label>
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
          <div class="elo">
            <p>42</p>
          </div>
          <div class="content_popup_profil">
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
                  <div v-else-if="GET_USER_TARGET.state == 'in game'">
                    <img src="../../assets/circle_orange.png" alt="in game" />
                  </div>
                  <div v-else>
                    <img src="../../assets/circle_grey.png" alt="in game" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div>
          <Achievement />
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
  },
  methods: {
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
      } else {
        this.qrCode = await shared.getQrCode();
        const tmp = this.qrCode;
        this.qrCode = tmp;
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
  margin: 0.5vmax;
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

.grid_popup_profil {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.2vmax;
  align-items: center;
  justify-content: center;
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
  width: 100%;
  height: 100%;
  border: 1px solid black;
  margin: auto;
}

.block_avatar {
  height: 21vmax;
  overflow: auto;
}

.block_avatar_inf label {
  font-size: 1vmax;
  text-align: center;
}

.block_avatar_inf button {
  display: block;
  text-align: center;
  margin: auto;
  font-size: 1vmax;
  width: 90%;
  height: 100%;
  padding: 0.2vh;
}

.right {
  border-left: solid 0.5vmax rgb(0, 0, 0);
}

.container_right {
  margin-left: 1vmax;
}
</style> >