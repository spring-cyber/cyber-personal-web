<template>
  <a-spin :spinning="basicState.loading" tip="Loading...">
    <div class="structure-basic-info">
      <g-module-title>基本信息</g-module-title>
      <template v-if="basicState.basicInfo.id">
        <div class="structure-user-action">
          <span @click="methods.searchQuery(true)">同步信息</span>
          <span @click="methods.showModifyPassword">修改密码</span>
        </div>
      </template>
      <div class="structure-basic-info-body">
        <div class="img-body">
          <UserAvatar :src="basicState.avatar" @changeAvatar="methods.searchQuery"></UserAvatar>
          <span class="mt-20px">{{ basicState.basicInfo.name || '-' }}{{ `（${basicState.basicInfo.userName}）` }}</span>
        </div>
        <div class="basic-info-list">
          <div class="basic-info-list-row" v-for="(item, index) in basicState.user_list" :key="index">
            <div class="flex" style="min-width: 30%" v-for="(citem, cindex) in item" :key="cindex">
              <div class="mr-20px w-50px">{{ citem.label }}</div>
              <div class="basic-info-value" :title="(citem.value || []).map(gitem => gitem.name).join(',')" v-if="/^岗位$|^部门$/.test(citem.label)">
                <a-tag color="green" v-for="(gitem, gindex) in citem.value" :key="gindex">
                  {{ gitem.name }}
                </a-tag>
              </div>
              <div class="basic-info-value leading-1" v-else-if="/状态|性别/.test(citem.label)">
                <template v-if="citem.value">{{ citem.value || '-' }}</template>
                <c-cell-dict
                  v-else
                  class="leading-normal"
                  style="min-height: initial;"
                  :options="citem.options"
                  :value="citem.value"
                  isSvg
                  :iconProps="{ size: /性别/.test(citem.label) ? '16px' : '8px' }"
                ></c-cell-dict>
              </div>
              <div class="basic-info-value" v-else :title="citem.value">{{ citem.value }}</div>
            </div>
          </div>
        </div>
      </div>

      <g-module-title>账号信息</g-module-title>
      <div class="structure-basic-user-account">
        <div
          v-for="(item, index) in basicState.user_account"
          :key="index"
          class="structure-basic-user-account-item"
        >
          <div class="icon-box"><c-icon :icon="item.icon" size="16" color="#FFFFFF"></c-icon></div>
          <div>{{ item.value }}</div>
          <div>{{ item.label }}</div>
          <div></div>
        </div>
      </div>
      <ModifyPassword ref="passwordRef"></ModifyPassword>
    </div>
  </a-spin>
</template>

<script setup>
import { API_URL } from '@/api';
import { userStore } from '@/store';
import ModifyPassword from './ModifyPassword.vue';
import UserAvatar from './UserAvatar.jsx';
import { message } from 'ant-design-vue';
import { useDict } from 'cyber-web-ui';
const { USER_STATUS, SEX } = useDict({ COMMON: ['USER_STATUS', 'SEX'] });
const passwordRef = ref();
const basicState = reactive({
  loading: false,
  user_list: computed(() => {
    let { basicInfo = {} } = basicState;
    return [
      [
        { label: '姓名', value: basicInfo.name },
        { label: '账号', value: basicState.basicInfo.userName },
        { label: '性别', value: basicInfo.sex, options: SEX.value },
      ],
      [
        { label: '企业', value: basicInfo.enterpriseName },
        { label: '部门', value: basicInfo.userDeptInfo },
        { label: '岗位', value: basicInfo.positionInfo },
        {},
      ],
      [
        { label: '电话', value: basicInfo.phone },
        { label: '邮箱', value: basicInfo.email },
        { label: '状态', value: basicInfo.status, options: USER_STATUS.value },
        {},
      ],
      [
        { label: '简介', value: basicInfo.remark },
      ]
    ];
  }),
  user_account: computed(() => {
    let { userName, email, phone } = basicState.basicInfo || {};
    return [
      { label: '账号', value: userName , icon: 'cyber-yonghu' },
      { label: '邮箱', value: email, icon: 'cyber-youxiang' },
      { label: '手机号', value: phone, icon: 'cyber-shouji' },
    ].filter(item => item.value);
  }),
  basicInfo: {},
  avatar: computed(() => {
    if(basicState.basicInfo?.avatar) {
      return `${API_URL}personal/open/view/${basicState.basicInfo.avatar}`
    }
  }),
});

const methods = {
  // 查询详情
  async searchQuery(isSync = false) {
    basicState.loading = true;
    try {
      basicState.basicInfo = await userStore().getInfo();
      if(isSync) message.success('同步信息成功！');
    } catch {
      basicState.basicInfo = {};
    }
    basicState.loading = false;
  },
  showModifyPassword() {
    unref(passwordRef).showModal();
  }
}

methods.searchQuery();
</script>

<style lang="less">
.structure-basic-info {
  padding: 20px 36px 20px 40px;
  min-height: 540px;
  background-color: white;
  border-radius: @border-radius-base;
  .structure-basic-info-body {
    display: flex;
    padding: 24px 16px;
    margin-bottom: 20px;
    .img-body {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      width: 20%;
      max-width: 200px;
      border-right: 1px solid #D9E2EB;
    }
    .basic-info-list {
      width: 0;
      flex: 1;
      display: grid;
      grid-row-gap: 20px;
      row-gap: 20px;
      padding-left: 30px;
      .basic-info-list-row {
        display: flex;
        & > * {
          margin-left: 20px;
        }
      }
      .basic-info-value {
        .ellipsis();
        width: 0;
        flex: 1;
      }
    }
  }
  .structure-user-action {
    display: flex;
    justify-content: flex-end;
    white-space: nowrap;
    & > span {
      cursor: pointer;
      margin-left: 20px;
      color: #BDBDBD;
      white-space: nowrap;
      &:hover {
        color: @primary-color;
      }
      &:active {
        color: hardlight(@primary-color, #00000033);
      }
    }
  }
  .structure-basic-user-account {
    width: 70%;
    max-width: 970px;
    .structure-basic-user-account-item {
      display: flex;
      align-items: center;
      height: 56px;
      font-size: 12px;
      .icon-box {
        width: 27px;
        height: 27px;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 50%;
        background-color: @primary-color;
        margin-right: 10px;
      }
      & > div:not(.icon-box) {
        min-width: calc((100% - 37px) / 3);
      }
    }
  }
}
</style>
