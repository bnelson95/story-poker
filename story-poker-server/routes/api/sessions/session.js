import express from 'express'

import Session from '../../../models/sessions/session.js'

const router = express.Router()

router.post('/', async (req, res) => {
  const session = {
    _id: (Math.random() + 1).toString(36).substring(7),
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