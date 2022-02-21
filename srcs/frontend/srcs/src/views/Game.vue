<template>
  <section>
    <Menu page="game" />
    <div v-if="GET_POPUP">
      <Popup/>
    </div>
    <div id="grid">
      <div id="a" class="block_container">
        <div class="content_container" @click="active_game">
          <p>PLAY TO GAME</p>
        </div>
      </div>
      <div id="b" class="block_container">
        <div class="content_container">
          <div class="block_text">
            <h2>RULES OF GAME</h2>
            <br />
            <p>
              Lorem ipsum dolor sit amet consectetur adipisicing elit. Magnam
              fugiat pariatur fuga dolorem veritatis molestias, reprehenderit
              soluta porro voluptatem dicta deserunt illo labore harum
              temporibus modi minima rerum, aspernatur nisi inventore sunt
              explicabo delectus quae natus! Quidem, animi minus magni qui
              corrupti amet quibusdam maiores sed, explicabo, facere earum?
              Molestias porro suscipit quas? Voluptate nobis voluptatum, aliquid
              culpa minus obcaecati, at possimus, nostrum nemo eligendi alias et
              saepe numquam cumque qui error assumenda perspiciatis tempora quas
              adipisci eum sapiente pariatur? Laudantium eligendi harum tenetur
              repudiandae perferendis quas neque impedit animi facere
              accusantium deserunt dignissimos voluptate praesentium
              reprehenderit, quae dicta omnis?
            </p>
          </div>
        </div>
      </div>
      <div id="c" class="block_container">
        <div class="content_container">
          <div class="block_leaderboard">
            <div>
              <h1>LEADERBOARD</h1>
            </div>
            <div class="content_leaderboard">
              <div v-for="item in GET_LEADER_BOARD" :key="item">
                <div class="grid_leaderboard">
                  <div class="left">
                    <p>{{ item.elo }}</p>
                  </div>

                  <!-- <div id="friends_content" class="friends_content"> -->
                  <div class="logo_connection right">
                    <div>
                      <div v-if="item.username == GET_USER.username">
                        <p
                          class="link"
                          @click="active_pop_profil(item)"
                          style="color: rgb(160, 28, 28); text-align: left"
                        >
                          {{ item.username }}
                        </p>
                      </div>
                      <div v-else>
                        <p
                          class="link"
                          @click="active_pop_profil(item)"
                          style="text-align: left"
                        >
                          {{ item.username }}
                        </p>
                      </div>
                    </div>
                    <div>
                      <div v-if="item.state == 'login'" class="mod">
                        <img src="../assets/circle_green.png" alt="login" />
                      </div>
                      <div v-else-if="item.state == 'in match'" class="mod">
                        <img src="../assets/circle_orange.png" alt="in match" />
                      </div>
                      <div v-else class="mod">
                        <img src="../assets/circle_grey.png" alt="logout" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script lang="ts">
import { Options, Vue } from "vue-class-component";
import Menu from "@/components/Menu.vue"; // @ is an alias to /src
import store, { UserEntity } from "../store";
import shared from "../mixins/Mixins";
import Pong from "../components/game/Pong.vue";
import { mapGetters } from "vuex";
import Popup from "../components/PopUp.vue";
import { User } from "@/components/popup/Popup_profil.vue";

@Options({
  components: {
    Menu,
    Pong,
    Popup,
  },
  async created() {
    if (!(await shared.isLogin())) return this.$router.push("login");
    if (!store.state.sock_init) store.commit("SET_SOCKET");

    const user = await shared.getMyUser();

    store.dispatch("SET_USER", user);
    await store.dispatch(
      "SET_LIST_USER_GENERAL",
      await shared.getUserInChan("General")
    );
    store.dispatch(
      "SET_LIST_ACHIEVEMENTS",
      await shared.getAchievements(store.getters.GET_USER.username)
    );
    store.dispatch("SET_LEADER_BOARD", await shared.getLeaderBoard());
    if (store.getters.GET_DUEL) this.active_game();

    store.state.socket.off("start_game").on("start_game", () => {
      this.active_game();
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
  },
  computed: {
    ...mapGetters(["GET_LIST_USER_GENERAL", "GET_LEADER_BOARD", "GET_USER", "GET_POPUP"]),
    getRoute() {
      return this.$route.name;
    },
  },
  methods: {
    setPopup(value: string): void {
      store.dispatch("SET_POPUP", value);
    },
    async active_pop_profil(user: UserEntity): Promise<void> {
      // if (user.state == "") {
      //   const myUser = await shared.getUserByUsername(user.username);
      //   if (myUser.state) user.state = myUser.state;
      // }
      store.dispatch("SET_USER_TARGET", user);
      await store.dispatch("SET_IS_FRIEND", await shared.isFriendByUsername());
      store.commit("SET_POPUP", "profil");
      await store.dispatch(
        "SET_IMG_TARGET",
        await shared.get_avatar(user.username)
      );
    },
    active_game() {
      let check = document.getElementById("grid");
      if (check !== null) check.style.display = "none";
      check = document.getElementById("PongBorder");
      if (check !== null) check.style.setProperty("display", "block");
    },
  },
})
export default class Home extends Vue {}
</script>

<style scoped>
p,
span,
h1 {
  cursor: default;
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

.left {
  background-color: rgb(237, 223, 244);
}

.right {
  text-align: center;
}

#PongBorder {
  height: 70%;
  margin-left: 3vw;
  margin-right: 3vw;
  margin-bottom: 5vh;
  margin-top: 2vh;
  border-radius: 7px 7px 7px 7px;
  background-color: black;
  border: 2px solid #8f8f8f;
  padding: 1px;
  display: none;

  border-radius: 0.5vmax 0.5vmax 0.5vmax 0.5vmax;
  background-color: #fff12c;
  border: 2px solid #8f8f8f;
}

p {
  text-align: justify;
  font-family: futura;
  font-weight: 900;
  font-size: 1.5vmax;
  padding: 1vmax;
}

h2 {
  text-align: center;
  font-family: futura;
  font-weight: 900;
  font-size: 1.5vmax;
}

span {
  text-align: center;
  font-family: futura;
  font-weight: 900;
  font-size: 1.5vmax;
  padding: 1vmax;
}

#a {
  grid-area: a;
}

#a p {
  text-align: center;
}

#a p,
#c p {
  color: darkblue;
}

#b .content_container {
  grid-area: b;
  background-color: rgb(0, 0, 0);
  color: yellow;
}

.block_text {
  display: block;
  position: relative;
  align-self: center;
  box-sizing: border-box;
  top: 50%;
  transform: translateY(-50%);
  font-weight: normal;
}

#c {
  grid-area: c;
}

#grid {
  display: grid;
  grid-template-rows: minmax(min-content, 0) minmax(min-content, auto);
  grid-template-columns: 2fr 1fr;
  grid-template-areas:
    "a c"
    "b c";
  width: 90vw;
  height: 40vmax;
  min-height: 75vh;
  margin: auto;
  margin-top: 1vh;
  gap: 0.2vmax;
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

.block_leaderboard {
  border-radius: 0.5vmax 0.5vmax 0.5vmax 0.5vmax;
  box-sizing: border-box;
  height: 100%;
  width: 100%;
  background-color: #f6ecd2;
}

.logo_connection {
  display: grid;
  position: relative;
  grid-template-columns:
    minmax(min-content, max-content) minmax(min-content, max-content)
    minmax(min-content, max-content);
  justify-content: end;
  width: 100%;
}

.logo_connection img {
  width: 1.5vmax;
  height: 1.5vmax;
  transform: translateY(0.25vmax);
  margin: 0.2vmax;
  padding: 0.4vmax;
  width: auto;
  font-size: 1.5vmax;
  border-radius: 0px 0px 0.5vmax 0.5vmax;
}

#a .content_container:hover,
#a .content_container p:hover {
  cursor: pointer;
  background-color: darkblue;
  color: #fff12c;
  border-radius: 0.5vmax 0.5vmax 0.5vmax 0.5vmax;
}

.link {
  color: darkblue;
}

.link:hover {
  color: #fff12c;
  cursor: grabbing;
  -webkit-text-stroke: 1px;
  -webkit-text-stroke-color: rgb(0, 0, 0);
  font-family: futura;
}

.grid_leaderboard {
  display: grid;
  grid-template-columns: 4fr 10fr;
  width: 100%;
  justify-content: space-between;
}

.content_leaderboard {
  overflow: auto;
  min-height: 69vh;
  height: 38vmax;
  border-radius: 0vmax 0vmax 0.5vmax 0.5vmax;
}
</style>