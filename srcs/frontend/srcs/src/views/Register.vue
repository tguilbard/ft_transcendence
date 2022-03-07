<template>
  <div v-if="activate">
    <div class="sup">
      <p v-if="srcImg">
        <img v-bind:src="srcImg" class="avatar" />
      </p>
      <label for="avatar" class="btn_avatar"><h2>Choisis un avatar</h2></label>
      <input
        type="file"
        id="avatar"
        name="avatar"
        accept="image/*"
        @change="getImg"
        style="visibility: hidden"
        placeholder="Choississez un avatar"
      />
    </div>
    <div :style="inf"></div>
    <form class="form" @submit.prevent="submit">
      <input
        class="username"
        type="pseudo"
        name="pseudo"
        placeholder="Entre ton pseudo"
        v-model="username"
        required
      />
      <p>{{ username }}</p>
      <div v-for="msg in myerror.message" :key="msg">
        <p style="color: red" v-if="msg.username">{{ msg.username }}</p>
      </div>
      <input class="valider" type="submit" value="ENREGISTRER" />
    </form>
  </div>
</template>

<script lang="ts">
import router from "@/router";
import { Options, Vue } from "vue-class-component";
import shared from "../mixins/Mixins";
import store from "../store/index";

@Options({
  data() {
    return {
      srcImg: "",
      file: "",
      user: "",
      username: "",
      myerror: {},
      activate: false,
    };
  },
  computed: {
    inf() {
      return {
        width: "100%",
        left: "0",
        overflow: "hidden",
        "z-index": "-1",
        position: "absolute",
        height: "50%",
        top: "50%",
        "background-image": `url(https://profgra.org/lycee/img/pong.gif)`,
        "background-size": "100% 100%",
      };
    },
  },
  methods: {
    getImg(event: { target: { files: File[] } }) {
      this.file = event.target.files[0];
      this.srcImg = URL.createObjectURL(this.file);
    },
    addUser(formData: FormData) {
      fetch(`http://${process.env.VUE_APP_BACK}/users/register`, {
        method: "POST",
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
            store.dispatch("SET_USERNAME", this.username);
            return router.push("http://127.0.0.1:8080/auth");
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
    async getIntra() {
      var formData = new FormData();
      await fetch(this.srcImg)
        .then((response) => response.blob())
        .then((blob) => {
          formData.append("username", this.username);
          formData.append("img", blob);
        });
      await this.addUser(formData);
    },
    async submit() {
      if (!this.file) this.getIntra();
      else {
        // Création d'un formData obligatoire pour submit de l'image
        let img = this.file;
        var formData = new FormData();
        formData.append("username", this.username);
        formData.append("img", img);
        await this.addUser(formData);
      }
    },
  },
  async created() {
    if (!(await shared.isAccess("register"))) return this.$router.push("login");
    let link = (await sessionStorage.getItem("login")) || "";
    if (link) this.user = await JSON.parse(link);
    if (!this.user) return this.$router.push("login");
    link = (await sessionStorage.getItem("src")) || "";
    link = await JSON.parse(link);
    if (await shared.myGuest()) this.srcImg = require("../assets/" + link);
    else this.srcImg = link;
    this.activate = true;
  },
})
export default class Register extends Vue {}
</script>


<style scoped >
*:focus {
  outline: none;
}

.form {
  position: relative;
  display: block;
  top: 5vh;
}

.btn_avatar {
  position: absolute;
  display: block;
  top: 50vh;
  left: 50vw;
  transform: translate(-50%, -50%);
  background-color: black;
  color: white;
  padding: 15px 15px 15px 15px;
  font-family: futura-pt;
  font-size: 1vmax;
  z-index: 1;
  box-shadow: -2px 2px 5px 2px white;
  border-radius: 15px;
}

.sup {
  background-color: #fff12c;
  position: relative;
  width: 100vw;
  height: 50vh;
}

.avatar {
  display: block;
  position: relative;
  width: 40vh;
  height: 40vh;
  top: 3vh;
  left: 50%;
  transform: translateX(-50%);
  outline: 1px solid black;
  box-shadow: 0 0 15px 10px rgb(19, 12, 12);
}

input::placeholder {
  color: white;
  opacity: 1;
}

input:hover {
  color: #fff12c;
  border-color: #fff12c;
  opacity: 1;
}

input:target {
  color: #fff12c;
  border-color: #fff12c;
  opacity: 1;
}

input,
select,
textarea {
  color: #000;
}

.btn_avatar:hover {
  color: #fff12c;
  border: 3px solid #fff12c;
  border-color: #fff12c;
  opacity: 1;
}

.username {
  display: block;
  position: relative;
  top: 5vh;
  left: 0;
  left: 50%;
  background-color: grey;
  color: #fff12c;
  transform: translateX(-50%);
  padding: 15px 15px 15px 15px;
  font-family: futura-pt;
  font-size: 1.5vmax;
  z-index: 1;
  text-align: center;
  box-shadow: -2px 2px 5px 2px white;
  font-weight: bold;
}

.valider {
  position: relative;
  background-color: black;
  color: #fff12c;
  top: 10vh;
  padding: 15px 15px 15px 15px;
  font-family: futura-pt;
  font-size: 2vmax;
  z-index: 1;
  box-shadow: -2px 2px 5px 2px white;
  border-radius: 15px;
}
</style>