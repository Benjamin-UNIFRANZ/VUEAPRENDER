<template>
  <div class="container mt-5">
    <div class="row justify-content-center">
      <div class="col-md-6">
        <div class="bg-gray-800 shadow-md rounded px-8 pt-6 pb-8 mb-4">
          <div class="mb-4">
            <h3 class="text-white text-center text-xl font-bold mb-2">{{ isLogin ? 'Login' : 'Register' }}</h3>
          </div>
          <form @submit.prevent="handleSubmit">
            <div class="mb-4">
              <label class="block text-white text-sm font-bold mb-2" for="email">
          Email
              </label>
              <input
          class="shadow appearance-none border rounded w-full py-2 px-3 leading-tight focus:outline-none focus:shadow-outline bg-gray-700 text-white"
          id="email"
          type="email"
          placeholder="Email"
          v-model="email"
          required
              />
            </div>
            <div class="mb-6">
              <label class="block text-white text-sm font-bold mb-2" for="password">
          Password
              </label>
              <input
          class="shadow appearance-none border rounded w-full py-2 px-3 mb-3 leading-tight focus:outline-none focus:shadow-outline bg-gray-700 text-white"
          id="password"
          type="password"
          placeholder="Password"
          v-model="password"
          required
              />
            </div>
            <div class="flex items-center justify-between">
              <button
          class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline w-full"
          type="submit"
              >
          {{ isLogin ? 'Login' : 'Register' }}
              </button>
            </div>
          </form>
          <p class="text-center text-gray-500 text-xs mt-3">
            {{ isLogin ? "Don't have an account?" : "Already have an account?" }}
            <a href="#" class="text-blue-500 hover:text-blue-700" @click.prevent="isLogin = !isLogin">
              {{ isLogin ? 'Register' : 'Login' }}
            </a>
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { supabase } from '../supabase'
import { useToast } from 'vue-toastification'
import { useRouter } from 'vue-router'

const router = useRouter()
const toast = useToast()
const email = ref('')
const password = ref('')
const isLogin = ref(true)

const handleSubmit = async () => {
  try {
    if (isLogin.value) {
      const { error } = await supabase.auth.signInWithPassword({
        email: email.value,
        password: password.value
      })
      if (error) throw error
      router.push('/')
      toast.success('Logged in successfully!')
    } else {
      const { error } = await supabase.auth.signUp({
        email: email.value,
        password: password.value
      })
      if (error) throw error
      toast.success('Registration successful! You can now login.')
      isLogin.value = true
    }
  } catch (error) {
    toast.error(error.message)
  }
}
</script>

<style scoped>
.card {
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.btn-primary {
  background-color: var(--primary-blue);
  border-color: var(--primary-blue);
}

.btn-primary:hover {
  background-color: var(--dark-blue);
  border-color: var(--dark-blue);
}
</style>