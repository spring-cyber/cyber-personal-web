<template>
  <div>
    <c-page-label title="操作轨迹" icon="cyber-caozuoguiji" document-link="#操作轨迹">
      <template #tips>维护操作轨迹相关信息。</template>
    </c-page-label>

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
          v-model:value="queryState.productCode"
          placeholder="请输入应用名称..."
          style="width: 200px"
          @keydown.enter="methods.searchQuery()"
        >
          <template #suffix><c-icon icon="cyber-sousuo" size="16" color="#BDBDBD" /></template>
        </a-input>
        <c-select
          width="168"
          allowClear
          placeholder="请选择操作结果"
          v-model:value="queryState.status"
          :options="OPERATION_RESULT_STATUS"
          @change="methods.searchQuery()"
        ></c-select>
        <a-range-picker
          v-model:value="queryState.time"
          show-time
          format="YYYY-MM-DD HH:mm:ss"
          valueFormat="YYYY-MM-DD HH:mm:ss"
          @change="methods.searchQuery()"
        />
      </template>
      <template #bodyCell="{ column, record }">
        <template v-if="column.key == 'operTime'">
          <c-cell icon="cyber-shijian" :title="record.operTime" />
        </template>
        <template v-if="column.key == 'status'">
          <c-cell-dict :options="OPERATION_RESULT_STATUS" :value="record.status" />
        </template>
      </template>
    </c-table-wrapper>
  </div>
</template>

<script setup>
import dayjs from 'dayjs';
import { changeHistoryState, initHistoryState, useDict } from 'cyber-web-ui';
const { OPERATION_RESULT_STATUS } = useDict({ COMMON: ['OPERATION_RESULT_STATUS'] });
const tableRef = ref(); // 表格ref
// 表格请求参数
const queryState = reactive({
  ...initHistoryState({
    status: undefined,
    productCode: undefined,
    time: [dayjs().format('YYYY-MM-DD') + ' 00:00:00', dayjs().format('YYYY-MM-DD') + ' 23:59:59'],
  }),
});
// 表格信息
const tableState = reactive({
  loading: false,
  columns: [
    { title: '时间', key: "operTime", width: '200px' },
    { title: '用户账号', dataIndex: "operName", width: '12%', ellipsis: true },
    { title: '应用名称', dataIndex: "productCode", width: '12%', ellipsis: true },
    { title: '功能名称', dataIndex: "title", width: '10%', ellipsis: true },
    { title: 'IP 地址', dataIndex: "operIp", width: '10%' },
    { title: '访问地点', dataIndex: "operLocation", ellipsis: true },
    { title: '客户端', dataIndex: "client", ellipsis: true, customRender: ({ record }) => `${record.browser || '-'} | ${record.os || '-'}` },
    { title: '消耗时间', dataIndex: "costTime", width: '120px', customRender: ({ text }) => text ? text + 'ms' : '-' },
    { title: '操作结果', key: "status", width: '120px' },
  ],
});

const methods = {
  // 搜索表格
  searchQuery() {
    changeHistoryState(queryState);
    unref(tableRef).searchQuery({
      url: '/personal/opertrack/search',
      method: 'get',
      params: {
        ...queryState,
        time: undefined,
        startDate: queryState.time?.[0],
        endDate: queryState.time?.[1],
        sortBy: 'oper_time',
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
