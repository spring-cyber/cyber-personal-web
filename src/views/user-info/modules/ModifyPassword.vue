<template>
  <c-modal
    ref="modalRef"
    v-model:visible="modalState.visible"
    width="600px"
    title="系统提示"
    okText="确定"
    icon="cyber-tishi"
    @ok="methods.onSubmit"
  >
    <a-form
      ref="formRef"
      name="formName"
      :model="formState"
      :rules="rules"
      v-if="modalState.visible"
      autocomplete="off" layout="vertical"
    >
      <a-form-item label="请输入旧密码" name="oldPassword">
        <c-input-password v-model:value="formState.oldPassword"></c-input-password>
      </a-form-item>
      <a-form-item label="请输入新密码" name="password">
        <c-input-password v-model:value="formState.password" @change="methods.onChange"></c-input-password>
      </a-form-item>
      <a-form-item label="请再次输入新密码" name="newPassword">
        <c-input-password v-model:value="formState.newPassword"></c-input-password>
      </a-form-item>
    </a-form>
  </c-modal>
</template>

<script setup>
import axios from '@/api';
import { message } from 'ant-design-vue';
import { required, checkPassword, encryption, PWD_ENC_KEY } from 'cyber-web-ui';
const formRef = ref(); // 表单ref
// 弹窗信息
const modalState = reactive({
  visible: false,
});
// 表单信息
const formState = reactive({
  oldPassword: undefined,
  password: undefined,
  newPassword: undefined,
});
// 表单校验规则
const rules = reactive({
  oldPassword: required('旧密码不能为空'),
  password: [required('新密码不能为空'), checkPassword()],
  newPassword: computed(() => [required('新密码不能为空'), checkPassword(formState.password)]),
});
const $emit = defineEmits(['ok']);
const methods = {
  async showModal() {
    modalState.visible = true;
    Object.keys(formState).forEach(key => formState[key] = undefined);
    nextTick(unref(formRef)?.clearValidate);
  },
  onSubmit() {
    return new Promise(async (resolve, reject) => {
      try {
        await unref(formRef).validate();
        let res = await axios.request({
          url: '/personal/user/updatePwd',
          method: 'put',
          headers: { 'Content-Type': 'multipart/form-data' },
          params: encryption({
              data: {
              oldPassword: formState.oldPassword,
              newPassword: formState.newPassword,
            },
            param: ['oldPassword', 'newPassword'],
            key: PWD_ENC_KEY,
          }),
        });
        message.success(res.message);
        $emit('ok');
        resolve();
      } catch (error) {
        console.log('error', error);
        reject();
      }
    })
  },
  onChange() {
    if(formState.newPassword) {
      unref(formRef).validate(['newPassword']);
    }
  }
};

defineExpose({
  showModal: methods.showModal,
});
</script>

<style lang="less" scoped>
</style>
