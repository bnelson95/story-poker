<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue'
import { useRoute } from 'vue-router'

import SessionService from '@/services/SessionService'

const CONNECT = "connect"
const CREATE = "create"
const JOIN = "join"
const MESSAGE = "message"
const VOTE = "vote"
const SHOW_VOTES = "show_votes"
const CLEAR_VOTES = "clear_votes"

const route = useRoute()

onMounted(() => {

  SessionService.getSession({
    id: route.params.id
  })
    .then(res => {
      state.session = res.data.session
    })

  initWebsocket()

})

const initWebsocket = () => {
  const HOST = !location.origin.includes("localhost") ? location.origin.replace(/^http/, 'ws') : 'ws://localhost:3001/'
  state.ws = new WebSocket(HOST)
  state.ws.onmessage = (event) => {

    const response = JSON.parse(event.data)

    console.log(response)

    if (response.method === CONNECT) {
      state.clientId = response.clientId
    }

    if (response.method === CREATE) {
      state.session = response.session
    }

    if (response.method === JOIN) {
      state.session = response.session
    }

    if (response.method === MESSAGE) {
      state.session.messages.push(response)
    }

    if (response.method === VOTE) {
      state.session.clients.find((client: any) => client._id === response.client._id).vote = response.client.vote
    }

    if (response.method === SHOW_VOTES) {
      state.session.showVotes = true
    }

    if (response.method === CLEAR_VOTES) {
      state.session = response.session
    }
  }


}



function sendJson(ws: WebSocket, method: string, obj: any) {
  ws.send(JSON.stringify({ "method": method, ...obj }))
}



const createSession = () => {
  sendJson(state.ws, CREATE, {
    "sessionId": route.params.id,
    "clientId": state.clientId,
    "name": state.name,
    "options": state.options,
  })
}

const joinSession = () => {
  sendJson(state.ws, JOIN, {
    "sessionId": route.params.id,
    "clientId": state.clientId,
    "name": state.name,
  })
}

// const sendMessage = () => {
//   sendJson(state.ws, MESSAGE, {
//     "sessionId": state.session._id,
//     "clientId": state.clientId,
//     "message": newMessage.value,
//   })

//   newMessage.value = ""
// }

const vote = (vote: number) => {
  sendJson(state.ws, VOTE, {
    "sessionId": state.session._id,
    "clientId": state.clientId,
    "vote": vote
  })
}

const showVotes = () => {
  sendJson(state.ws, SHOW_VOTES, { "sessionId": state.session._id })
}

const clearVotes = () => {
  sendJson(state.ws, CLEAR_VOTES, { "sessionId": state.session._id })
}

const clientIds = computed(() => {
  if (!state.session.clients) return []
  const ids = state.session.clients.map((client: any) => client._id)
  console.log("Client IDs: " + ids)
  return ids
})

const isHost = computed(() => {
  return clientIds.value.length > 0 && state.clientId == clientIds.value[0]
})

const consensus = computed(() => {
  if (!state.session.clients) return false
  return state.session.showVotes && state.session.clients.every((c: any) => c.vote == state.session.clients[0].vote)
})

const state = reactive({
  ws: {} as WebSocket,
  clientId: "",
  formCreate: false,
  formJoin: false,
  name: "",
  options: "",
  session: {} as any,
  description: "",
})

</script>

<template>
  <div>
    <!-- Form for Create -->
    <div v-if="clientIds.length == 0">
      <h2 class="my-3">Create a new session...</h2>
      <form @submit.prevent="createSession">
        <div class="row">
          <div class="col-md">
            <div class="form-floating mb-3">
              <input v-model="state.name" type="text" class="form-control" id="nameInput" placeholder="Name" />
              <label for="nameInput">Your name</label>
            </div>
          </div>
          <div class="col-md">
            <div class="form-floating mb-3">
              <input v-model="state.options" type="text" class="form-control" id="optionsInput" placeholder="Options (comma separated)" />
              <label for="optionsInput">Vote Options (comma separated)</label>
            </div>
          </div>
        </div>
        <button class="btn btn-primary" :disabled="!state.name || !state.options">Join Session</button>
      </form>
    </div>
    <div v-else-if="!clientIds.includes(state.clientId)">
      <h2 class="mb-3">Join an existing session...</h2>
      <form @submit.prevent="joinSession">
        <div class="form-floating mb-3">
          <input v-model="state.name" type="text" class="form-control" id="nameInput" placeholder="Name" />
          <label for="nameInput">Name</label>
        </div>
        <button class="btn btn-primary" :disabled="!state.name">Join Session</button>
      </form>
    </div>

    <!-- Session -->
    <div v-if="state.session._id && clientIds.includes(state.clientId)" class="row">
      <div class="col-12">
        <h2 class="my-3">{{ state.name }}</h2>
        <div class="form-floating mb-3">
          <input v-model="state.description" type="text" class="form-control" id="descriptionInput" placeholder="Description" />
          <label for="descriptionInput">Task Description</label>
        </div>
      </div>

      <div class="col-md-8">
        <div v-if="isHost" class="btn-group mb-3 w-100">
          <button v-on:click="showVotes" type="button" class="btn btn-outline-secondary">Show Votes</button>
          <button v-on:click="clearVotes" type="button" class="btn btn-outline-secondary">Clear Votes</button>
        </div>
  
        <div class="btn-group mb-3 w-100">
          <button v-for="n in state.session.options" v-on:click="vote(n)" type="button" class="btn btn-outline-primary">
            {{ n }}
          </button>
        </div>
  
        <div class="mb-3">
          <table class="table m-0">
            <thead>
              <tr>
                <th scope="col">Name</th>
                <th scope="col">Vote</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="user in state.session.clients">
                <td>{{ user.name }}</td>
                <td>
                  <span v-if="user.vote">
                    {{ state.session.showVotes || state.clientId == user._id ? user.vote : '?' }}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div class="col-md-4 mb-3">
        <div class="border rounded bg-light p-1">
          <table class="table table-borderless m-0">
            <thead>
              <tr>
                <th>Statistics</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Time taken</td>
                <td>0</td>
              </tr>
              <tr>
                <td>Average score</td>
                <td>0</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

    </div>
  </div>
</template>
