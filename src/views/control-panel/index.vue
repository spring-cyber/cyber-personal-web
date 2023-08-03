<template>
  <div>
    <div class="flex justify-between">
      <div class="flex-1 w-0">
        <div class="card h-180px"></div>
        <div class="grid grid-cols-2 gap-x-20px h-180px">
          <div class="card"></div>
          <div class="card"></div>
        </div>
        <div class="card h-200px"></div>
        <div class="grid grid-cols-2 gap-x-20px h-200px">
          <div class="card"></div>
          <div class="card"></div>
        </div>
      </div>
      <div class="right-body">
        <div class="card user-info-body">
          <div class="flex content-center">
            <img class="user-avatar" :src="$userStore.avatar" />
            <div class="user-basic-info">
              <div><span class="user-info-label">姓名：</span>{{ $userStore.name }}</div>
              <div :title="position"><span class="user-info-label">岗位：</span>{{ position || '-' }}</div>
              <div :title="userDept"><span class="user-info-label">部门：</span>{{ userDept || '-' }}</div>
            </div>
          </div>
          <div class="flex flex-wrap">
            <div class="w-45/100">手机：{{ $userStore.info?.phone || '-' }}</div>
            <div class="ellipsis w-0 flex-1" :title="$userStore.info?.email">邮箱：{{ $userStore.info?.email || '-' }}</div>
            <div class="w-1/1 mt-12px">描述：{{ $userStore.info?.remark || '-' }}</div>
          </div>
          <div class="user-info-statistics">
            <div><div>应用数</div><div class="number">28</div></div>
            <div><div>组织数</div><div class="number">0</div></div>
            <div><div>资源数</div><div class="number">0</div></div>
            <div><div>角色数</div><div class="number">14</div></div>
          </div>
        </div>
        <div class="card h-0 flex-1"></div>
      </div>
    </div>
    <div class="card h-520px"></div>
  </div>
</template>

<script setup>
import { userStore } from '@/store';

const $userStore = userStore();

const position = computed(() => ($userStore.info?.positionInfo || []).map(item => item.name).join(' | '));
const userDept = computed(() => ($userStore.info?.userDeptInfo || []).map(item => item.name).join(' | '));

console.log($userStore)
</script>

<style lang="less" scoped>
.card {
  margin-bottom: 20px;
  background: #FFFFFF;
  border-radius: @border-radius-base;
  box-shadow: 0px 4px 10px 0px rgba(0, 0, 0, 0.06);
}
.right-body {
  width: 26%;
  min-width: 400px;
  margin-left: 20px;
  display: flex;
  flex-direction: column;
  .user-info-body {
    padding: 17px 30px 35px 20px;
    & > div {
      margin-bottom: 12px;
      padding-bottom: 12px;
      border-bottom: 1px solid #D9E2EB;
      &:last-child {
        margin-bottom: 0;
        padding-bottom: 0;
        border-bottom: none;
      }
    }
    .user-avatar {
      width: 64px;
      height: 64px;
      border-radius: 50%;
      margin-right: 20px;
    }
    .user-basic-info {
      width: 0;
      flex: 1;
      height: 100%;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      & > div {
        .ellipsis();
        margin-bottom: 12px;
        &:last-child {
          margin-bottom: 0;
        }
      }
      .user-info-label {
        color: #BDBDBD;
        white-space: nowrap;
      }
    }
    .user-info-statistics {
      display: flex;
      justify-content: space-between;
      padding-top: 50px;
      & > div {
        width: 25%;
        & > div {
          margin-bottom: 12px;
        }
        & > .number {
          font-size: 18px;
          font-weight: normal;
        }
      }
    }
  }
}
</style>