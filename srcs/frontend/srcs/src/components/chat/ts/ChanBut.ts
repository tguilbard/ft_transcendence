import { defineComponent } from "@vue/runtime-core";


export default defineComponent({
    props: {
        name: String,
        state: Boolean,
        mod: Boolean
    },
})