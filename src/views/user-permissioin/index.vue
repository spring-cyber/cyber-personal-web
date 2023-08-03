<template>
  <div>
    <c-page-label title="用户权限" icon="cyber-quanxianliebiao" document-link="#用户权限">
      <template #tips>查看用户的所有授权信息。</template>
    </c-page-label>

    <div class="flex">
      <c-product-tree v-model:value="queryState.productId" isPersonal @change="methods.onChange"></c-product-tree>

      <div class="w-0 flex-1 ml-20px">
        <c-page-wrapper class="h-min-600px">
          <template #header>
            <c-collapse-form @search="methods.searchQuery" class="bg-[#EFF1F6]">应用权限</c-collapse-form>
          </template>
          
          <div style="padding: 20px 20px 20px 40px">
            <g-module-title>角色列表</g-module-title>
            <a-empty v-if="!permissionState.roleList?.length"></a-empty>
            <template v-else>
              <div
                v-for="(item, index) in permissionState.roleList"
                :key="item.id"
                :class="['role-tag', { 'active': permissionState.roleId == item.id }, { 'system-role': item.type == '0' }]"
                @click="methods.changeRole(item, index)"
              >
                <c-icon icon="cyber-jiaose" size="16" class="mr-10px"></c-icon>
                <span>{{ item.name }}</span>
              </div>
            </template>
            <g-module-title>菜单权限</g-module-title>
            <c-menu-permission
              isPersonal
              :value="permissionState.right"
              disabled
              :productId="queryState.productId"
              @fetch="methods.changeMenuList"
            ></c-menu-permission>
          </div>
        </c-page-wrapper>
      </div>
    </div>
  </div>
</template>

<script setup>
import axios, { queryDetail } from '@/api';
import { message } from 'ant-design-vue';
import { changeHistoryState, initHistoryState } from 'cyber-web-ui';
// 表格请求参数
const queryState = reactive({
  ...initHistoryState({
    productId: undefined,
  }),
});
const permissionState = reactive({
  roleId: undefined,
  roleList: [],
  menu: [],
  right: [],
  allRight: [],
});

const methods = {
  onChange() {
    permissionState.roleId = undefined;
    changeHistoryState(queryState);
    nextTick(methods.searchQuery);
  },
  // 搜索表格
  async searchQuery() {
    if(!queryState.productId) {
      message.warning('请先选择应用！');
      return;
    }
    try {
      permissionState.roleList = [];
      // 获取角色列表
      let res = await axios.request({
        url: '/personal/permission/product/role',
        method: 'get',
        params: {
          productId: queryState.productId,
          status: '0',
          sortBy: 'type',
          sortType: 'asc',
        },
      });
      permissionState.roleList = res.data?.roleId || [];
    } catch {}
  },
  async changeRole(record) {
    if(record.id == permissionState.roleId) {
      permissionState.roleId = undefined;
      permissionState.right = permissionState.allRight;
      return;
    }
    permissionState.roleId = record.id;
    if(!record.info) {
      record.info = await queryDetail('/personal/permission/role', record);
    }
    permissionState.right = record.info?.menuIds || [];
  },
  changeMenuList(list) {
    permissionState.allRight = [];
    methods.getAllMenuRight(list);
    permissionState.right = permissionState.allRight;
  },
  getAllMenuRight(list) {
    list.forEach(item => {
      permissionState.allRight.push(item.id);
      methods.getAllMenuRight(item?.children || []);
    })
  }
};
</script>

<style lang="less" scoped>
.role-tag {
  display: inline-flex;
  align-items: center;
  line-height: 32px;
  background-color: #EDF9EB;
  border: 1px solid #EDF9EB;
  border-radius: @border-radius-base;
  padding: 0 20px;
  margin-right: 20px;
  margin-bottom: 20px;
  cursor: pointer;
  &.system-role {
    background-color: #FDB573;
  }
  &.active {
    border-color: @primary-color;
  }
}
</style>
