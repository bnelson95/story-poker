import axios from 'axios'

export default () => {
  axios.defaults.withCredentials = true
  return axios.create({
    baseURL: 'http://localhost:3000/api', // TODO make this an env var?
    headers: {
      // 'Access-Control-Allow-Origin': '*',
      // 'Access-Control-Allow-Credentials': true,
      // 'Access-Control-Allow-Methods': 'GET,PUT,POST,DELETE'
    }
  })
}