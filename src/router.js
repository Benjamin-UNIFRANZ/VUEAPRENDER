import { createRouter, createWebHistory } from 'vue-router'
import Editor from './components/Editor.vue'
import Projects from './components/Projects.vue'
import Auth from './components/Auth.vue'
import SharedProjectSpace from './components/SharedProjectSpace.vue' // Import the new component
import { supabase } from './supabase'

const routes = [
  {
    path: '/',
    name: 'Editor',
    component: Editor,
    meta: { requiresAuth: true }
  },
  {
    path: '/projects',
    name: 'Projects',
    component: Projects,
    meta: { requiresAuth: true }
  },
  {
    path: '/auth',
    name: 'Auth',
    component: Auth
  },
  {
    path: '/projects/:shared_project_space_id', // New route
    name: 'sharedProjectSpace',
    component: SharedProjectSpace,
    meta: { requiresAuth: true }
  },
  {
    path: '/projects/:project_space_data(.*)',
    name: 'sharedProjectSpaceData',
    component: SharedProjectSpace,
    meta: { requiresAuth: true }
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: '/'
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach(async (to, from, next) => {
  const { data: { session } } = await supabase.auth.getSession()
  
  if (to.meta.requiresAuth && !session) {
    next('/auth')
  } else if (session && to.path === '/auth') {
    next('/')
  } else {
    next()
  }
})

export default router