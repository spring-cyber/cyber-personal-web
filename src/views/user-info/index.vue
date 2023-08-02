<template>
  <c-page-label title="用户信息" icon="cyber-zhanghuxinxi" document-link="javascript:;">
    <template #tips>提供用户的信息管理，包含查看、变更用户信息，操作历史等。</template>
  </c-page-label>
  
  <c-radio-wrapper v-model:value="queryState.status" @change="methods.changeRadio">
    <c-radio-button value="0">基本信息</c-radio-button>
    <c-radio-button value="1">登录日志</c-radio-button>
  </c-radio-wrapper>

  <BasicInfo type="user" isPersonal v-if="queryState.status == '0'"></BasicInfo>
  <EntryLog v-if="queryState.status == '1'"></EntryLog>

</template>

<script setup>
import { changeHistoryState, initHistoryState } from 'cyber-web-ui';
import EntryLog from './modules/EntryLog.vue';
import BasicInfo from './modules/BasicInfo.vue';
// 表格请求参数
const queryState = reactive({
  ...initHistoryState({
    status: '0',
  }),
});

const methods = {
  changeRadio() {
    changeHistoryState(queryState);
  },
}
</script>

