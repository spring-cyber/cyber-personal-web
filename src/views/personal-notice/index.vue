<template>
  <c-page-label title="系统公告" icon="cyber-gonggao" document-link="javascript:;">
    <template #tips>维护公告相关信息。</template>
  </c-page-label>

  <c-radio-wrapper v-model:value="queryState.type">
    <c-radio-button value="">全部</c-radio-button>
    <c-radio-button value="1" dark>系统公告</c-radio-button>
    <c-radio-button value="2" dark>系统公告</c-radio-button>
    <c-radio-button value="3" dark>待办事项</c-radio-button>
  </c-radio-wrapper>

  <div class="sys-notice-card">
    <div class="sys-notice-list">
      <div class="sys-notice-list-header">
        <a-checkbox
          class="mr-16px"
          v-model:checked="noticeState.checkAll"
          :disabled="!noticeState.dataSource?.length"
          :indeterminate="!noticeState.checkAll && !!noticeState.value?.length"
          @change="methods.checkAllHandler"
        ></a-checkbox>
        <a-button :disabled="!noticeState.value?.length" @click="methods.batchDelete()">删除</a-button>
        <a-button :disabled="!noticeState.value?.length">标记已读</a-button>
        <a-button :disabled="!noticeState.dataSource?.length">全部已读</a-button>
      </div>
      <div class="sys-notice-list-container">
        <a-checkbox-group v-model:value="noticeState.value" class="w-1/1" @change="methods.changeCheckbox">
          <a-empty v-if="!noticeState.dataSource?.length"></a-empty>
          <div
            v-else
            v-for="(item, index) in noticeState.dataSource"
            :key="index"
            :class="[
              'sys-notice-item',
              { 'sys-notice-item-unpublish': item.status == '1' },
              { 'sys-notice-item-publish': item.status == '0' },
              { 'sys-notice-item-select': queryState.id == item.id },
            ]"
            @click="methods.onSelect(item)"
          >
            <a-checkbox :value="item.id"></a-checkbox>
            <c-icon icon="cyber-zhengchang" size="8" class="mr-10px ml-10px"></c-icon>
            <div class="w-0 flex-1">
              <div class="w-1/1 flex-between">
                <span class="ellipsis">{{ item.noticeTitle || '-' }}</span>
                <span class="notice-status">[<c-cell-dict :options="$dictStore.noticeStatus" :value="item.status" style="min-height: initial;" />]</span>
              </div>
              <div class="mt-7px text-[#63637299]">{{ item.createTime || '-' }}</div>
            </div>
          </div>
        </a-checkbox-group>
      </div>
    </div>
    <div class="sys-notice-body">
      <template v-if="queryState.id">
        <div class="sys-notice-body-header">
          <div>
            <div class="text-[#242E42] text-16px">{{ noticeState.detail.noticeTitle || '-' }}</div>
            <div class="mt-8px text-[#A8ACB8]">
              <span>发布范围：{{ noticeState.detail.noticeScope || '-' }}</span>
              <span class="ml-30px">发布时间：{{ noticeState.detail.status == '0' ? noticeState.detail.createTime : '-' }}</span>
            </div>
          </div>
        </div>
        <div class="sys-notice-body-container">
          <span>{{ noticeState.detail.noticeContent }}</span>
        </div>
      </template>
    </div>
  </div>
</template>

<script setup>
import { dictStore } from '@/store';
import { message } from 'ant-design-vue';
import { changeHistoryState, initHistoryState } from 'cyber-web-ui';
import axios, { batchOperateConfrim, deleteConfrim, queryDetail } from '@/api';
const $dictStore = dictStore();
const modifyRef = ref(); // 弹窗ref
// 表格请求参数
const queryState = reactive({
  ...initHistoryState({
    id: undefined,
    type: '',
  }),
});
const noticeState = reactive({
  value: [],
  checkAll: false,
  dataSource: [],
  detail: {},
});

const methods = {
  // 搜索表格
  async searchQuery() {
    noticeState.value = [];
    noticeState.checkAll = false;
    let res = await axios.request({
      url: '/system/sysnotice/select',
      method: 'get',
    });
    noticeState.dataSource = res?.data || [];
  },
  // 获取公告详表
  async queryNoticeDetail(id) {
    changeHistoryState(queryState);
    noticeState.detail = await queryDetail('/auth/sysnotice', { id });
  },
  // 切换公告
  onSelect(record) {
    if(queryState.id != record.id) {
      queryState.id = record.id;
      methods.queryNoticeDetail(record.id);
    }
  },
  // 全选
  checkAllHandler({ target }) {
    if(target.checked) noticeState.value = noticeState.dataSource.map(item => item.id);
    else noticeState.value = [];
  },
  // 切换checkbox
  changeCheckbox(value) {
    noticeState.checkAll = value?.length == noticeState.dataSource?.length;
  },
  // 显示弹窗
  showModify(record) {
    unref(modifyRef).showModal(record);
  },
  // 删除
  delete(record) {
    deleteConfrim({
      content: `是否确认删除“${record.creator}（${record.noticeTitle}）”的公告？`,
      value: record.noticeTitle,
    }, {
      url: '/auth/sysnotice',
      method: 'delete',
      params: {
        id: record.id,
      }
    }).then(() => {
      queryState.id = undefined;
      noticeState.detail = {};
      changeHistoryState(queryState);
      methods.searchQuery();
    });
  },
  // 批量删除
  batchDelete() {
    batchOperateConfrim('确定要批量删除选中的公告吗，删除后将无法恢复！', {
      url: '/auth/sysnotice/batch',
      method: 'delete',
      data: {
        ids: noticeState.value,
      }
    }).then(() => {
      noticeState.value = [];
      noticeState.checkAll = false;
      methods.searchQuery();
    });
  },
  // 切换状态
  changeStatus(record, status, text) {
    deleteConfrim({
      content: `是否确认${text}“${record.creator}（${record.noticeTitle}）”的公告？`,
      value: record.noticeTitle,
    }, {
      url: '/auth/sysnotice/batch',
      method: 'put',
      data: {
        ids: [record.id],
        status: status
      }
    }).then(() => {
      methods.searchQuery();
      methods.queryNoticeDetail(record.id);
    });
  },
  // 批量切换状态
  batchChangeStatus(status, text) {
    let ids = [];
    noticeState.value.forEach(id => {
      noticeState.dataSource.forEach(item => {
        if(status == '0' && item.status == '1') ids.push(id);
        else if(status == '2' && item.status == '0') ids.push(id);
      });
    });
    if(ids) {
      message.warning(`没有可${status == '0' ? '发布' : '撤回'}的公告！`);
      return;
    }
    batchOperateConfrim(text, {
      url: '/auth/sysnotice/batch',
      method: 'put',
      data: {
        ids: ids,
        status: status,
      }
    }).then(() => {
      noticeState.value = [];
      noticeState.checkAll = false;
      methods.searchQuery();
    });
  },
};

(async () => {
  await methods.searchQuery();
  if(noticeState.dataSource.some(item => item.id == queryState.id)) {
    methods.queryNoticeDetail(queryState.id);
  }
})();
</script>

<style lang="less" scoped>
.sys-notice-card {
  background: #FFFFFF;
  border-radius: 4px;
  min-height: 600px;
  max-height: 750px;
  display: flex;
  .sys-notice-list {
    width: 400px;
    display: flex;
    flex-direction: column;
    .sys-notice-list-header {
      padding: 20px 0 20px 24px;
      border-bottom: 1px solid #EFF1F6;
      .ant-btn {
        margin-left: 16px;
      }
    }
    .sys-notice-list-container {
      padding: 8px 0;
      .sys-notice-item {
        height: 64px;
        display: flex;
        align-items: center;
        transition: all 0.3s linear;
        padding: 0 9px 0 24px;
        position: relative;
        cursor: pointer;
        &::after {
          width: calc(100% - 16px * 2);
          height: 1px;
          content: '';
          display: block;
          position: absolute;
          background-color: #EFF1F6;
          bottom: 0;
          left: 16px;
        }
        .cyber-icon {
          transition: all 0.2s linear;
        }
        &.sys-notice-item-publish {
          .notice-status,
          .cyber-icon {
            color: @success-color;
          }
        }
        &.sys-notice-item-unpublish {
          .notice-status,
          .cyber-icon {
            color: @error-color;
          }
        }
        &.sys-notice-item-select {
          background: #E4E8EF;
          .cyber-icon {
            color: transparent;
          }
        }
      }
    }
  }
  .sys-notice-body {
    width: 0;
    flex: 1;
    padding: 0 20px;
    border-left: 1px solid #EFF1F6;
    .sys-notice-body-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 16px 0;
      border-bottom: 1px solid #EFF1F6;
    }
    .sys-notice-body-container {
      padding: 20px 0;
    }
  }
}
</style>
