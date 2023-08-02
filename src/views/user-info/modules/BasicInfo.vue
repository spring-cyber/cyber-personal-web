<template>
  <a-spin :spinning="basicState.loading" tip="Loading...">
    <div class="structure-basic-info">
      <g-module-title>基本信息</g-module-title>
      <template v-if="type == 'user' && isPersonal && basicState.basicInfo.id">
        <div class="structure-user-action">
          <span @click="methods.queryPersonalUserInfo(true)">同步信息</span>
          <span @click="methods.showModifyPassword">修改密码</span>
        </div>
      </template>
      <div class="structure-basic-info-body">
        <div class="img-body">
          <c-icon v-if="type != 'user'" isSvg icon="cyber-zuhu" size="64"></c-icon>
          <UserAvatar v-else :replace="isPersonal" :src="basicState.avatar" @changeAvatar="methods.searchQuery"></UserAvatar>
          <span class="mt-20px">{{ basicState.basicInfo.name || '-' }}{{ type == 'user' ? `（${basicState.basicInfo.userName}）` : '' }}</span>
        </div>
        <div class="basic-info-list">
          <div class="basic-info-list-row" v-for="(item, index) in basicState.basic_list" :key="index">
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

      <template v-if="type == 'user'">
        <g-module-title>账号信息</g-module-title>
        <div class="structure-basic-user-account">
          <div
            v-for="(item, index) in basicState.user_account"
            :key="index"
            class="structure-basic-user-account-item"
          >
            <div>{{ item.value }}</div>
            <div>{{ item.label }}</div>
            <div></div>
          </div>
        </div>
        <ModifyPassword v-if="isPersonal" ref="passwordRef"></ModifyPassword>
      </template>
    </div>
  </a-spin>
</template>

<script setup>
import axios, { VITE_API_URL } from '@/api';
import { dictStore, userStore } from '@/store';
import ModifyPassword from './ModifyPassword.vue';
import UserAvatar from './UserAvatar.jsx';
import { message } from 'ant-design-vue';
const props = defineProps({
  type: String,
  enterprise: String,
  dept: String,
  user: String,
  isPersonal: {
    type: Boolean,
    default: false,
  },
});
const $dictStore = dictStore();
const passwordRef = ref();
const positionRef = ref();
const basicState = reactive({
  loading: false,
  user_list: computed(() => {
    let { basicInfo = {} } = basicState;
    return [
      [
        { label: '姓名', value: basicInfo.name },
        { label: '账号', value: basicState.basicInfo.userName },
        { label: '性别', value: basicInfo.sex, options: $dictStore.sex },
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
        { label: '状态', value: basicInfo.status, options: $dictStore.userState },
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
      { label: '账号', value: userName },
      { label: '邮箱', value: email },
      { label: '手机号', value: phone }
    ].filter(item => item.value);
  }),
  dept_list: computed(() => {
    let { basicInfo = {} } = basicState;
    return [
      [
        { label: '名称', value: basicInfo.name },
        { label: '编码', value: basicInfo.code },
        { label: '状态', value: basicInfo.status, options: $dictStore.status },
      ],
      [
        basicInfo.parentId == 0 
          ? { label: '企业', value: basicInfo.enterpriseName }
          : { label: '上级部门', value: basicInfo.parentDeptName },
      ],
      [
        { label: '负责人', value: basicInfo.leader },
        { label: '联系电话', value: basicInfo.phone },
        { label: '联系邮箱', value: basicInfo.email },
      ],
      [
        { label: '简介', value: basicInfo.description },
      ],
    ];
  }),
  enterprise_list: computed(() => {
    let { basicInfo = {} } = basicState;
    return [
      [
        { label: '名称', value: basicInfo.name },
        { label: '编码', value: basicInfo.code },
        { label: '状态', value: basicInfo.status, options: $dictStore.status },
      ],
      [
        { label: '负责人', value: basicInfo.leader },
        { label: '联系电话', value: basicInfo.phone },
        { label: '联系邮箱', value: basicInfo.email },
        {},
      ],
      [
        { label: '简介', value: basicInfo.description },
      ],
    ];
  }),
  basic_list: computed(() => {
    return props.type ? basicState[`${props.type}_list`] : [];
  }),
  basicInfo: {},
  position_list: [],
  avatar: computed(() => {
    if(props.type == 'user' && basicState.basicInfo?.avatar) {
      return `${VITE_API_URL}auth/user/profile/static/${basicState.basicInfo.avatar}`
    }
  }),
});

const methods = {
  // 查询详情
  async searchQuery() {
    if(props.type == 'user' && props.isPersonal) {
      methods.queryPersonalUserInfo();
      return;
    }
    let id = props.user;
    if(props.type == 'dept') {
      id = props.dept;
    } else if(props.type == 'enterprise') {
      id = props.enterprise;
    }
    basicState.loading = true;
    try {
      let res = await axios.request({
        url: `/auth/${props.type}`,
        method: 'get',
        params: {
          id: id,
        }
      });
      basicState.basicInfo = res.data || {};
    } catch {
      basicState.basicInfo = {};
    }
    if(props.type == 'enterprise') {
      await methods.queryPosition();
    }
    basicState.loading = false;
  },
  // 获取个人信息
  async queryPersonalUserInfo(isSync = false) {
    basicState.loading = true;
    try {
      basicState.basicInfo = await userStore().getInfo();
      if(isSync) message.success('同步信息成功！');
    } catch {
      basicState.basicInfo = {};
    }
    basicState.loading = false
  },
  // 获取企业岗位信息
  async queryPosition() {
    try {
      let res = await axios.request({
        url: '/auth/position/select',
        method: 'get',
        params: {
          enterpriseId: props.enterprise,
        }
      });
      basicState.position_list = res.data || [];
    } catch(e) {
      throw Error(e)
    }
  },
  showPositionModal() {
    unref(positionRef).showModal({
      enterpriseId: props.enterprise,
    }, true);
  },
  showModifyPassword() {
    unref(passwordRef).showModal();
  }
}


watch(() => [props.type, props.user, props.dept, props.enterprise], () => {
  if(!props.type) return;
  methods.searchQuery();
}, { immediate: true });

defineExpose({
  searchQuery: methods.searchQuery,
});
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
      .flex-column-center-center();
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
  .position-body {
    display: flex;
    flex-wrap: wrap;
    & > .ant-tag {
      margin-right: 20px;
    }
    .add-position {
      .flex-center-center();
      .pointer();
      width: 24px;
      height: 24px;
      border-radius: @border-radius-base;
      background: #FFFFFF;
      box-shadow: 0px 4px 10px 0px rgba(0, 0, 0, 0.06);
      border: 1px solid #D9E2EB;
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
      & > div {
        min-width: 32%;
      }
    }
  }
}
</style>
