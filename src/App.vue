<template>
  <nav class="navbar navbar-expand-lg navbar-dark custom-navbar mb-4">
    <div class="container">
      <router-link class="navbar-brand" to="/">C# Editor</router-link>
      <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
        <span class="navbar-toggler-icon"></span>
      </button>
      <div class="collapse navbar-collapse" id="navbarNav">
        <ul class="navbar-nav me-auto">
          <li class="nav-item" v-if="session">
            <router-link class="nav-link" to="/">Editor</router-link>
          </li>
          <li class="nav-item" v-if="session">
            <router-link class="nav-link" to="/projects">Projects</router-link>
          </li>
        </ul>
        <ul class="navbar-nav">
          <li class="nav-item" v-if="session">
            <a @click="handleLogout" href="#" class="nav-link">Logout</a>
          </li>
          <li class="nav-item" v-else>
            <router-link class="nav-link" to="/auth">Login</router-link>
          </li>
        </ul>
      </div>
    </div>
  </nav>
  <router-view></router-view>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { supabase } from './supabase'
import { useRouter } from 'vue-router'
import { useToast } from 'vue-toastification'

const router = useRouter()
const toast = useToast()
const session = ref(null)

onMounted(() => {
  supabase.auth.getSession().then(({ data: { session: currentSession } }) => {
    session.value = currentSession
  })

  supabase.auth.onAuthStateChange((_event, currentSession) => {
    session.value = currentSession
  })
})

const handleLogout = async () => {
  try {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
    router.push('/auth')
    toast.success('Logged out successfully!')
  } catch (error) {
    toast.error('Error logging out: ' + error.message)
  }
}
</script>