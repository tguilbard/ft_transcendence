<template>
  <div v-if="activate">
    <div class="sup">
      <div class="block_avatar">
       <img v-if="srcImg" v-bind:src="srcImg" class="avatar" />
      </div>
      <div class="block_avatar">
        <label for="avatar" class="btn_avatar"
          ><h2>Choisis un avatar</h2></label
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
      </div>
    </div>
    <div :style="inf"></div>
    <form @submit.prevent="submit">
      <input
        class="username"
        type="pseudo"
        name="pseudo"
        placeholder="Entre ton pseudo"
        v-model="username"
        required
        minlength="3"
        maxlength="7"
      />
      <div v-if="myerror && myerror.message">
        <div v-for="msg in myerror.message" :key="msg">
          <p style="color: red" v-if="msg.username">
            {{ msg.username }}
          </p>
        </div>
      </div>
      <div>
        <input class="valider" type="submit" value="ENREGISTRER" />
      </div>
    </form>
  </div>
  <img class="background_pong" v-bind:src="require('../assets/background_pong.gif')"/>
</template>

<script lang="ts">
import router from "@/router";
import { Options, Vue } from "vue-class-component";
import shared from "../mixins/Mixins";

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
  methods: {
    
    getImg(event: { target: { files: File[] } }) {
      this.file = event.target.files[0];
      this.srcImg = URL.createObjectURL(this.file);
    },
    addUser(formData: FormData) {
      fetch(`http://localhost:3000/users/register`, {
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
            return router.push("/auth");
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
          formData.append("unlock", 'false');
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
        formData.append("unlock", 'true');
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

.background_pong {
   position: absolute;
    display: block;
    z-index: -1;
    width: 100%;
    left: 0;
    height: 50%;
    top: 50%;
  }

.btn_avatar {
  display: block;
  position: relative;
  top: 0px;
  z-index: 10;
  background-color: black;
  color: white;
  padding: 1vh;
  font-family: futura-pt;
  font-size: 3vh;
  box-shadow: -2px 2px 5px 2px white;
  border-radius: 0px 0px 0.5vw 0.5vw;
  box-sizing: border-box;
  width: 40vh;
  height: auto;
  white-space: nowrap;
  left: 50%;
  transform: translateX(-50%);
}

.sup {
  display: grid;
  grid-row: 2;
  background-color: #fff12c;
  position: relative;
  height: 50vh;
  justify-content: center;
  align-content: flex-start;
  gap: none;
}

.block_avatar {
	display: block;
	position: relative;
}

.avatar {
  
  outline: 1px solid black;
  box-shadow: 0 0 15px 10px rgb(19, 12, 12);
  box-sizing: border-box;
  width: 40vh;
  height: 40vh;
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
  color: #fff12c;
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
  margin-top: 5vh;
  left: 50%;
  background-color: grey;
  color: #fff12c;
  transform: translateX(-50%);
  padding: 1vh;
  font-family: futura-pt;
  font-size: 3vh;
  z-index: 1;
  text-align: center;
  box-shadow: -2px 2px 5px 2px white;
  font-weight: bold;
  box-sizing: border-box;
  width: 40vh;
  height: auto;
}

.valider {
  position: relative;
  background-color: black;
  color: #fff12c;
  margin-top: 5vh;
  padding: 1vh;
  font-family: futura-pt;
  font-size: 3vh;
  z-index: 1;
  box-shadow: -2px 2px 5px 2px white;
  border-radius: 0.5vw 0.5vw 0.5vw 0.5vw;
  box-sizing: border-box;
  width: 40vh;
  height: auto;
}

p{
  position: relative;
  width: min-content;
  white-space: nowrap;
  padding: 0.2vw;
  left: 50%;
  transform: translateX(-50%);
  background-color: #fff12c;
  border-radius: 0.5vh;
  font-family: futura-pt;
  font-size: 3vh;
   margin-bottom: 2vh;
   margin-top: 1vh;
}

</style>