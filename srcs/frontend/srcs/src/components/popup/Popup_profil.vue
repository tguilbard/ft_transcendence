<template>
  <div v-if="GET_POPUP == 'modify_profil' || GET_SAVE_POPUP == 'modify_profil'">
    <div v-if="GET_POPUP == 'modify_profil'" @click="back" class="container_popup"></div>
    <div id="block_popup">
      <div class="content_popup">
        <h1>MODIFY PROFILE</h1>
        <div class="grid_modify">
          <div>
            <h1>MODIFY YOUR AVATAR</h1>
            <div v-if="GET_IMG" class="block_avatar">
              <img class="avatar" v-bind:src="GET_IMG" />
            </div>
            <div class="block_avatar_inf">
              <label for="avatar" class="btn"
                ><h2 style="ground: #f5ba1a">Change avatar</h2></label
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
                <button v-on:click="sendAvatar">SAVE AVATAR</button>
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
                  minlength="3"
                  maxlength="7"
                  :disabled="desable ? '' : disabled"

                />
                <div v-if="myerror && myerror.message">
                  <div v-for="msg in myerror.message" :key="msg">
                    <p style="color: red" v-if="msg.username">
                      {{ msg.username }}
                    </p>
                  </div>
                </div>
                <button v-if="desable" @click="toggle">MODIFY</button>
                <button v-else @click="submit">SAVE</button>
              </div>
              <h1>MODIFY YOUR DOUBLE AUTHENTIFICATION</h1>
              <div class="block_user" style="height: 25vw">
                <div v-if="isCheck">
                  <button @click="switchCheck">DESACTIVATE TFA</button>
                </div>
                <div v-else>
                  <button @click="switchCheck">ACTIVATE TFA</button>
                </div>

                <div v-if="isQrCode">
                  <img :src="qrCode" class="qrcode" alt="qrcode" />
                  <input
                    type="text"
                    name="code"
                    placeholder="Entre le code recus"
                    maxlength="6"
                    minlength="6"
                    required
                    v-model="code"
                  />
                  <div v-if="myerror && myerror.message">
                    <div v-for="msg in myerror.message" :key="msg">
                      <p style="color: red" v-if="msg.code">{{ msg.code }}</p>
                    </div>
                  </div>
                  <button @click="submit_code">DONE</button>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div>
          <button class="btn" @click="back">BACK</button>
        </div>
      </div>
    </div>
  </div>
  <div
    v-if="
      GET_POPUP == 'profil' ||
      GET_SAVE_POPUP == 'profil' ||
      GET_POPUP == 'description' ||
      GET_POPUP == 'duel'
    "
  >
    <div v-if="GET_POPUP == 'profil'" @click="back" class="container_popup" />
    <div id="block_popup">
      <div class="content_popup">
        <h1>PROFILE</h1>
        <div class="grid_popup_profil">
          <div id="a">
            <div class="content_container">
              <div id="friends_content" class="friends_content">
                <div>
                  <h1>GAMES HISTORY</h1>
                </div>
                <div id="list_history" class="list_history">
                  <div v-if="GET_LIST_MATCH_TARGET">
                    <div
                      v-for="item in GET_LIST_MATCH_TARGET"
                      :key="item"
                      class="grid_history"
                    >
                      <div class="block_user1">
                        <span
                          :class="[
                            item.user1.username == GET_USER_TARGET.username
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
                        <span style="white-space: nowrap"
                          >{{ item.scoreUser1 }} - {{ item.scoreUser2 }}</span
                        >
                      </div>
                      <div class="block_user2">
                        <span
                          :class="[
                            item.user2.username == GET_USER_TARGET.username
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
          <div id="b">
            <p class="elo">{{ GET_USER_TARGET.elo }}</p>
            <div class="block_profil">
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
          <div id="c">
            <div v-if="GET_IMG_TARGET" class="content_popup_profil">
              <img class="avatar" v-bind:src="GET_IMG_TARGET" />
            </div>
          </div>
          <div id="d">
            <Achievement />
          </div>
        </div>

        <div
          v-if="GET_USER_TARGET.username != GET_USER.username"
          class="btn_select"
        >
          <div>
            <button @click="back">BACK</button>
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
          <div v-if="isBlock">
            <button @click="unBlockUser">UNBLOCK</button>
          </div>
          <div v-else>
            <button @click="blockUser">BLOCK</button>
          </div>
        </div>
        <div v-else class="btn_select">
          <button @click="back">BACK</button>
        </div>
      </div>
    </div>
  </div>
  <div
    v-if="
      GET_POPUP == 'description' ||
      GET_POPUP == 'description2' ||
      GET_SAVE_POPUP == 'description' ||
      GET_SAVE_POPUP == 'description2'
    "
  >
    <Description />
  </div>
  <div
    v-if="
      GET_POPUP == 'duel' ||
      GET_POPUP == 'alertduel' ||
      GET_SAVE_POPUP == 'duel'
    "
  >
    <PopupGame />
  </div>
</template>

<script scoped lang="ts">
import { defineComponent } from "@vue/runtime-core";
import { mapGetters } from "vuex";
import store from "@/store";
import Achievement from "@/components/popup/Achievement.vue";
import Description from "@/components/popup/Description.vue";
import shared from "@/mixins/Mixins";
import { AchievementType } from "@/enums/enums";
import PopupGame from "../popup/PopupGame.vue";

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
    PopupGame,
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
      code: '',
    };
  },
  computed: {
    ...mapGetters([
      "GET_USER",
      "GET_POPUP",
      "GET_USER_TARGET",
      "GET_IS_FRIEND",
      "GET_LIST_ACHIEVEMENTS",
      "GET_ACHIEVEMENT",
      "GET_IMG",
      "GET_IMG_TARGET",
      "GET_LIST_MATCH_TARGET",
      "GET_SAVE_POPUP",
    ]),
    isCheck: function () {
      return this.check;
    },
    isQrCode: function () {
      return this.qrCode;
    },
    isBlock() {
      return store.getters.GET_LIST_BLOCKED.find(
        (e) => e == store.getters.GET_USER_TARGET.username
      );
    },
    get_hh() {
			const h = shared.vw(30.4);
			return 'height: ' + 45 + 'px';
		},
		get_hh2() {
			const h = shared.vw(25);
			return 'min-height: ' + h + 'px';
		}
  },
  methods: {
    back() {
      this.setPopup('');
      store.dispatch("SET_SAVE_POPUP");
    },

    async blockUser() {
      const response = await fetch(
        "http://localhost:3000/users/block/" +
          store.getters.GET_USER.id +
          "/" +
          store.getters.GET_USER_TARGET.id,
        {
          method: "Post",
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
        store.dispatch("SET_LIST_BLOCKED", await shared.getListBlocked());
        return await response.json();
      }
      return [];
    },

    async unBlockUser() {
      const response = await fetch(
        "http://localhost:3000/users/unblock/" +
          store.getters.GET_USER.id +
          "/" +
          store.getters.GET_USER_TARGET.id,
        {
          method: "Delete",
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
        store.dispatch("SET_LIST_BLOCKED", await shared.getListBlocked());
        return await response.json();
      }
      return [];
    },
    active_game() {
      this.setPopup("duel");
    },
    active_watch() {
      store.state.socket.emit("spec", store.getters.GET_USER_TARGET.username);
      this.setPopup("");
      store.dispatch("SET_DUEL", true);
      this.$router.push("/");
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
          } else {
            return response.json();
          }
        })
        .then((responseJson) => {
          throw responseJson;
        })
        .catch((error) => {
          this.myerror = error;
        });
    },
    async submit_code() {
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
            store.state.socket.emit(
              "unlock_achievements",
              store.getters.GET_USER,
              AchievementType.locker
            );
          } else {
            return response.json();
          }
        })
        .then((responseJson) => {
          throw responseJson;
        })
        .catch((error) => {
          this.myerror = error;
        });
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
      if (!img || !formData) return;
      if (img) formData.append("img", img);
      fetch("http://localhost:3000/avatar", {
        method: "PATCH",
        mode: "cors",
        credentials: "include",
        headers: {
          "Access-Control-Max-Age": "600",
          "Cache-Control": "no-cache",
        },
        body: formData,
      })
        .then((response) => {
          if (response.ok) {
            store.state.socket.emit(
              "refreshAvatar",
              store.getters.GET_USER.username
            );
            store.state.socket.emit(
              "unlock_achievements",
              store.getters.GET_USER,
              AchievementType.fashion
            );
          } else {
            return response.json();
          }
        })
        .then((responseJson) => {
          throw responseJson;
        })
        .catch((error) => {
          this.myerror = error;
        });
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
        const user = await shared.getMyUser();
        store.state.socket.emit(
          "changeUsername",
          user,
          store.getters.GET_USER.username
        );
        store.dispatch("SET_USER", user);
        return null;
      }
      return await response.json();
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
    send_message(): void {
      store.commit("SET_POPUP", "");
      store.state.socket.emit(
        "joinPrivateMessage",
        store.getters.GET_USER_TARGET.username
      );
    },
  },
  async created() {
    this.username = store.getters.GET_USER.username;
    this.check = (await shared.getMyUser()).tfaActivated;
  },
});
</script>

<style scoped>
p,
span,
h1 {
  cursor: default;
}

#block_popup {
  display: block;
  position: absolute;
  border-radius: 0.25vw 0.25vw 0.25vw 0.25vw;
  background-color: #fff12c;
  border: 2px solid #8f8f8f;
  padding: 1px;
  height: auto;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  margin: auto;
  text-align: center;
  z-index: 15;
  color: rgb(255, 255, 255);
}

#block_popup h1 {
  border-radius: 0.25vw 0.25vw 0px 0px;

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
  white-space: nowrap;
}

.container_popup {
  display: block;
  position: fixed;
  height: 100vh;
  width: 100vw;
  text-align: center;
  z-index: 10;
  visibility: hidden;
  background-color: rgba(0, 0, 0, 0);
}

.container_popup {
  z-index: 10;
  background-color: rgba(0, 0, 0, 0.8);
  visibility: visible;
}

.content_popup {
  border-radius: 0.25vw 0.25vw 0.25vw 0.25vw;
  background-color: #b8b8b8;
  border: 2px solid #a8a8a8;
  height: 100%;
  text-align: left;
  font-weight: 900;
  font-size: 1.2vw;
}

.content_popup p,
label {
  color: #794515;
  color: #05348d;
}

.content_popup_profil {
  height: 15vw;
  background-color: rgb(61, 61, 61);
  border-radius: 0px 0px 0.25vw 0.25vw;
}

.content_popup_profil p {
  margin-top: 2px;
}

/* .content_popup_profil img {
  margin: 0px;
  text-align: center;
  max-width: 100%;
  max-height: 100%;
  display: block;
  margin-left: auto;
  margin-right: auto;
} */

.content_popup_profil input {
  position: relative;
}

.grid_popup_profil {
  display: grid;
  grid-template-rows: repeat(2, minmax(min-content, 0));
  grid-template-columns: 2fr 1fr 1fr;
  grid-template-areas:
    "a b c"
    "a d d";
  margin: 1vh;
  gap: 0.2vw;
  align-items: start;
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
  font-size: 10vw;
  text-align: center;
}

.block_profil p {
  display: block;
  margin: 0.2vw;
  text-align: center;
  font-size: 5vw;
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
  padding: 0.5vw;
  text-align: center;
  margin: 0.5vw;
  border-radius: 0.5vw 0.5vw 0.5vw 0.5vw;
  font-family: futura;
  font-size: 1vw;
  font-weight: bold;
}

.btn_select input:hover,
.btn_select button:hover {
  color: #fff12c;
  cursor: grabbing;
  -webkit-text-stroke: 1px;
  -webkit-text-stroke-color: rgb(0, 0, 0);
  font-size: 1.05vw;
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
  font-size: 2vw;
  margin: 0.2vw;
  padding: 0.2vw;
  display: inline;
}

.btn_chan_profil img {
  display: block;
  border: none;
  margin: 0.2vw;
  padding: 0.2vw;
  width: 1.5vw;
  height: 1.5vw;
}

.grid_modify {
  display: grid;
  grid-template-columns: repeat(2, minmax(min-content, max-content));
  gap: 1vw;
  margin: 1vw;
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
  height: 20vw;
  background-color: rgb(61, 61, 61);
  border-radius: 0px 0px 0.25vw 0.25vw;
}

.block_user {
  background-color: rgb(61, 61, 61);
  padding: 1vw;
  margin-bottom: 1vw;
  border-radius: 0px 0px 0.25vw 0.25vw;
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
}

.grid_modify button,
.btn {
  padding: 0.5vw;
  text-align: center;
  border-radius: 0.5vw 0.5vw 0.5vw 0.5vw;
  font-family: futura;
  font-size: 1vw;
  font-weight: bold;
  margin-top: 0.5vw;
  margin-bottom: 0.5vw;
}

.grid_modify button:hover,
.btn:hover {
  color: #fff12c;
  cursor: grabbing;
  -webkit-text-stroke: 1px;
  -webkit-text-stroke-color: rgb(0, 0, 0);
  font-size: 1.05vw;
}

.block_avatar_inf label {
  top: 1vw;
  font-size: 1vw;
  text-align: center;
}

.right {
  border-left: solid 0.5vw rgb(0, 0, 0);
}

.container_right {
  margin-left: 1vw;
  margin-bottom: 1vw;
}

.link:hover {
  color: #fff12c;
  cursor: grabbing;
  -webkit-text-stroke: 1px;
  -webkit-text-stroke-color: rgb(0, 0, 0);
  font-family: futura;
}

.list_history {
  display: block;
  position: relative;
  top: 0px;
  color: darkblue;
  background-color: #f6ecd2;
  overflow-y: scroll;
  height: 23.6vw;
  border-radius: 0vw 0vw 0.5vw 0.5vw;
  scroll-margin-bottom: 0.5vw;
  scroll-margin-block-end: 1vw;
  scroll-snap-type: proximity;
  border: 2px solid darkblue;
  padding: 0.2vw;
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

.grid_history span {
  padding: 0.2vw;
  font-family: futura;
  font-weight: 900;
  font-size: 1.5vw;
  top: 0.5vw;
  margin: auto;
}

.color1 {
  color: brown;
}

.color2 {
  color: darkblue;
}

.block_container {
  display: block;
  border-radius: 0.5vw 0.5vw 0.5vw 0.5vw;
  background-color: #fff12c;
  border: 2px solid #8f8f8f;
  padding: 1px;
  text-align: center;
  color: rgb(255, 255, 255);
  box-sizing: border-box;
  height: 100%;
}

.block_container h1 {
  border-radius: 0.5vw 0.5vw 0px 0px;
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

.friends_content {
  display: grid;
  grid-template-rows: minmax(min-content, max-content) auto;
  height: 100%;
}

.qrcode {
  width: 14vw;
  height: 14vw;
  display: block;
  position: relative;
  box-sizing: border-box;
  left: 50%;
  transform: translateX(-50%);
}
</style> >