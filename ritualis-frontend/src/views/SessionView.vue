<script setup lang="ts">

import { ref, reactive, onMounted } from 'vue'
import { useRoute } from 'vue-router'

import SessionService from '@/services/SessionService'
import router from '@/router';

const createSession = async () => {
  const res = await SessionService.createSession({})
  router.push({ name: 'session', params: { id: res.data.sessionId }})
}

const joinSession = () => {
  router.push({ name: 'session', params: { id: inputSessionId.value }})
}

// const displayMessageName = (state: any, index: number) => {
//   if (index === 0) return true
//   const thisName = state.session.clients[state.session.messages[index].clientId].name
//   const prevName = state.session.clients[state.session.messages[index - 1].clientId].name
//   return thisName !== prevName
// }

// let newMessage = ref('')
let inputSessionId = ref('')

const state = reactive({
  ws: {} as WebSocket,
  clientId: "",
  name: "",
  options: "",
  session: {} as any
})

</script>

<template>

  <!-- Create or Join -->
  <div class="row my-3">
    <div class="col-md border rounded p-3">
      <h3>Create a session...</h3>
      <div class="mt-3 input-group">
        <button class="btn btn-primary w-100" v-on:click="createSession">Create</button>
      </div>
    </div>
    <div class="col-auto align-self-center">
      <h4>OR</h4>
    </div>
    <div class="col-md border rounded p-3">
      <h3>Join a session...</h3>
      <div class="mt-3 input-group">
        <input v-model="inputSessionId" type="text" class="form-control" id="sessionIdInput" placeholder="Session ID" />
        <button class="btn btn-primary" v-on:click="joinSession">Join</button>
      </div>
    </div>
  </div>

</template>
