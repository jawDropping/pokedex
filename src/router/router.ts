import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {

      return savedPosition
    }

    return { top: 0 }
  },
  routes: [
    {
      path: '/',
      name: 'home',
      component: () => import('@/views/HomeView.vue'),
    },
    {
      path: '/pokemon/:id',
      name: 'pokemon-details',
      component: () => import('@/views/PokemonDetailsView.vue'),
      props: true,
    },
  ],
})

export default router