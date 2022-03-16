import './registerServiceWorker'
import router from './router'
import store from './store'
import { createApp } from 'vue'
import App from './App.vue'

createApp(App).use(store).use(router).mount('#app')
