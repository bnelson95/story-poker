<script setup lang="ts">
import { ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { storeToRefs } from 'pinia'
import ConfettiExplosion from "vue-confetti-explosion"

import { useSessionStore } from '@/stores/session'
import { useWebsocketStore } from '@/stores/websocket';

// Session Store
const { session, loading, error, clientIds, consensus, myVote, description } = storeToRefs(useSessionStore())
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

watch(inputDescription, async (newDescription, oldDescription) => {
  // Send immediately if more than one character changes at once
  // (i.e. a longer value was pasted, or the whole value was erased)
  if (oldDescription && Math.abs(newDescription.length - oldDescription.length) >= 2) {
    updateDescription(route.params.id as string, newDescription)
  }
})

</script>

<template>
  <div v-if="!loading">
    {{ error }}
    <!-- Form for Create -->
    <div class="row justify-content-center">
      <div v-if="clientIds.length == 0" class="col-lg-6 col-md-8 col-12">
        <h2 class="my-4">Create a new session...</h2>
        <form @submit.prevent="createSession(route.params.id as string, inputName, inputOptions)">
          <div class="form-floating mb-4">
            <input v-model="inputName" type="text" class="form-control" id="nameInput" placeholder="Name" />
            <label for="nameInput">Your name</label>
          </div>
          <div class="form-floating mb-4">
            <input v-model="inputOptions" type="text" class="form-control" id="optionsInput"
              placeholder="Options (comma separated)" />
            <label for="optionsInput">Vote Options (comma separated)</label>
          </div>
          <button class="btn btn-primary" :disabled="!inputName || !inputOptions">Join Session</button>
        </form>
      </div>
      <div v-else-if="!clientIds.includes(clientId)">
        <h2 class="my-4">Join an existing session...</h2>
        <form @submit.prevent="joinSession(route.params.id as string, inputName)">
          <div class="form-floating mb-4">
            <input v-model="inputName" type="text" class="form-control" id="nameInput" placeholder="Name" />
            <label for="nameInput">Name</label>
          </div>
          <button class="btn btn-primary" :disabled="!inputName">Join Session</button>
        </form>
      </div>
    </div>

    <!-- Session -->
    <div v-if="session._id && clientIds.includes(clientId)">
      <!-- Description -->
      <div class="row my-4">
        <div class="col-12">
          <div class="form-floating">
            <input v-model="inputDescription" type="text" class="border-0 bg-light form-control" id="descriptionInput"
              placeholder="Description" v-on:focusout="updateDescription(route.params.id as string, inputDescription.value)" />
            <label for="descriptionInput">Task Description</label>
          </div>
        </div>
      </div>
      <!-- Vote Options -->
      <div class="row pb-4 g-4 justify-content-center rounded">
        <div v-for="n in session.options" class="col-lg-2 col-md-3 col-4">
          <button v-on:click="vote(route.params.id as string, n)" type="button"
            class="btn btn-lg btn-primary w-100 py-3"
            :class="{'active': myVote == n}">
            {{ n }}
          </button>
        </div>
      </div>
      <!-- Host Controls -->
      <div class="row mb-4 g-4 justify-content-center">
        <div class="col-lg-3 col-md-4 col-6">
          <button v-on:click="showVotes(route.params.id as string)"
            type="button" class="btn btn-secondary w-100">Show Votes</button>
        </div>
        <div class="col-lg-3 col-md-4 col-6">
          <button v-on:click="clearVotes(route.params.id as string)"
            type="button" class="btn btn-secondary w-100">Clear Votes</button>
        </div>
      </div>
      <!-- Confetti -->
      <div class="row justify-content-center">
        <div class="col-1">
          <ConfettiExplosion v-if="consensus" />
        </div>
      </div>
      <!-- Members -->
      <div class="row pb-3 px-2 g-4 justify-content-center rounded">
        <div v-for="user in session.clients" class="col-lg-2 col-md-3 col-4">
          <div class="p-3 text-center h-100 bg-light">
            <h6>{{ user.name }}</h6>
            <h4>
              <span v-if="user.vote">
                {{ session.showVotes || clientId == user._id ? user.vote : '✓' }}
              </span>
              <span v-else>
                –
              </span>
            </h4>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
