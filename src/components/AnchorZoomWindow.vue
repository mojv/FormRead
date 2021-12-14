<template>
  <div class="absolute flex items-center justify-center  w-full h-full">
    <img class="w-32 h-32 rounded-full border-gray-200 border-4 shadow-2xl" :src="src" alt="user image" />
  </div>
</template>

<script>
export default {
  props: {
    src: String
  }
}
</script>