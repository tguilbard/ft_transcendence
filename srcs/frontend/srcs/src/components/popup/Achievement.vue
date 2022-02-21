<template>
  <!-- <div class="block_container"> -->
    <!-- <div class="content_container"> -->
        <h1>ACHIEVEMENTS</h1>
      <div class="list_acheivements">
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
    <!-- </div> -->
  <!-- </div> -->
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
/* .block_container {
  display: block;
  border-radius: 0.5vmax 0.5vmax 0.5vmax 0.5vmax;
  background-color: #fff12c;
  border: 2px solid #8f8f8f;
  padding: 1px;
  text-align: center;
  color: rgb(255, 255, 255);
} */

h1 {
  border-radius: 0.5vmax 0.5vmax 0px 0px;
  text-align: center;
  background-color: grey;
  color: #fff12c;
  padding: 0.2vmax;
  -webkit-text-stroke: 1px;
  -webkit-text-stroke-color: rgb(0, 0, 0);
  font-family: futura;
  font-weight: 900;
  font-size: 1.5vmax;
  border: 1px solid black;
  display: block;
}

/* .content_container {
  border-radius: 0.5vmax 0.5vmax 0.5vmax 0.5vmax;
  background-color: #b8b8b8;
  border: 2px solid darkblue;
  box-sizing: border-box;
  height: auto;
  text-align: left;
  font-weight: 900;
  font-size: 1.2vmax;
} */

.container_block_acheivements {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 0.2vmax;
  margin: 0.3vmax;
  overflow: auto;
}

.block_acheivements {
  display: block;
  box-sizing: border-box;
  background-color: rgb(184, 184, 184);
  border-radius: 0.5vmax 0.5vmax 0.5vmax 0.5vmax;
  border: 2px solid #8f8f8f;
  max-width: 100%;
  max-height: 100%;
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
  border-radius: 0vmax 0vmax 0.5vmax 0.5vmax;
  border: 2px solid darkblue;
  background-color: rgb(170, 240, 149);
  height: 100%;
  width: 100%;
}

</style> >