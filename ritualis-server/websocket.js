import { WebSocketServer } from 'ws'

import Session from './models/sessions/session.js'


const CONNECT = "connect"
const CREATE = "create"
const JOIN = "join"
const MESSAGE = "message"
const VOTE = "vote"
const SHOW_VOTES = "show_votes"
const CLEAR_VOTES = "clear_votes"

function sendJson(ws, method, obj) {
    // Send JSON to a client.
    ws.send(JSON.stringify({ "method": method, ...obj }))
}

function broadcastJson(clients, session, method, obj) {
    // Broadcast means Send to all clients of a given session.
    session.clients.forEach(client => {
        sendJson(clients[client._id].ws, method, obj)
    })
}

// TODO use built in guid/hash function
function S4() {
    return (((1+Math.random())*0x10000)|0).toString(16).substring(1); 
}
function guid() {
    return (S4() + S4() + "-" + S4() + "-4" + S4().substr(0,3) + "-" + S4() + "-" + S4() + S4() + S4()).toLowerCase()
}

function initWebsocketServer(port) {

    const clients = {}
    // TODO eventually store the sessions in DB instead of memory
    // const sessions = {}
    
    const wss = new WebSocketServer({ port: port })
    
    wss.on("connection", (ws) => {
        
        console.log("Websocket connected!")

        ws.on("open", () => console.log("opened!"))
        ws.on("close", () => console.log("closed!"))

        ws.on("message", async (message) => {
            
            const result = JSON.parse(message)
            
            console.log(result)
            
            if (result.method === CREATE) {
                const session = await Session.findById(result.sessionId)

                session.clients.push({
                    "_id": result.clientId,
                    "name": result.name,
                    "vote": 0,
                })
                session.options = result.options.split(',')

                session.save()

                sendJson(clients[result.clientId].ws, CREATE, { session })
            }
            
            if (result.method === JOIN) {
                const session = await Session.findById(result.sessionId)
                
                session.clients.push({
                    "_id": result.clientId,
                    "name": result.name,
                    "vote": 0,
                })

                session.save()

                // TODO maybe just send the new client instead of the whole session?
                broadcastJson(clients, session, JOIN, { session })
            }
            
            if (result.method === MESSAGE) {
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

            if (result.method === VOTE) {
                const session = await Session.findById(result.sessionId)
                const client = session.clients.find(client => client._id === result.clientId)
                client.vote = result.vote

                session.save()

                broadcastJson(clients, session, VOTE, { client })
            }

            if (result.method === SHOW_VOTES) {
                const session = await Session.findById(result.sessionId)
                session.showVotes = true

                session.save()

                broadcastJson(clients, session, SHOW_VOTES, {})
            }

            if (result.method === CLEAR_VOTES) {
                const session = await Session.findById(result.sessionId)
                session.clients.forEach(client => {
                    client.vote = 0
                })
                session.showVotes = false

                session.save()
                
                broadcastJson(clients, session, CLEAR_VOTES, { "session": session })
            }
        })
        
        // Generate a new client id and send back the client "connect" event.
        const newClientId = guid();
        clients[newClientId] = { ws }
        sendJson(ws, CONNECT, { "clientId": newClientId })
        
    })

    console.log(`Websocket listening at http://localhost:${port}`)

    return wss
}

export { initWebsocketServer }
