<template>
    <img  class="w-48 lazy loaded" alt="Logo" data-ll-status="loaded"
          src="/img/logo.png">
</template>

<script>
    import { defineComponent } from 'vue'
    import { Link } from '@inertiajs/inertia-vue3';

    export default defineComponent({
        components: {
            Link,
        },
    })
</script>
