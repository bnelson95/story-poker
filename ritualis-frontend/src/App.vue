<script setup lang="ts">

import { RouterLink, RouterView } from "vue-router";
// import HelloWorld from "./components/HelloWorld.vue";
// import UserService from '@/services/UserService'

// const callback = (response: any) => {
//   // This callback will be triggered when the user selects or login to
//   // his Google account from the popup
//   UserService
//     .loginUserGoogle({
//       'credential': response.credential
//     })
//     .then(response => {
//       console.log("Google Login Verified by Backend")
//       UserService
//         .getProfile()
//         .then(res => {
//           console.log(res.data.profile)
//           state.name = res.data.profile.name
//           state.email = res.data.profile.email
//         })
//     })
// }

</script>

<template>
  <div>
    <nav class="navbar navbar-expand-lg navbar-light bg-light">
      <div class="container-sm">
        <a class="navbar-brand" href="#">Story Poker</a>
        <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
          <span class="navbar-toggler-icon"></span>
        </button>
        <div class="collapse navbar-collapse" id="navbarSupportedContent">
          <ul class="navbar-nav me-auto mb-2 mb-lg-0">
            <li class="nav-item">
              <RouterLink class="nav-link" to="/">Home</RouterLink>
            </li>
            <li class="nav-item">
              <RouterLink class="nav-link" to="/session">Session</RouterLink>  
            </li>
          </ul>
        </div>
      </div>
    </nav>
    <div class="container-sm">
      <RouterView />
    </div>
  </div>
</template>

<style scoped>
</style>
