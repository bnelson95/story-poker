import { defineStore } from "pinia";

import router from '@/router';
import { useSessionStore } from "@/stores/session";

const CONNECT = "connect"
const CREATE = "create"
const JOIN = "join"
const UPDATE_DESCRIPTION = "update_description"
const MESSAGE = "message"
const VOTE = "vote"
const SHOW_VOTES = "show_votes"
const CLEAR_VOTES = "clear_votes"

export const useWebsocketStore = defineStore({
  id: "websocket",
  state: () => ({
    clientId: '' as string,
    ws: null as unknown as WebSocket,
  }),
  getters: {

  },
  actions: {
    initWebsocket(sessionId: string) {
      const ws = new WebSocket(location.origin.replace(/^http/, 'ws') + '/ws')
      ws.onclose = (e: any) => {
        console.log('Socket is closed.', e.reason)
        if (localStorage.sessionId === sessionId && localStorage.originalClientId === this.clientId) {
          console.log('Reconnect will be attempted becuase you still have the same client ID.')
          this.initWebsocket(sessionId)
        } else {
          console.log('Pushing you back to home page becuase your browser joined with a differnt client ID.')
          router.push({ name: 'session-init' })
        }
      }
      ws.onmessage = (event: any) => {
        const response = JSON.parse(event.data)
        console.log(response)
        if (response.method === CONNECT) {
          this.onConnect(response, sessionId)
        } else {
          const FN_MAP: any = {
            [CREATE]:             this.onCreate,
            [JOIN]:               this.onJoin,
            [UPDATE_DESCRIPTION]: this.onUpdateDescription,
            [MESSAGE]:            this.onMessage,
            [VOTE]:               this.onVote,
            [SHOW_VOTES]:         this.onShowVotes,
            [CLEAR_VOTES]:        this.onClearVotes,
          }
          FN_MAP[response.method](response)
        }
      }
      this.ws = ws
    },
    onConnect(response: any, sessionId: string) {
      this.clientId = response.clientId
      // if the original client ID has already been set and this is the same session, then auto-join
      if (localStorage.originalClientId && localStorage.sessionId == sessionId && localStorage.name) {
        this.joinSession(sessionId, localStorage.name)
      }
    },
    onCreate(response: any) {
      useSessionStore().session = response.session
      localStorage.originalClientId = this.clientId
    },
    onJoin(response: any) {
      useSessionStore().session = response.session
      localStorage.originalClientId = this.clientId
    },
    onUpdateDescription(response: any) {
      useSessionStore().session.description = response.description
    },
    onMessage(response: any) {
      useSessionStore().session.messages.push(response)
    },
    onVote(response: any) {
      useSessionStore().session = response.session
    },
    onShowVotes(response: any) {
      useSessionStore().session.showVotes = true
    },
    onClearVotes(response: any) {
      useSessionStore().session = response.session
    },
    createSession(sessionId: string, name: string, options: string) {
      this.sendJson(this.ws, CREATE, sessionId, {
        "clientId": this.clientId,
        "name": name,
        "options": options,
      })
    
      localStorage.sessionId = sessionId
      localStorage.name = name
    },
    joinSession(sessionId: string, name: string) {
      this.sendJson(this.ws, JOIN, sessionId, {
        "clientId": this.clientId,
        "name": name,
        ...(localStorage.sessionId == sessionId && { "originalClientId": localStorage.originalClientId })
      })
    
      localStorage.sessionId = sessionId
      localStorage.name = name
    },
    updateDescription(sessionId: string, description: string) {
      this.sendJson(this.ws, UPDATE_DESCRIPTION, sessionId, {
        "description": description
      })
    },
    vote(sessionId: string, vote: number) {
      this.sendJson(this.ws, VOTE, sessionId, {
        "clientId": this.clientId,
        "vote": vote
      })
    },
    showVotes(sessionId: string) {
      this.sendJson(this.ws, SHOW_VOTES, sessionId, {})
    },
    clearVotes(sessionId: string) {
      this.sendJson(this.ws, CLEAR_VOTES, sessionId, {})
    },
    sendJson(ws: WebSocket, method: string, sessionId: string, obj: any) {
      console.log(method)
      if (ws.readyState === ws.OPEN) {
        ws.send(JSON.stringify({ method, sessionId, ...obj }))
      }
    }
  }
})