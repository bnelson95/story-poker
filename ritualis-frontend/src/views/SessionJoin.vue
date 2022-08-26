<script setup lang="ts">
import { ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { storeToRefs } from 'pinia'

import { useSessionStore } from '@/stores/session'
import { useWebsocketStore } from '@/stores/websocket';

// Session Store
const { session, loading, error, clientIds, name, isHost, description } = storeToRefs(useSessionStore())
const { fetchSession } = useSessionStore()

// Websocket Store
const { clientId } = storeToRefs(useWebsocketStore())
const { initWebsocket, createSession, joinSession, updateDescription, vote, showVotes, clearVotes } = useWebsocketStore()

const route = useRoute()

fetchSession(route.params.id as string)
initWebsocket(route.params.id as string)

const inputName = ref('')
const inputOptions = ref('')
const inputDescription = ref('')

watch(description, async (newDescription, _) => {
  inputDescription.value = newDescription
})

</script>

<template>
  <div v-if="!loading">
    {{ error }}
    <!-- Form for Create -->
    <div v-if="clientIds.length == 0">
      <h2 class="my-3">Create a new session...</h2>
      <form @submit.prevent="createSession(route.params.id as string, inputName, inputOptions)">
        <div class="row">
          <div class="col-md">
            <div class="form-floating mb-3">
              <input v-model="inputName" type="text" class="form-control" id="nameInput" placeholder="Name" />
              <label for="nameInput">Your name</label>
            </div>
          </div>
          <div class="col-md">
            <div class="form-floating mb-3">
              <input v-model="inputOptions" type="text" class="form-control" id="optionsInput"
                placeholder="Options (comma separated)" />
              <label for="optionsInput">Vote Options (comma separated)</label>
            </div>
          </div>
        </div>
        <button class="btn btn-primary" :disabled="!inputName || !inputOptions">Join Session</button>
      </form>
    </div>
    <div v-else-if="!clientIds.includes(clientId)">
      <h2 class="mb-3">Join an existing session...</h2>
      <form @submit.prevent="joinSession(route.params.id as string, inputName)">
        <div class="form-floating mb-3">
          <input v-model="inputName" type="text" class="form-control" id="nameInput" placeholder="Name" />
          <label for="nameInput">Name</label>
        </div>
        <button class="btn btn-primary" :disabled="!inputName">Join Session</button>
      </form>
    </div>

    <!-- Session -->
    <div v-if="session._id && clientIds.includes(clientId)" class="row">
      <div class="col-12">
        <h2 class="my-3">{{ name }}</h2>
        <div class="form-floating mb-3">
          <input v-model="inputDescription" type="text" class="form-control" id="descriptionInput"
            placeholder="Description" v-on:focusout="updateDescription(route.params.id as string, inputDescription)" />
          <label for="descriptionInput">Task Description</label>
        </div>
      </div>

      <div class="col-md-8">
        <div v-if="isHost" class="btn-group mb-3 w-100">
          <button v-on:click="showVotes(route.params.id as string)" type="button" class="btn btn-outline-secondary">Show Votes</button>
          <button v-on:click="clearVotes(route.params.id as string)" type="button" class="btn btn-outline-secondary">Clear Votes</button>
        </div>

        <div class="btn-group mb-3 w-100">
          <button v-for="n in session.options" v-on:click="vote(route.params.id as string, n)" type="button" class="btn btn-outline-primary">
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
              <tr v-for="user in session.clients">
                <td>{{ user.name }}</td>
                <td>
                  <span v-if="user.vote">
                    {{ session.showVotes || clientId == user._id ? user.vote : '?' }}
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
