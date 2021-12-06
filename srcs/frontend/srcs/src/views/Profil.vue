<template>
  <div class="form_wrapper">
    <div class="form_container">
      <div id="app">
        <p v-if="srcImg">
          <img v-bind:src="srcImg" width="200" height="200" />
        </p>
      </div>
      <div class="row clearfix">
        <div class="">
          <form
            action="http://localhost:3000/register"
            method="post"
            class="form-example"
          >
            <label for="avatar" class="btn"
              ><h2 style="background: #f5ba1a">Choisis un avatar</h2></label
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
            <div class="input_field">
              <span><i aria-hidden="true" class="fa fa-envelope"></i></span>
              <input
                type="pseudo"
                name="pseudo"
                placeholder="Entre ton pseudo"
                required
              />
            </div>
            <p>{{ srcImg }}</p>
            <div class="input_field checkbox_option">
              <input type="checkbox" id="cb1" name="auth2" />
              <label for="cb1">Activer la double authentification</label>
            </div>
            <div class="input_field checkbox_option">
              <input type="checkbox" id="cb2" required />
              <label for="cb2">J'accepte les termes et conditions</label>
            </div>

            <input
              class="button"
              type="submit"
              value="ENREGISTRER"
              @click="envoi"
            />
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Options, Vue } from "vue-class-component";

@Options({
  data() {
    return {
      srcImg: "",
      file: "",
    };
  },
  methods: {
     getImg(event: { target: { files: File[] } }) {
      this.file = event.target.files[0];
      this.srcImg = URL.createObjectURL(this.file);
    },
    envoi() {
      // Récupération de l'image
      let img = this.file;
      // Création d'un formData obligatoire pour envoi de l'image
      var formData = new FormData();
      formData.append("img", img, this.file.name);
      // Envoi des données sur l'url du serveur (mettez la votre) en POST en envoyant le formData contenant notre image et notre texte
      fetch("http://localhost:3000/users/upload", {
        method: "POST",
        mode: "cors",
        credentials: "include",
        headers: {
          "Access-Control-Max-Age": "600",
          "Cache-Control": "no-cache",
        },
        body: formData,
      });
    },
    async get_img() {
      let response = await fetch("http://localhost:3000/users/img", {
        method: "GET",
        mode: "cors",
        credentials: "include",
        //responseType: "blob",
        headers: {
          "Access-Control-Max-Age": "600",
          "Cache-Control": "no-cache",
        },
      });

      if (!response.ok) {
        throw new Error(`Erreur HTTP ! statut : ${response.status}`);
      }
      let myBlob = await response.blob();
      let objectURL = URL.createObjectURL(myBlob);
      this.srcImg = objectURL;
    },
  },
  created() {
    this.get_img();
  },
})
export default class Profil extends Vue {}
</script>


<style scoped>
</style>