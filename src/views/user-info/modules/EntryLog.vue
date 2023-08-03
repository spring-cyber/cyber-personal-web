<template>
  <c-table-wrapper
    rowKey="id"
    ref="tableRef"
    v-model:loading="tableState.loading"
    :columns="tableState.columns"
    :action="false"
    @search="methods.searchQuery"
  >
    <template #collapse>
      <a-input
        v-model:value="queryState.userName"
        placeholder="请输入用户账号..."
        style="width: 200px"
        @keydown.enter="methods.searchQuery()"
      >
        <template #suffix><c-icon icon="cyber-sousuo" size="16" color="#BDBDBD" /></template>
      </a-input>
      <a-range-picker
        v-model:value="queryState.time"
        show-time
        :allowClear="false"
        format="YYYY-MM-DD HH:mm:ss"
        valueFormat="YYYY-MM-DD HH:mm:ss"
        @change="methods.searchQuery"
      />
    </template>
    <template #bodyCell="{ column, record }">
      <template v-if="column.key == 'accessTime'">
        <c-cell icon="cyber-shijian" :title="record.accessTime" />
      </template>
      <template v-if="column.key == 'status'">
        <c-cell-dict :options="OPERATION_RESULT_STATUS" :value="record.status" />
      </template>
    </template>
  </c-table-wrapper>
</template>

<script setup>
import dayjs from 'dayjs';
import { changeHistoryState, initHistoryState, useDict } from 'cyber-web-ui';
const { OPERATION_RESULT_STATUS } = useDict({ COMMON: ['OPERATION_RESULT_STATUS'] });
const tableRef = ref(); // 表格ref
// 表格请求参数
const queryState = reactive({
  ...initHistoryState({
    userName: undefined,
    time: [dayjs().format('YYYY-MM-DD') + ' 00:00:00', dayjs().format('YYYY-MM-DD') + ' 23:59:59'],
  }),
});
// 表格信息
const tableState = reactive({
  loading: false,
  columns: [
    { title: '时间', key: "accessTime", width: '200px' },
    { title: '登录账号', dataIndex: "userName", width: '14%', ellipsis: true },
    { title: 'IP 地址', dataIndex: "ipaddr", width: '14%' },
    { title: '访问地点', dataIndex: "loginLocation", ellipsis: true },
    { title: '客户端', dataIndex: "client", ellipsis: true, customRender: ({ record }) => `${record.browser || '-'} | ${record.os || '-'}` },
    { title: '操作信息', dataIndex: "msg", width: '180px', ellipsis: true },
    { title: '操作结果', key: "status", width: '140px' },
  ],
});

const methods = {
  // 搜索表格
  searchQuery() {
    changeHistoryState(queryState);
    unref(tableRef).searchQuery({
      url: '/personal/user/logininfor/search',
      method: 'get',
      params: {
        ...queryState,
        time: undefined,
        startDate: queryState.time?.[0],
        endDate: queryState.time?.[1],
        sortBy: 'access_time',
        sortType: 'desc',
      },
    });
  },
};

onMounted(() => {
  methods.searchQuery();
});
</script>

<style lang="less" scoped>
</style>
