<template>
  <div class="container mt-5">
    <div class="row justify-content-center">
      <div class="col-md-6">
        <div class="card">
          <div class="card-header bg-dark text-white">
            <h3 class="mb-0">{{ isLogin ? 'Login' : 'Register' }}</h3>
          </div>
          <div class="card-body">
            <form @submit.prevent="handleSubmit">
              <div class="mb-3">
                <label for="email" class="form-label">Email</label>
                <input
                  type="email"
                  class="form-control"
                  id="email"
                  v-model="email"
                  required
                />
              </div>
              <div class="mb-3">
                <label for="password" class="form-label">Password</label>
                <input
                  type="password"
                  class="form-control"
                  id="password"
                  v-model="password"
                  required
                />
              </div>
              <button type="submit" class="btn btn-primary w-100">
                {{ isLogin ? 'Login' : 'Register' }}
              </button>
            </form>
            <p class="text-center mt-3">
              {{ isLogin ? "Don't have an account?" : "Already have an account?" }}
              <a href="#" @click.prevent="isLogin = !isLogin">
                {{ isLogin ? 'Register' : 'Login' }}
              </a>
            </p>
          </div>
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