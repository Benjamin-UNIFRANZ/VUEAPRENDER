<template>
  <nav class="bg-gray-800 py-1 mb-1">
    <div class="container mx-auto px-4">
      <div class="flex items-center justify-between">
        <router-link class="text-white font-semibold text-2xl" to="/">C# Editor</router-link>
        <button class="navbar-toggler text-white focus:outline-none" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
          <span class="navbar-toggler-icon"></span>
        </button>
        <div class="hidden md:flex items-center space-x-4">
          <ul class="flex space-x-4">
            <li v-if="session">
              <router-link class="text-white hover:text-white text-lg" to="/">Editor</router-link>
            </li>
            <li v-if="session">
              <router-link class="text-white hover:text-white text-lg" to="/projects">Projects</router-link>
            </li>
          </ul>
          <ul class="flex space-x-4">
            <li v-if="session">
              <a @click="handleLogout" href="#" class="text-white hover:text-white text-lg">Logout</a>
            </li>
            <li v-else>
              <router-link class="text-white hover:text-white text-lg" to="/auth">Login</router-link>
            </li>
          </ul>
        </div>
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