<template>
    <div :class="[ state? 'on': 'off', 'chanButton' ]">
        <div v-if="mod">
                <div class="btn_chan">
                    <div>
                        <p>{{name}}</p>
                    </div>
                    <div>
                        <img src="@/assets/key.png" alt="">
                    </div>
                </div>
        </div>
        <div v-else >
            <div>
                <p>{{name}}</p>
            </div>
        </div>
    </div>
</template>

<script src="@/components/chat/ts/ChanBut.ts">
</script>

<style src="@/components/chat/css/ChanBut.css" scoped>
</style>