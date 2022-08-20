import Api from '@/services/Api'

export default {

  createSession (params: any) {
    return Api().post('session', params)
  },

  getSession (params: any) {
    return Api().get('session/' + params.id, params)
  },

}