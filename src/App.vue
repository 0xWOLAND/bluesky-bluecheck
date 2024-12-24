<script setup lang="ts">
import { ref } from 'vue'

const formData = ref({
  host: '',
  value: '',
  twitter: '',
})

const isLoading = ref(false)
const error = ref('')
const success = ref(false)
const isVerified = ref(false)
const checkingTwitter = ref(false)

const checkTwitterVerification = async () => {
  if (!formData.value.twitter) {
    error.value = 'Please enter a Twitter username'
    return
  }

  checkingTwitter.value = true
  error.value = ''

  try {
    const response = await fetch('http://localhost:3000/check-twitter', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username: formData.value.twitter,
      }),
    })

    const data = await response.json()
    isVerified.value = data.verified

    if (!data.verified) {
      error.value = 'Only verified Twitter users can create DNS records'
    }
  } catch (e) {
    error.value = 'Failed to verify Twitter status'
    isVerified.value = false
  } finally {
    checkingTwitter.value = false
  }
}

const handleSubmit = async () => {
  if (!isVerified.value) {
    error.value = 'Please verify your Twitter account first'
    return
  }

  isLoading.value = true
  error.value = ''
  success.value = false

  try {
    const response = await fetch('http://localhost:3000/create-dns', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        host: formData.value.host,
        value: formData.value.value,
        username: formData.value.twitter,
      }),
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error || 'Failed to create DNS record')
    }

    success.value = true
    formData.value = { host: '', value: '', twitter: '' }
    isVerified.value = false
  } catch (e) {
    error.value = e instanceof Error ? e.message : 'An error occurred'
  } finally {
    isLoading.value = false
  }
}
</script>

<template>
  <div class="form-container">
    <form @submit.prevent="handleSubmit">
      <div class="form-group">
        <label for="twitter">Twitter Username:</label>
        <div class="twitter-input">
          <input
            id="twitter"
            v-model="formData.twitter"
            type="text"
            placeholder="@username"
            required
          />
          <button
            type="button"
            @click="checkTwitterVerification"
            :disabled="checkingTwitter"
            class="verify-button"
          >
            {{ checkingTwitter ? 'Checking...' : 'Verify' }}
          </button>
        </div>
        <div v-if="isVerified" class="verified-badge">✓ Verified</div>
      </div>

      <div class="form-group">
        <label for="host">Subdomain:</label>
        <input
          id="host"
          v-model="formData.host"
          type="text"
          placeholder="your-handle"
          required
          :disabled="!isVerified"
        />
        <small class="help-text">Will create: _atproto.[subdomain].bluecheck.id</small>
      </div>

      <div class="form-group">
        <label for="value">DID Value:</label>
        <input
          id="value"
          v-model="formData.value"
          type="text"
          placeholder="did=did:plc:1234..."
          required
          :disabled="!isVerified"
        />
      </div>

      <button type="submit" :disabled="isLoading || !isVerified">
        {{ isLoading ? 'Creating...' : 'Create DNS Record' }}
      </button>

      <div v-if="error" class="error">
        {{ error }}
      </div>

      <div v-if="success" class="success">DNS record created successfully!</div>
    </form>
  </div>
</template>

<style scoped>
.form-container {
  max-width: 400px;
  margin: 2rem auto;
  padding: 1rem;
}

.form-group {
  margin-bottom: 1rem;
}

label {
  display: block;
  margin-bottom: 0.5rem;
  color: var(--color-text);
}

input {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid #ccc;
  border-radius: 4px;
  font-size: 1rem;
}

button {
  width: 100%;
  padding: 0.75rem;
  background-color: #4caf50;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 1rem;
  cursor: pointer;
}

button:hover:not(:disabled) {
  background-color: #45a049;
}

button:disabled {
  background-color: #cccccc;
  cursor: not-allowed;
}

input::placeholder {
  color: #999;
  opacity: 1; /* Firefox */
}

.error {
  margin-top: 1rem;
  padding: 0.5rem;
  color: #721c24;
  background-color: #f8d7da;
  border: 1px solid #f5c6cb;
  border-radius: 4px;
}

.success {
  margin-top: 1rem;
  padding: 0.5rem;
  color: #155724;
  background-color: #d4edda;
  border: 1px solid #c3e6cb;
  border-radius: 4px;
}

.help-text {
  display: block;
  margin-top: 0.25rem;
  font-size: 0.875rem;
  color: #666;
}

.twitter-input {
  display: flex;
  gap: 0.5rem;
}

.verify-button {
  width: auto;
  padding: 0.5rem 1rem;
  background-color: #1da1f2;
}

.verify-button:hover:not(:disabled) {
  background-color: #1a91da;
}

.verified-badge {
  color: #1da1f2;
  font-weight: bold;
  margin-top: 0.5rem;
}

input:disabled {
  background-color: #f5f5f5;
  cursor: not-allowed;
}
</style>
