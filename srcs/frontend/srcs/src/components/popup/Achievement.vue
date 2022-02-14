<template>
  <div class="contenaire_acheivements">
    <h1>ACHIEVEMENTS</h1>
    <div class="list_achivements">
      <div class="contenaire_block_acheivements">
        <div
          class="block_acheivements"
          v-for="(item, index) in GET_LIST_ACHIEVEMENTS"
          :key="index"
        >
          <div @click="setAchievement(item)" :class="[index % 2 ? 'color1' : 'color2']">
            <div>
              <div v-if="index % 2">
                <img
                  v-bind:src="
                    require('../../assets/lock/' + item.imageLockName)
                  "
                />
              </div>
              <div v-else>
                <img
                  v-bind:src="
                    require('../../assets/unlock/' + item.imageUnlockName)
                  "
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">

import { defineComponent } from "@vue/runtime-core";
import { mapGetters } from "vuex";
import store, { Achievements } from "../../store";

export default defineComponent({
  computed: {
    ...mapGetters(["GET_POPUP", "GET_LIST_ACHIEVEMENTS", "GET_ACHIEVEMENT"]),
  },
  methods: {
    setPopup(value: string): void {
      store.commit("SET_POPUP", value);
    },
    setAchievement(value: Achievements): void {
      store.dispatch("SET_ACHIEVEMENT", value);
      this.setPopup("description");
    },
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
  background-color: none;
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

.block_description {
  display: block;
  margin: 0.2vmax;
  text-align: center;
  font-size: 1.5vmax;
  padding: 2vmax;
}

.contenaire_acheivements {
  margin: 0.5vmax;
  margin-top: 1vmax;
  margin-bottom: 1vmax;
}

.contenaire_block_acheivements {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 0.2vmax;
}

.block_acheivements {
  display: block;
}

.block_acheivements img {
  display: block;
  text-align: center;
  margin-left: auto;
  margin-right: auto;
  width: 5vmax;
  height: 5vmax;
  border: none;
}

.block_acheivements p {
  display: block;
  text-align: center;
  margin-left: auto;
  margin-right: auto;
}

.list_achivements {
  margin-top: 0vmax;
  margin-bottom: 1vmax;
  padding: 0.2vmax;
  overflow: auto;
  color: darkblue;
  height: auto;
  border-radius: 0vmax 0vmax 0.5vmax 0.5vmax;
  border: 2px solid #8f8f8f;
  background-color: rgb(69, 240, 240);
  background-color: rgb(170, 240, 149);
}

.color1 {
  background-color: rgb(184, 184, 184);
  border-radius: 0.5vmax 0.5vmax 0.5vmax 0.5vmax;
  border: 2px solid #8f8f8f;
}

.color2 {
  background-color: rgb(129, 216, 210);
  background-color: rgb(184, 184, 184);

  border-radius: 0.5vmax 0.5vmax 0.5vmax 0.5vmax;
  border: 2px solid #8f8f8f;
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