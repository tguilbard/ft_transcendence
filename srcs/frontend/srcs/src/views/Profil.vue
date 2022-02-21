<template>
  <section v-if="log">
    <Menu page="profil" />
    <div v-if="GET_POPUP">
      <Popup />
    </div>
    <div class="grid_container">
      <div id="a" class="block_container">
        <div class="content_container">
          <div class="friends_content">
            <div>
              <h1>GAMES HISTORY</h1>
            </div>
            <div class="list_history">
              <div v-for="item in getMatchs" :key="item" class="grid_history">
                <div class="block_user1">
                  <span
                    :class="[
                      item.user1.username == GET_USER.username ? 'color1' : 'color2',
                      'link',
                    ]"
                    @click="active_pop_profil(item.user1)"
                  >
                    {{ item.user1.username }}
                  </span>
                </div>
                <div class="block_score">
                  <span style=" white-space: nowrap;"
                    >{{ item.scoreUser1 }} -
                    {{ item.scoreUser2 }}</span
                  >
                </div>
                <div class="block_user2">
                  <span
                    :class="[
                      item.user2.username == GET_USER.username ? 'color1' : 'color2',
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
      <div id="b" class="block_container">
        <div class="content_container">
          <div class="friends_content">
            <div>
              <h1>FRIENDS</h1>
            </div>
            <div class="list_friends_popup">
              <div v-for="item in getFriends" :key="item">
                <div
                  v-if="item.username != GET_USER.username"
                  class="logo_connection"
                >
                  <div>
                    <p
                      class="link"
                      @click="active_pop_profil(item)"
                      style="text-align: left"
                    >
                      {{ item.username }}
                    </p>
                  </div>
                  <div>
                    <div v-if="item.state == 'login'" class="mod">
                      <img src="../assets/circle_green.png" alt="login" />
                    </div>
                    <div v-else-if="item.state == 'in match'" class="mod">
                      <img src="../assets/circle_orange.png" alt="in match" />
                    </div>
                    <div v-else class="mod">
                      <img src="../assets/circle_grey.png" alt="in match" />
                    </div>
                  </div>
                </div>
              </div>

              <div v-for="item in getFriends" :key="item">
                <div
                  v-if="item.username != GET_USER.username"
                  class="logo_connection"
                >
                  <div>
                    <p
                      class="link"
                      @click="active_pop_profil(item)"
                      style="text-align: left"
                    >
                      {{ item.username }}
                    </p>
                  </div>
                  <div>
                    <div v-if="item.state == 'login'" class="mod">
                      <img src="../assets/circle_green.png" alt="login" />
                    </div>
                    <div v-else-if="item.state == 'in match'" class="mod">
                      <img src="../assets/circle_orange.png" alt="in match" />
                    </div>
                    <div v-else class="mod">
                      <img src="../assets/circle_grey.png" alt="in match" />
                    </div>
                  </div>
                </div>
              </div>    

<div v-for="item in getFriends" :key="item">
                <div
                  v-if="item.username != GET_USER.username"
                  class="logo_connection"
                >
                  <div>
                    <p
                      class="link"
                      @click="active_pop_profil(item)"
                      style="text-align: left"
                    >
                      {{ item.username }}
                    </p>
                  </div>
                  <div>
                    <div v-if="item.state == 'login'" class="mod">
                      <img src="../assets/circle_green.png" alt="login" />
                    </div>
                    <div v-else-if="item.state == 'in match'" class="mod">
                      <img src="../assets/circle_orange.png" alt="in match" />
                    </div>
                    <div v-else class="mod">
                      <img src="../assets/circle_grey.png" alt="in match" />
                    </div>
                  </div>
                </div>
              </div>
              <div v-for="item in getFriends" :key="item">
                <div
                  v-if="item.username != GET_USER.username"
                  class="logo_connection"
                >
                  <div>
                    <p
                      class="link"
                      @click="active_pop_profil(item)"
                      style="text-align: left"
                    >
                      {{ item.username }}
                    </p>
                  </div>
                  <div>
                    <div v-if="item.state == 'login'" class="mod">
                      <img src="../assets/circle_green.png" alt="login" />
                    </div>
                    <div v-else-if="item.state == 'in match'" class="mod">
                      <img src="../assets/circle_orange.png" alt="in match" />
                    </div>
                    <div v-else class="mod">
                      <img src="../assets/circle_grey.png" alt="in match" />
                    </div>
                  </div>
                </div>
              </div>
              <div v-for="item in getFriends" :key="item">
                <div
                  v-if="item.username != GET_USER.username"
                  class="logo_connection"
                >
                  <div>
                    <p
                      class="link"
                      @click="active_pop_profil(item)"
                      style="text-align: left"
                    >
                      {{ item.username }}
                    </p>
                  </div>
                  <div>
                    <div v-if="item.state == 'login'" class="mod">
                      <img src="../assets/circle_green.png" alt="login" />
                    </div>
                    <div v-else-if="item.state == 'in match'" class="mod">
                      <img src="../assets/circle_orange.png" alt="in match" />
                    </div>
                    <div v-else class="mod">
                      <img src="../assets/circle_grey.png" alt="in match" />
                    </div>
                  </div>
                </div>
              </div>
              <div v-for="item in getFriends" :key="item">
                <div
                  v-if="item.username != GET_USER.username"
                  class="logo_connection"
                >
                  <div>
                    <p
                      class="link"
                      @click="active_pop_profil(item)"
                      style="text-align: left"
                    >
                      {{ item.username }}
                    </p>
                  </div>
                  <div>
                    <div v-if="item.state == 'login'" class="mod">
                      <img src="../assets/circle_green.png" alt="login" />
                    </div>
                    <div v-else-if="item.state == 'in match'" class="mod">
                      <img src="../assets/circle_orange.png" alt="in match" />
                    </div>
                    <div v-else class="mod">
                      <img src="../assets/circle_grey.png" alt="in match" />
                    </div>
                  </div>
                </div>
              </div>
              <div v-for="item in getFriends" :key="item">
                <div
                  v-if="item.username != GET_USER.username"
                  class="logo_connection"
                >
                  <div>
                    <p
                      class="link"
                      @click="active_pop_profil(item)"
                      style="text-align: left"
                    >
                      {{ item.username }}
                    </p>
                  </div>
                  <div>
                    <div v-if="item.state == 'login'" class="mod">
                      <img src="../assets/circle_green.png" alt="login" />
                    </div>
                    <div v-else-if="item.state == 'in match'" class="mod">
                      <img src="../assets/circle_orange.png" alt="in match" />
                    </div>
                    <div v-else class="mod">
                      <img src="../assets/circle_grey.png" alt="in match" />
                    </div>
                  </div>
                </div>
              </div>
              <div v-for="item in getFriends" :key="item">
                <div
                  v-if="item.username != GET_USER.username"
                  class="logo_connection"
                >
                  <div>
                    <p
                      class="link"
                      @click="active_pop_profil(item)"
                      style="text-align: left"
                    >
                      {{ item.username }}
                    </p>
                  </div>
                  <div>
                    <div v-if="item.state == 'login'" class="mod">
                      <img src="../assets/circle_green.png" alt="login" />
                    </div>
                    <div v-else-if="item.state == 'in match'" class="mod">
                      <img src="../assets/circle_orange.png" alt="in match" />
                    </div>
                    <div v-else class="mod">
                      <img src="../assets/circle_grey.png" alt="in match" />
                    </div>
                  </div>
                </div>
              </div>
              <div v-for="item in getFriends" :key="item">
                <div
                  v-if="item.username != GET_USER.username"
                  class="logo_connection"
                >
                  <div>
                    <p
                      class="link"
                      @click="active_pop_profil(item)"
                      style="text-align: left"
                    >
                      {{ item.username }}
                    </p>
                  </div>
                  <div>
                    <div v-if="item.state == 'login'" class="mod">
                      <img src="../assets/circle_green.png" alt="login" />
                    </div>
                    <div v-else-if="item.state == 'in match'" class="mod">
                      <img src="../assets/circle_orange.png" alt="in match" />
                    </div>
                    <div v-else class="mod">
                      <img src="../assets/circle_grey.png" alt="in match" />
                    </div>
                  </div>
                </div>
              </div>
              <div v-for="item in getFriends" :key="item">
                <div
                  v-if="item.username != GET_USER.username"
                  class="logo_connection"
                >
                  <div>
                    <p
                      class="link"
                      @click="active_pop_profil(item)"
                      style="text-align: left"
                    >
                      {{ item.username }}
                    </p>
                  </div>
                  <div>
                    <div v-if="item.state == 'login'" class="mod">
                      <img src="../assets/circle_green.png" alt="login" />
                    </div>
                    <div v-else-if="item.state == 'in match'" class="mod">
                      <img src="../assets/circle_orange.png" alt="in match" />
                    </div>
                    <div v-else class="mod">
                      <img src="../assets/circle_grey.png" alt="in match" />
                    </div>
                  </div>
                </div>
              </div>
              <div v-for="item in getFriends" :key="item">
                <div
                  v-if="item.username != GET_USER.username"
                  class="logo_connection"
                >
                  <div>
                    <p
                      class="link"
                      @click="active_pop_profil(item)"
                      style="text-align: left"
                    >
                      {{ item.username }}
                    </p>
                  </div>
                  <div>
                    <div v-if="item.state == 'login'" class="mod">
                      <img src="../assets/circle_green.png" alt="login" />
                    </div>
                    <div v-else-if="item.state == 'in match'" class="mod">
                      <img src="../assets/circle_orange.png" alt="in match" />
                    </div>
                    <div v-else class="mod">
                      <img src="../assets/circle_grey.png" alt="in match" />
                    </div>
                  </div>
                </div>
              </div>
              <div v-for="item in getFriends" :key="item">
                <div
                  v-if="item.username != GET_USER.username"
                  class="logo_connection"
                >
                  <div>
                    <p
                      class="link"
                      @click="active_pop_profil(item)"
                      style="text-align: left"
                    >
                      {{ item.username }}
                    </p>
                  </div>
                  <div>
                    <div v-if="item.state == 'login'" class="mod">
                      <img src="../assets/circle_green.png" alt="login" />
                    </div>
                    <div v-else-if="item.state == 'in match'" class="mod">
                      <img src="../assets/circle_orange.png" alt="in match" />
                    </div>
                    <div v-else class="mod">
                      <img src="../assets/circle_grey.png" alt="in match" />
                    </div>
                  </div>
                </div>
              </div>
              <div v-for="item in getFriends" :key="item">
                <div
                  v-if="item.username != GET_USER.username"
                  class="logo_connection"
                >
                  <div>
                    <p
                      class="link"
                      @click="active_pop_profil(item)"
                      style="text-align: left"
                    >
                      {{ item.username }}
                    </p>
                  </div>
                  <div>
                    <div v-if="item.state == 'login'" class="mod">
                      <img src="../assets/circle_green.png" alt="login" />
                    </div>
                    <div v-else-if="item.state == 'in match'" class="mod">
                      <img src="../assets/circle_orange.png" alt="in match" />
                    </div>
                    <div v-else class="mod">
                      <img src="../assets/circle_grey.png" alt="in match" />
                    </div>
                  </div>
                </div>
              </div>
              <div v-for="item in getFriends" :key="item">
                <div
                  v-if="item.username != GET_USER.username"
                  class="logo_connection"
                >
                  <div>
                    <p
                      class="link"
                      @click="active_pop_profil(item)"
                      style="text-align: left"
                    >
                      {{ item.username }}
                    </p>
                  </div>
                  <div>
                    <div v-if="item.state == 'login'" class="mod">
                      <img src="../assets/circle_green.png" alt="login" />
                    </div>
                    <div v-else-if="item.state == 'in match'" class="mod">
                      <img src="../assets/circle_orange.png" alt="in match" />
                    </div>
                    <div v-else class="mod">
                      <img src="../assets/circle_grey.png" alt="in match" />
                    </div>
                  </div>
                </div>
              </div>
              <div v-for="item in getFriends" :key="item">
                <div
                  v-if="item.username != GET_USER.username"
                  class="logo_connection"
                >
                  <div>
                    <p
                      class="link"
                      @click="active_pop_profil(item)"
                      style="text-align: left"
                    >
                      {{ item.username }}
                    </p>
                  </div>
                  <div>
                    <div v-if="item.state == 'login'" class="mod">
                      <img src="../assets/circle_green.png" alt="login" />
                    </div>
                    <div v-else-if="item.state == 'in match'" class="mod">
                      <img src="../assets/circle_orange.png" alt="in match" />
                    </div>
                    <div v-else class="mod">
                      <img src="../assets/circle_grey.png" alt="in match" />
                    </div>
                  </div>
                </div>
              </div>
              <div v-for="item in getFriends" :key="item">
                <div
                  v-if="item.username != GET_USER.username"
                  class="logo_connection"
                >
                  <div>
                    <p
                      class="link"
                      @click="active_pop_profil(item)"
                      style="text-align: left"
                    >
                      {{ item.username }}
                    </p>
                  </div>
                  <div>
                    <div v-if="item.state == 'login'" class="mod">
                      <img src="../assets/circle_green.png" alt="login" />
                    </div>
                    <div v-else-if="item.state == 'in match'" class="mod">
                      <img src="../assets/circle_orange.png" alt="in match" />
                    </div>
                    <div v-else class="mod">
                      <img src="../assets/circle_grey.png" alt="in match" />
                    </div>
                  </div>
                </div>
              </div>
              <div v-for="item in getFriends" :key="item">
                <div
                  v-if="item.username != GET_USER.username"
                  class="logo_connection"
                >
                  <div>
                    <p
                      class="link"
                      @click="active_pop_profil(item)"
                      style="text-align: left"
                    >
                      {{ item.username }}
                    </p>
                  </div>
                  <div>
                    <div v-if="item.state == 'login'" class="mod">
                      <img src="../assets/circle_green.png" alt="login" />
                    </div>
                    <div v-else-if="item.state == 'in match'" class="mod">
                      <img src="../assets/circle_orange.png" alt="in match" />
                    </div>
                    <div v-else class="mod">
                      <img src="../assets/circle_grey.png" alt="in match" />
                    </div>
                  </div>
                </div>
              </div>
              <div v-for="item in getFriends" :key="item">
                <div
                  v-if="item.username != GET_USER.username"
                  class="logo_connection"
                >
                  <div>
                    <p
                      class="link"
                      @click="active_pop_profil(item)"
                      style="text-align: left"
                    >
                      {{ item.username }}
                    </p>
                  </div>
                  <div>
                    <div v-if="item.state == 'login'" class="mod">
                      <img src="../assets/circle_green.png" alt="login" />
                    </div>
                    <div v-else-if="item.state == 'in match'" class="mod">
                      <img src="../assets/circle_orange.png" alt="in match" />
                    </div>
                    <div v-else class="mod">
                      <img src="../assets/circle_grey.png" alt="in match" />
                    </div>
                  </div>
                </div>
              </div>



            </div>
          </div>
        </div>
      </div>
      <div id="c" class="block_container">
        <div class="content_container">
          <div v-if="GET_IMG" class="block_avatar">
            <img class="avatar" v-bind:src="GET_IMG" />
          </div>
        </div>
      </div>
      <div id="d" class="block_container">
        <div class="content_container">
          <div class="list_acheivements">
            <h1>ACHIEVEMENTS</h1>
            <div class="container_block_acheivements">
              <div
                class="block_acheivements"
                v-for="(item, index) in GET_LIST_ACHIEVEMENTS"
                :key="index"
              >
                <div @click="setAchievement(item)" class="color1">
                  <div>
                    <div v-if="index % 2">
                      <img
                        v-bind:src="
                          require('../assets/lock/' + item.imageLockName)
                        "
                      />
                    </div>
                    <div v-else>
                      <img
                        v-bind:src="
                          require('../assets/unlock/' + item.imageUnlockName)
                        "
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div id="e" class="block_container">
        <div class="content_container">
          <div class="my_elo">
            <p>{{ user.elo }}</p>
          </div>
        </div>
      </div>
      <div id="f" class="block_container">
        <div class="content_container">
          <div class="logo_user">
            <div>
              <p>{{ this.user.username }}</p>
            </div>
            <div>
              <div v-if="this.user.state == 'login'" class="mod">
                <img src="../assets/circle_green.png" alt="login" />
              </div>
              <div v-else-if="this.user.state == 'in match'" class="mod">
                <img src="../assets/circle_orange.png" alt="in match" />
              </div>
              <div v-else class="mod">
                <img src="../assets/circle_grey.png" alt="in match" />
              </div>
            </div>
          </div>
        </div>
      </div>
      <div id="g" class="block_container">
        <div class="content_container">
          <div class="container_logout">
            <p class="btn_logout" v-on:click="logout">LOGOUT</p>
          </div>
        </div>
      </div>
      <div id="h" class="block_container">
        <div class="content_container">
          <div class="container_logout">
            <p class="btn_logout" @click="setPopup('modify_profil')">
              MODIFY PROFIL
            </p>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script lang="ts">
import { Options, Vue } from "vue-class-component";
import Menu from "@/components/Menu.vue"; // @ is an alias to /src
import Popup from "../components/PopUp.vue";
import store from "../store/index";
import shared, { UserEntity } from "../mixins/Mixins";
import { mapGetters } from "vuex";
import { Achievements } from "@/components/chat/ts/Chat";

@Options({
  components: {
    Menu,
    Popup,
  },
  data() {
    return {
      activate: false,
      li: ["coucou"],
      listFriends: [],
      listMatchs: [],
      log: false,
    };
  },
  computed: {
    ...mapGetters([
      "GET_USER",
      "GET_POPUP",
      "GET_USER_TARGET",
      "GET_IMG",
      "GET_LIST_ACHIEVEMENTS",
    ]),
    getFriends() {
      return this.listFriends;
    },
    getMatchs() {
      return this.listMatchs;
    },
  },
  methods: {
    setAchievement(value: Achievements): void {
      store.dispatch("SET_ACHIEVEMENT", value);
      this.setPopup("description2");
    },
    setPopup(value: string): void {
      store.dispatch("SET_POPUP", value);
    },
    setUserTarget(value: UserEntity): void {
      store.dispatch("SET_USER_TARGET", value);
    },
    async logout() {
      await fetch("http://localhost:3000/users/logout", {
        method: "POST",
        mode: "cors",
        credentials: "include",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          "Access-Control-Max-Age": "600",
          "Cache-Control": "no-cache",
        },
      })
        .then((response) => {
          if (response.ok) {
            window.location.href = "http://localhost:8080/login";
          } else {
            return response.json();
          }
        })
        .then((responseJson) => {
          // if (!responseJson.statusCode.ok)
          throw responseJson;
        });
      // .catch((error) => {
      // });
      //this.myerror = {};
    },
    getImg(event: { target: { files: File[] } }) {
      this.file = event.target.files[0];
      store.dispatch("SET_IMG", URL.createObjectURL(this.file));
    },
    async getListFriends(): Promise<
      [{ username: string; state: string }] | boolean
    > {
      const response = await fetch("http://localhost:3000/users/friends", {
        method: "GET",
        mode: "cors",
        credentials: "include",
        headers: {
          Accept: "application/json",
          "Access-Control-Max-Age": "600",
          "Cache-Control": "no-cache",
        },
      });
      if (response.ok) return await response.json();
      return false;
    },

    async getListMatchs(): Promise<string[]> {
      const response = await fetch(
        "http://localhost:3000/game-history/" + store.getters.GET_USER.username,
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

    async active_pop_profil(user: {
      username: string;
      state: string;
    }): Promise<void> {
      if (user.state == "") {
        const myUser = await shared.getUserByUsername(user.username);
        if (myUser.state) user.state = myUser.state;
      }
      store.dispatch("SET_USER_TARGET", user);
      await store.dispatch("SET_IS_FRIEND", await shared.isFriendByUsername());
      await store.dispatch("SET_IS_FRIEND", await shared.isFriendByUsername());
      store.commit("SET_POPUP", "profil");
      await store.dispatch(
        "SET_IMG_TARGET",
        await shared.get_avatar(user.username)
      );
    },
  },
  async created() {
    if (!(await shared.isLogin())) return this.$router.push("/login");
    if (!store.state.sock_init) store.commit("SET_SOCKET");
    this.user = await shared.getMyUser();
    store.dispatch("SET_USER", this.user);
    // this.save_username = this.user.username;
    store.dispatch("SET_CHECK", this.user.tfaActivated);
    store.dispatch("SET_IMG", await shared.get_avatar(this.user.username));
    this.listFriends = await this.getListFriends();
    this.listMatchs = await this.getListMatchs();
    store.dispatch(
      "SET_LIST_ACHIEVEMENTS",
      await shared.getAchievements(store.getters.GET_USER.username)
    );
    this.log = true;
    store.state.socket.off("start_game").on("start_game", () => {
      store.dispatch("SET_DUEL", true);
      this.$router.push("/");
    });
    store.state.socket
      .off("rcv_inv_game")
      .on("rcv_inv_game", (user_target: UserEntity) => {
        store.dispatch("SET_USER_TARGET", {
          username: user_target.username,
          state: user_target.state,
        });
        this.setPopup("inv_game");
      });
    this.activate = true;
  },
})
export default class Profil extends Vue {}
</script>

<style scoped lang="css">
p,
span,
h1 {
  cursor: default;
}

.grid_container {
  display: grid;
  grid-template-rows: minmax(min-content, 0) minmax(min-content, 0) minmax(
      min-content,
      0
    ) minmax(min-content, max-content);
  grid-template-columns: auto 1fr 1fr 1fr;
  grid-template-areas:
    "a c e b"
    "a c f b"
    "a h g b"
    "a d d b";
  width: 90vw;
  min-height: 75vh;
  margin: auto;
  margin-top: 1vh;
  gap: 0.2vmax;
  /* justify-items: stretch; */
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

#e {
  grid-area: e;
}

#f {
  grid-area: f;
}

#g {
  grid-area: g;
}

#h {
  grid-area: h;
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
  background-color: #f6ecd2;
  height: 100%;
  /* height: 42vmax; */
}

.list_friends_popup {
  display: block;
  color: darkblue;
  overflow: auto;
  height: 38.8vmax;
  min-height: 70vh;
}

.logo_connection img,
.list_friends_popup p {
  margin: 0.2vmax;
  padding: 0.4vmax;
  width: auto;
  font-size: 1.5vmax;
  border-radius: 0px 0px 0.5vmax 0.5vmax;
}

.logo_connection {
  display: grid;
  grid-template-columns: minmax(min-content, auto) minmax(
      min-content,
      max-content
    );
}

.logo_connection img {
  width: 1.5vmax;
  height: 1.5vmax;
  transform: translateY(0.25vmax);
}

.logo_user {
  display: grid;
  grid-template-columns: minmax(min-content, auto) minmax(
      min-content,
      max-content
    );
  justify-content: center;
  align-items: center;
  height: 100%;
  gap: 1vmax;
  font-size: 3vmax;
  font-weight: bold;
  color: #fff12c;
  -webkit-text-stroke: 1px;
  -webkit-text-stroke-color: rgb(0, 0, 0);
  font-family: futura;
}

.logo_user img {
  width: 1.5vmax;
  height: 1.5vmax;
  transform: translateY(0.25vmax);
}

.container_block_acheivements {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 0.2vmax;
  margin: 0.5vmax;
}

.block_acheivements {
  display: block;
  box-sizing: border-box;
  background-color: rgb(184, 184, 184);
  border-radius: 0.5vmax 0.5vmax 0.5vmax 0.5vmax;
  border: 2px solid #8f8f8f;
  width: auto;
  height: 100%;
}

.block_acheivements img {
  display: block;
  box-sizing: border-box;
  text-align: center;
  margin-left: auto;
  margin-right: auto;
  max-width: 100%;
  height: 100%;
  border: none;
  margin: auto;
  padding: 0.2vmax;
}

.block_acheivements:hover {
  box-sizing: border-box;
  cursor: pointer;
  border: 4px solid darkblue;
  border-radius: 0.5vmax 0.5vmax 0.5vmax 0.5vmax;
}

.list_acheivements {
  margin-top: 0vmax;
  box-sizing: border-box;
  color: darkblue;
  border-radius: 0.5vmax 0.5vmax 0.5vmax 0.5vmax;
  border: 2px solid #8f8f8f;
  background-color: rgb(170, 240, 149);
  height: 100%;
  width: 100%;
}

.block_popup2 {
  display: block;
  position: absolute;
  border-radius: 0.5vmax 0.5vmax 0.5vmax 0.5vmax;
  background-color: #fff12c;
  border: 2px solid #8f8f8f;
  padding: 1px;
  left: 50%;
  top: 40%;
  transform: translate(-50%, -50%);
  text-align: center;
  z-index: 5000;
  color: rgb(255, 255, 255);
}

.block_popup2 h1 {
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

.my_elo {
  display: block;
  position: relative;
  font-family: futura;
  font-weight: 900;
  font-size: 5vmax;
  text-align: center;
  color: #05348d;
  height: 100%;
}

.my_elo p {
  display: block;
  position: relative;
  top: 50%;
  transform: translateY(-50%);
}

.avatar {
  display: block;
  position: relative;
  box-sizing: border-box;
  max-width: 100%;
  height: 100%;
  max-height: 20.5vmax;

  margin: auto;
}

.block_avatar {
  width: 100%;
  height: 100%;
  background: rgb(61, 61, 61);
  border-radius: 0.5vmax 0.5vmax 0.5vmax 0.5vmax;
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

.user_list_selected {
  cursor: grabbing;
  font-size: 1.5vmax;
  font-weight: bold;
  color: none;
}

.user_list_selected:hover {
  font-weight: bold;
  color: #fff12c;
  cursor: pointer;
  -webkit-text-stroke: 1px;
  -webkit-text-stroke-color: rgb(0, 0, 0);
  font-family: futura;
}

.btn_logout {
  position: relative;
  top: 50%;
  transform: translateY(-50%);
  display: block;
  font-family: futura;
  font-size: 1.5vmax;
  padding: 0.5vmax;
  margin: auto;
  letter-spacing: 0.2vw;
  text-align: center;
  cursor: pointer;
}

.container_logout:hover {
  border: 1px solid #fff12c;
  color: #fff12c;
  border-color: #fff12c;
  opacity: 1;
  cursor: pointer;
}

.container_logout {
  display: block;
  height: 100%;
  width: 100%;
  background-color: black;
  border-radius: 0.5vmax 0.5vmax 0.5vmax 0.5vmax;
  background-color: rgb(57, 57, 73);
}

.link:hover {
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
  height: 38.8vmax;
  min-height: 70vh;

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

.grid_history span {
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
</style>