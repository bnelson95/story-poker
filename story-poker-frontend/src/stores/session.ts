import { defineStore } from "pinia"

import { useWebsocketStore } from "@/stores/websocket"
import SessionService from "@/services/SessionService"

export const useSessionStore = defineStore({
  id: "session",
  state: () => ({
    session: null as any,
    loading: false as boolean,
    error: null as any
  }),
  getters: {
    clientIds(state) {
      if (!state.session.clients) return []
      const ids = state.session.clients.map((client: any) => client._id)
      console.log("Client IDs: " + ids)
      return ids
    },
    client(state) {
      if (!state.session.clients) return null
      const wsStore = useWebsocketStore()
      const client = state.session.clients.find((client: any) => client._id === wsStore.clientId)
      return client
    },
    name(state): string {
      const client = this.client
      return client ? client.name : ''
    },
    myVote(state): string {
      const client = this.client
      return client ? client.vote : ''
    },
    description(state): string {
      if (!state.session) return ''
      return state.session.description
    },
    isHost(state): boolean {
      const wsStore = useWebsocketStore()
      return state.session && state.session.clients.length > 0 && wsStore.clientId == state.session.clients[0]._id
    },
    consensus(state): boolean {
      if (!state.session.clients) return false
      return state.session.showVotes && state.session.clients.every((c: any) => c.vote == state.session.clients[0].vote)
    }
  },
  actions: {
    async fetchSession(id: string) {
      this.session = null
      this.loading = true
      try {
        this.session = await SessionService.getSession({ id })
        .then(res => res.data.session)
      } catch (error) {
        this.error = error
      } finally {
        this.loading = false
      }
    }
  },
});
