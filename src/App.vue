<template>
  <c-config-provider>
    <router-view v-if="state.isRouterAlive"></router-view>
  </c-config-provider>
</template>

<script setup>
import { maintainStore } from '@/store';

const $useRoute = useRoute();
const state = reactive({
  isRouterAlive: true,
  // 独立页面，没有layouts
  independent: computed(() => {
    return $useRoute.meta.independent;
  }),
});

const methods = {
  init() {},
  reload() {
    state.isRouterAlive = false;
    nextTick(() => {
      state.isRouterAlive = true;
    });
  },
  listerPopstate() {
    // 拦截reload
    if(!maintainStore().reloadIntercept) {
      methods.reload();
    }
  },
};

provide("reload", methods.reload);
onMounted(() => {
  // 监听浏览器历史记录变化
  window.addEventListener('popstate', methods.listerPopstate);
});
onUnmounted(() => {
  window.removeEventListeer('popstate', methods.listerPopstate);
});
</script>

<style lang="less">
</style>
