<template>
  <div v-if="activate">
    <div class="sup">
      <div>
       <img v-if="srcImg" v-bind:src="srcImg" alt="qrcode" class="qrcode" />
      </div>
    </div>
    <div :style="inf"></div>
    <form class="form" @submit.prevent="submit">
      <input
        class="code"
        type="text"
        name="code"
        placeholder="Entre le code recus"
        v-model="code"
        required
        minlength="6"
        maxlength="6"
      />
      <div v-if="myerror && myerror.message">
        <div v-for="msg in myerror.message" :key="msg">
          <p style="color: red" v-if="msg.code">{{ msg.code }}</p>
        </div>
      </div>
      <input class="valider" type="submit" value="VALIDEZ" />
    </form>
  </div>
  <img class="background_pong" v-bind:src="require('../assets/background_pong.gif')"/>
</template>

<script lang="ts">
import { Options, Vue } from "vue-class-component";
import shared from "../mixins/Mixins";
import store from "../store/index";

@Options({
  data() {
    return {
      srcImg: "",
      code: "",
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
    async submit() {
      // Création d'un formData obligatoire pour submit de l'image
      await fetch(`http://localhost:3000/2fa/activate`, {
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
            return this.$router.push("/");
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
    async get_img() {
      let response = await fetch(`http://localhost:3000/avatar`, {
        method: "GET",
        mode: "cors",
        credentials: "include",
        headers: {
          "Access-Control-Max-Age": "600",
          "Cache-Control": "no-cache",
        },
      });

      if (!response.ok) {
        this.$router.push("login");
      }
      let myBlob = await response.blob();
      let objectURL = URL.createObjectURL(myBlob);
      this.srcImg = objectURL;
    },
  },
  async created() {
    if (
      (await shared.isGuest(store.getters.GET_USERNAME)) ||
      !(await shared.isAccess("authLogin"))
    )
      return this.$router.push("login");
    await this.get_img();
    this.activate = true;
  },
})
export default class Register extends Vue {}
</script>

<style scoped>
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

.sup {
  background-color: #fff12c;
  position: relative;
  width: 100vw;
  height: 50vh;
}

.qrcode {
  position: absolute;
  top: 3vh;
  left: 50%;
  transform: translateX(-50%);
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
  color: #000;
}

.code {
  display: block;
  position: relative;
  top: 0;
  left: 0;
  left: 50%;
  background-color: grey;
  color: #fff12c;
  transform: translate(-50%, -50%);
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
  padding: 1vh;
  font-family: futura-pt;
  font-size: 3vh;
  z-index: 1;
  box-shadow: -2px 2px 5px 2px white;
  border-radius: 0.5vh;
  box-sizing: border-box;
  width: 40vh;
  height: auto;
}

p {
  position: relative;
  width: min-content;
  white-space: nowrap;
  padding: 1vh;
  left: 50%;
  transform: translateX(-50%);
  background-color: #fff12c;
  border-radius: 0.5vh;
  font-family: futura-pt;
  font-size: 3vh;
  margin-bottom: 2vh;
}
</style>