<template>
<div v-if="GET_POPUP == 'description' || GET_POPUP == 'description2'">

  <div v-if="GET_POPUP == 'description2'"  @click="setPopup('')" class="container_popup3"></div>
  <div v-else  @click="setPopup('profil')" class="container_popup3"></div>
  <div class="block_popup2">
    <div class="content_popup">
      <h1>{{GET_ACHIEVEMENT.name}}</h1>
      <div class="content_popup_profil">
        <div class="block_description">
          <p>{{GET_ACHIEVEMENT.description}}</p>
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

export default defineComponent({
  computed: {
    ...mapGetters(["GET_POPUP", "GET_ACHIEVEMENT"]),
  },
  methods: {
    setPopup(value: string): void {
      store.commit("SET_POPUP", value);
    },
  },
});
</script>

<style scoped>
.container_popup3 {
  display: block;
  position: absolute;
  height: 100vh;
  width: 100vw;
  text-align: center;
  z-index: 110;
  visibility: hidden;
  background-color: rgba(0, 0, 0, 0);
  overflow: hidden;
}

.container_popup3 {
  z-index: 110;
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

.block_description {
  display: block;
  margin: 0.2vmax;
  text-align: center;
  font-size: 1.5vmax;
  padding: 2vmax;
}

.block_popup2 {
  display: block;
  position: absolute;
  border-radius: 7px 7px 7px 7px;
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
</style> >