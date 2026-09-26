import { createApp } from 'vue'
import { createRouter, createWebHashHistory } from 'vue-router'
import App from './App.vue'
import HomeView from './views/HomeView.vue'
import ProcedureView from './views/ProcedureView.vue'
import AboutView from './views/AboutView.vue'
import './assets/main.css'

const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    { path: '/', name: 'home', component: HomeView },
    { path: '/procedure/:slug', name: 'procedure', component: ProcedureView, props: true },
    { path: '/gioi-thieu', name: 'about', component: AboutView },
    { path: '/:pathMatch(.*)*', redirect: '/' },
  ],
  // Chuyển route → về đầu trang. Hash router mặc định KHÔNG scroll.
  scrollBehavior() {
    return { top: 0 }
  },
})

createApp(App).use(router).mount('#app')