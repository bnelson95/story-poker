import express from 'express'

import Session from '../../../models/sessions/session.js'

const router = express.Router()

function S4() {
  return (((1+Math.random())*0x10000)|0).toString(16).substring(1); 
}
function guid() {
  return (S4() + S4() + "-" + S4() + "-4" + S4().substr(0,3) + "-" + S4() + "-" + S4() + S4() + S4()).toLowerCase()
}

router.post('/', async (req, res) => {
  const session = {
    _id: guid(),
  }
  new Session(session).save()
    .then(session => res.status(200).send({ "sessionId": session.id }))
    .catch(err => {
      console.log(err)
      res.status(500).send(err)
    })
})

router.get('/:id', async (req, res) => {
  await Session.findById(req.params.id)
    .then(session => res.status(200).send({ session }))
    .catch(err => res.status(500).send(err))
})

export default router