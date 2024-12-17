<script setup lang="ts">
import { ref } from 'vue'

const formData = ref({
  host: '',
  type: '',
  value: '',
})

const handleSubmit = () => {
  console.log('Form submitted:', formData.value)
  // Here you can add your submission logic
}
</script>

<template>
  <div class="form-container">
    <form @submit.prevent="handleSubmit">
      <div class="form-group">
        <label for="host">Host:</label>
        <input id="host" v-model="formData.host" type="text" placeholder="_atproto" required />
      </div>

      <div class="form-group">
        <label for="type">Type:</label>
        <input id="type" v-model="formData.type" type="text" placeholder="TXT" required />
      </div>

      <div class="form-group">
        <label for="value">Value:</label>
        <input id="value" v-model="formData.value" type="text" required />
      </div>

      <button type="submit">Submit</button>
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

button:hover {
  background-color: #45a049;
}

input::placeholder {
  color: #999;
  opacity: 1; /* Firefox */
}
</style>
