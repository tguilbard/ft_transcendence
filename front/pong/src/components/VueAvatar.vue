<template>
    <div>
    <vue-avatar
        :width="400"
        :height="400"
        :rotation="rotation"
        :borderRadius="borderRadius"
        :scale="scale"
        ref="vueavatar"
        @vue-avatar-editor:image-ready="onImageReady"
        >
    </vue-avatar>
    <br>
    <label>
        Zoom : {{scale}}x
        <br>
        <input
        type="range"
        min=1
        max=3
        step=0.02
        v-model='scale'
        />
    </label>
    <br>
    <label>
        Rotation : {{rotation}}°
        <br>
        <input
        type="range"
        min=0
        max=360
        step=1
        v-model='rotation'
        />
    </label>
    <br>
    <label>
        Radius : {{borderRadius}}px
        <br>
        <input
        type="range"
        min=0
        max=200
        step=1
        v-model='borderRadius'
        />
    </label>
    <br>
    <button v-on:click="saveClicked">Get image</button>
    <br>
    <img ref="image">
    </div>
</template>

<script setup lang="ts">

</script>

<style scoped>

</style>