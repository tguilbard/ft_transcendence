<template>
  <h1>ACHIEVEMENTS</h1>
  <div class="list_acheivements">
    <div v-if="GET_LIST_ACHIEVEMENTS_TARGET">
    <div class="container_block_acheivements">
        <div class="block_acheivements" v-for="item in GET_LIST_ACHIEVEMENTS_TARGET" :key="item"
        >
          <div @click="setAchievement(item)" class="color1">
            <div>
              <div v-if="item.lock">
                <img
                  v-bind:src="require('../../assets/lock/' + item.imageLockName)"
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
import { Achievements } from "@/interface/interface";
import { defineComponent } from "@vue/runtime-core";
import { mapGetters } from "vuex";
import store from "../../store";

export default defineComponent({
  computed: {
    ...mapGetters([
      "GET_POPUP",
      "GET_LIST_ACHIEVEMENTS",
      "GET_LIST_ACHIEVEMENTS_TARGET",
      "GET_ACHIEVEMENT",
    ]),
  },
  methods: {
    setPopup(value: string): void {
      store.commit("SET_POPUP", value);
    },
    setAchievement(value: Achievements): void {
      store.dispatch("SET_ACHIEVEMENT", value);
      store.dispatch("SET_SAVE_POPUP");
      this.setPopup("description");
    },
  },
});
</script>

<style scoped>

html {
	font-size: 62.5%;
  font-weight: 900;
}

h1 {
  border-radius: 0.5vh 0.5vh 0px 0px;
  text-align: center;
  background-color: grey;
  color: #fff12c;
  padding: 0.5vh;
  -webkit-text-stroke: 1px;
  -webkit-text-stroke-color: rgb(0, 0, 0);
  font-family: futura;
  font-size: 1.8vw;
  border: 1px solid black;
  display: block;
}

.container_block_acheivements {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 0.5vh;
  margin: 0.5vh;
}

.block_acheivements {
  display: block;
  box-sizing: border-box;
  background-color: rgb(184, 184, 184);
  border-radius: 0.5vh 0.5vh 0.5vh 0.5vh;
  border: 2px solid #8f8f8f;
  width: 100%;
  height: 100%;
}

.block_acheivements img {
  display: block;
  box-sizing: border-box;
  text-align: center;
  margin-left: auto;
  margin-right: auto;
  max-width: 100%;
  max-height: 100%;
  border: none;
  margin: auto;
  padding: 0.5vw;
}

.block_acheivements:hover {
  box-sizing: border-box;
  cursor: pointer;
  border: 4px solid darkblue;
  border-radius: 0.5vh 0.5vh 0.5vh 0.5vh;
}

.list_acheivements {
  margin-top: 0px;
  box-sizing: border-box;
  color: darkblue;
  border-radius: 0vh 0vh 0.5vh 0.5vh;
  border: 2px solid darkblue;
  background-color: rgb(170, 240, 149);
  height: 100%;
  width: 100%;
}
</style> >