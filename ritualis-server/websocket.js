import { WebSocketServer } from 'ws'

import Session from './models/sessions/session.js'

const clients = {}

const CONNECT = "connect"
const CREATE = "create"
const JOIN = "join"
const MESSAGE = "message"
const VOTE = "vote"
const SHOW_VOTES = "show_votes"
const CLEAR_VOTES = "clear_votes"

const FN_MAP = {
    [CREATE]:      init_session,
    [JOIN]:        join_session,
    [MESSAGE]:     handle_message,
    [VOTE]:        vote,
    [SHOW_VOTES]:  showVotes,
    [CLEAR_VOTES]: clearVotes,
}

function sendJson(ws, method, obj) {
    // Send JSON to a client.
    ws.send(JSON.stringify({ "method": method, ...obj }))
}

function broadcastJson(clients, session, method, obj) {
    // Broadcast means Send to all clients of a given session.
    session.clients.forEach(client => {
        if (client._id in clients) {
            sendJson(clients[client._id], method, obj)
        } else {
            // Somehow the session still has a client that's not in the clients map
        }
    })
}

async function init_session(result, clients) {
    const session = await Session.findById(result.sessionId)

    session.clients.push({
        "_id": result.clientId,
        "name": result.name,
        "vote": 0,
    })
    session.options = result.options.split(',')

    session.save()

    sendJson(clients[result.clientId], CREATE, { session })
}

async function join_session(result, clients) {
    const session = await Session.findById(result.sessionId)

    const client = session.clients.find(client => client._id === result.originalClientId ?? '')
    if (client) {
        // Remove old client from the session
        client._id = result.clientId
        // Remove old client from the clientId -> websocket map
        if (result.originalClientId in clients) {
            clients[result.originalClientId].close()
            delete clients[result.originalClientId]
        }
    } else {
        session.clients.push({
            "_id": result.clientId,
            "name": result.name,
            "vote": 0,
        })
    }

    session.save()

    // TODO maybe just send the new client instead of the whole session?
    broadcastJson(clients, session, JOIN, { session })
}

async function handle_message(result, clients) {
    const session = await Session.findById(result.sessionId)
    const message = {
        "clientId": result.clientId,
        "message": result.message,
        "timestamp": Date.now(),
    }

    session.messages.push(message)

    session.save()

    broadcastJson(clients, session, MESSAGE, message)
}

async function vote(result, clients) {
    const session = await Session.findById(result.sessionId)
    const client = session.clients.find(client => client._id === result.clientId)
    client.vote = result.vote
    session.save()

    broadcastJson(clients, session, VOTE, { client })
}

async function showVotes(result, clients) {
    const session = await Session.findById(result.sessionId)
    session.showVotes = true
    session.save()

    broadcastJson(clients, session, SHOW_VOTES, {})
}

async function clearVotes(result, clients) {
    const session = await Session.findById(result.sessionId)
    session.clients.forEach(client => { client.vote = 0 })
    session.showVotes = false
    session.save()
    
    broadcastJson(clients, session, CLEAR_VOTES, { "session": session })
}

function createClient(ws, clients) {
    const newClientId = (Math.random() + 1).toString(36).substring(7)
    clients[newClientId] = ws
    sendJson(ws, CONNECT, { "clientId": newClientId })
}

function onOpen() {
    console.debug("opened!")
}

function onClose() {
    console.debug("closed!")
}

async function onMessage(message) {
    const result = JSON.parse(message) 
    console.debug(result)

    if (result.method in FN_MAP) {
        await FN_MAP[result.method](result, clients)
    } else {
        console.error("Method not implemented")
    }
}

function initWebsocketServer(server) {
    
    const wss = new WebSocketServer({ server })
    
    wss.on("connection", (ws) => {
        
        console.debug("Websocket connected!")

        createClient(ws, clients)

        ws.on("open", onOpen)
        ws.on("close", onClose)
        ws.on("message", onMessage)
    })

    return wss
}

export { initWebsocketServer }
