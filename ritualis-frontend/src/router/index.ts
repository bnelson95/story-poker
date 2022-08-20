import { createRouter, createWebHistory } from "vue-router"
import SessionView from "../views/SessionView.vue"
import SessionJoin from "../views/SessionJoin.vue"

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: "/session",
      name: "session-init",
      component: SessionView,
    },
    {
      path: "/session/:id",
      name: "session",
      component: SessionJoin,
    }
  ],
})

export default router
