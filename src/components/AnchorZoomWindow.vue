<template>
  <div class="absolute flex items-center justify-center  w-full h-full">
    <div class="w-32 h-32 z-10 top-0.5">
      <img class="rounded-full border border-gray-100 shadow-sm" :src="src" alt="user image" />
    </div>
  </div>

</template>

<script>
export default {
  props: {
    src: String
  }
}
</script>