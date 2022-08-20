import mongoose from 'mongoose'

const ClientSchema = new mongoose.Schema({
  _id: {
    type: String,
  },
  name: {
    type: String,
    required: true
  },
  vote: {
    type: Number,
  }
}, { _id: false })

const SessionSchema = new mongoose.Schema({
  _id: {
    type: String,
  },
  clients: [{
    type: ClientSchema,
  }],
  host: {
    type: String,
  },
  options: [{
    type: String
  }],
  showVotes: {
    type: Boolean,
  }
}, { _id: false })

export default mongoose.model('session', SessionSchema)
