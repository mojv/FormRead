<template>
  <nav v-if="!$page.props.isAPI"  class="relative flex flex-wrap items-center justify-between px-2 py-3 bg-gray-100 shadow">
    <div class="container px-4 mx-auto flex flex-wrap items-center justify-between">
      <div class="w-full relative flex justify-between lg:w-auto  px-4 lg:static lg:block lg:justify-start">
<!--          <jet-application-logo class="block h-8 w-auto" />-->
        <button class="text-black cursor-pointer text-xl leading-none px-3 py-1 border border-solid border-transparent rounded bg-transparent block lg:hidden outline-none focus:outline-none" type="button" v-on:click="toggleNavbar()">
          <i class="fas fa-bars"></i>
        </button>
      </div>
<!--      <div v-bind:class="{'hidden': !showMenu, 'flex': showMenu}" class="lg:flex lg:flex-grow items-center">-->
<!--          <div v-if="$page.props.canLogin" class="hidden fixed top-0 right-0 px-6 py-4 sm:block">-->
<!--              <Link v-if="$page.props.user" :href="route('dashboard')" class="text-sm text-gray-700 underline">-->
<!--                  Dashboard-->
<!--              </Link>-->

<!--              <template v-else>-->
<!--                  <Link :href="route('login')" class="text-sm text-gray-700 underline">-->
<!--                      Log in-->
<!--                  </Link>-->

<!--                  <Link v-if="$page.props.canRegister" :href="route('register')" class="ml-4 text-sm text-gray-700 underline">-->
<!--                      Register-->
<!--                  </Link>-->
<!--              </template>-->
<!--          </div>-->
<!--      </div>-->
    </div>
  </nav>
</template>

<script>
// import { Link } from '@inertiajs/inertia-vue3';
// import JetApplicationLogo from '@/Jetstream/ApplicationLogo.vue'

export default {
  name: "AppHeader",
  components: {
    // Link,
    // JetApplicationLogo
  },
  data() {
    return {
      showMenu: false
    }
  },
  methods: {
    toggleNavbar: function(){
      this.showMenu = !this.showMenu;
    }
  }
}
</script>
