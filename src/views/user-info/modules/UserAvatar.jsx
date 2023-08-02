import { VueCropper } from 'vue-cropper'; 
import { Modal } from 'cyber-web-ui';
import { Upload as AUpload, Button as AButton, message } from 'ant-design-vue';
import { defineComponent, reactive, getCurrentInstance } from 'vue';
import "vue-cropper/dist/index.css";
import './UserAvatar.less';

export default defineComponent({
  props: {
    src: String,
    replace: {
      type: Boolean,
      default: true,
    }
  },
  setup(props, { attrs, slots, emit, expose }) {
    const { proxy } = getCurrentInstance();
    const cropperRef = ref();
    const modalState = reactive({
      visible: false,
    });
    const cropperState = reactive({
      img: undefined, // 传入的图片
      previews: {}, // 预览数据
      hidden: true,
    });
    function showModal() {
      if(!props.replace) return;
      modalState.visible = true;
    }
    function beforeUpload(file, fileList) {
      console.log('beforeUpload', file, fileList)
      if (!/^image\//.test(file.type)) {
        message.warning("文件格式错误，请上传图片类型的文件。");
      } else {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => {
          cropperState.img = reader.result;
        };
      }
    }
    function onRealTime(data) {
      cropperState.previews = data;
    }
    function onSubmit() {
      return new Promise((resolve, reject) => {
        if(!cropperState.previews?.url) {
          message.warning('请上传新头像！');
          reject();
          return;
        }
        cropperRef.value.getCropBlob(async data => {
          let formData = new FormData();
          const avatarfile = new window.File([data], `user-avatar.png`, { type: data.type });
          formData.append("avatarfile", avatarfile);
          
          try {
            let res = await proxy.$axios.request({
              url: '/auth/user/profile/avatar',
              method: 'post',
              headers: { 'Content-Type': 'multipart/form-data' },
              data: formData,
            });
            message.success(res.message);
            emit('changeAvatar');
            resolve();
          } catch {
            reject();
          }
        });
      });
    }

    watchEffect(() => {
      if(modalState.visible) cropperState.img = props.src;
      else {
        cropperState.img = '';
        cropperState.previews = {};
      }
    });

    return () => {
      function modalSlot() {
        if(!props.replace) return;
        return (
          <Modal
            v-model:visible={modalState.visible}
            width="520px"
            title="系统提示"
            icon="cyber-tishi"
            onOk={onSubmit}
          >
            { cropperSlot() }
          </Modal>
        )
      }
      function cropperSlot() {
        function VueCropperSlot() {
          if(!cropperState.img) {
            return (
              <div class="cyber-empty-img">暂无图片</div>
            )
          }
          return (
            <VueCropper
              ref={cropperRef}
              img={cropperState.img}
              info
              autoCrop
              autoCropWidth={120}
              autoCropHeight={120}
              fixedBox
              outputType="png"
              onRealTime={onRealTime}
            ></VueCropper>
          )
        }
        return (
          <div class="cyber-avatar-modal-body">
            <div class="cyber-avatar-upload">
              <AUpload
                action="#"
                showUploadList={false}
                before-upload={beforeUpload}
                customRequest={() => {}}
              >
                <AButton>请上传新的头像</AButton>
              </AUpload>
            </div>
            <div class="cyber-avatar-cropper">
              <div class="cyber-avatar-cropper-body">
                <div class="title">图片内容</div>
                { VueCropperSlot() }
              </div>
              <div class="cyber-avatar-upload-preview">
                <div class="title">效果预览</div>
                <div class="cyber-avatar-upload-preview-img">
                  <img src={cropperState.previews?.url} style={cropperState.previews?.img} />
                </div>
              </div>
            </div>
          </div>
        )
      }
      return (
        <div class={['cyber-avatar', { 'cyber-avatar-replace': props.replace }]} onClick={showModal}>
          <img src={props.src}/>
          { modalSlot() }
        </div>
      )
    }
  },
});
