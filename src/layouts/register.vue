<template>
    <div class="register-container">
      <div class="register-box">
        <div class="logo-area">
            <img src="@/assets/img/logo.png" alt="TMusic Streaming Logo" class="logo">
            <h1 class="logo-title">Đăng ký tài khoản</h1>
          <p>Vui lòng điền thông tin để tạo tài khoản mới.</p>
        </div>
  
        <form @submit.prevent="handleRegister" class="register-form">
          <div class="form-group">
            <label for="nameRegister">Họ và tên</label>
            <input id="nameRegister" v-model="nameRegister" type="text" placeholder="Nhập họ và tên" />
            <span v-if="errors.nameRegister" class="error-text">{{ errors.nameRegister }}</span>
            <i class="fa-solid fa-signature input-icon"></i>
          </div>

          <div class="form-group">
            <label for="emailRegister">Email</label>
            <input id="emailRegister" v-model="emailRegister" type="email" placeholder="Nhập email" />
            <span v-if="errors.emailRegister" class="error-text">{{ errors.emailRegister }}</span>
            <i class="fas fa-user input-icon"></i>
          </div>

          <div class="form-group d-flex flex-row mb-0">
            <label>Giới tính: </label>
            <div class="gender-options">
              <label class="text-nowrap d-inline mx-4">
                <input class="m-0" type="radio" name="genderRegister" :value="true" v-model="genderRegister" style="width: 10%;"/>
                Nam
              </label>
              <label class="text-nowrap d-inline mx-4">
                <input class="m-0" type="radio" name="genderRegister" :value="false" v-model="genderRegister" style="width: 10%;"/>
                Nữ
              </label>
            </div>
          </div>
          <span v-if="errors.genderRegister" class="error-text mb-3">{{ errors.genderRegister }}</span>

          <div class="form-group mt-2">
            <label for="passwordRegister">Mật khẩu</label>
            <input id="passwordRegister" v-model="passwordRegister" type="password" placeholder="Nhập mật khẩu" />
            <span v-if="errors.passwordRegister" class="error-text">{{ errors.passwordRegister }}</span>
            <i class="fas fa-lock input-icon"></i>
          </div>

          <div class="form-group mb-1">
            <label for="confirmPasswordRegister">Xác nhận mật khẩu</label>
            <input id="confirmPasswordRegister" v-model="confirmPasswordRegister" type="password" placeholder="Nhập lại mật khẩu" />
            <span v-if="errors.confirmPasswordRegister" class="error-text">{{ errors.confirmPasswordRegister }}</span>
            <i class="fas fa-lock input-icon"></i>
          </div>

          <div class="form-options mb-1">
            <label class="d-flex align-items-center">
              <input type="checkbox" v-model="agreePolicy" class="me-2" />
              Tôi đồng ý với <a href="/terms" target="_blank" class="text-primary mx-1">chính sách sử dụng</a> của TMusic.
            </label>
          </div>
          <span v-if="errors.agreePolicy" class="error-text mb-1">{{ errors.agreePolicy }}</span>

          <button type="submit" class="register-btn mt-2" :disabled="loading">
            <span v-if="loading" class="loading"><i class="fas fa-spinner fa-spin"></i></span>
            Đăng ký
          </button>
        </form>

        <div class="form-footer text-center">
          Đã có tài khoản? <router-link :to="{ name: 'login' }">Đăng nhập</router-link> ngay
        </div>
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref } from 'vue';
  import { useRouter } from 'vue-router';
  import { message } from 'ant-design-vue';
  import * as yup from 'yup';
  import { useForm, useField } from 'vee-validate';
  import { register } from '@/services/authService';
  
  const router = useRouter();
  const loading = ref(false);
  
  const schema = yup.object({
    nameRegister: yup.string().required('Vui lòng nhập họ và tên.'),
    emailRegister: yup.string().email('Email không hợp lệ.').required('Vui lòng nhập email.'),
    genderRegister: yup.boolean().required('Vui lòng chọn giới tính.'), // <-- thêm dòng này
    passwordRegister: yup.string().min(6, 'Mật khẩu ít nhất 6 ký tự.').required('Vui lòng nhập mật khẩu.'),
    confirmPasswordRegister: yup.string()
      .oneOf([yup.ref('passwordRegister')], 'Mật khẩu xác nhận không khớp.')
      .required('Vui lòng xác nhận mật khẩu.'),
    agreePolicy: yup.boolean()
      .oneOf([true], 'Bạn cần đồng ý với chính sách sử dụng.')
  })
  
  const { handleSubmit, errors } = useForm({ validationSchema: schema });
	const { value: nameRegister } = useField('nameRegister');
	const { value: emailRegister } = useField('emailRegister');
  const { value: genderRegister } = useField('genderRegister');
	const { value: passwordRegister } = useField('passwordRegister');
	const { value: confirmPasswordRegister } = useField('confirmPasswordRegister');
  const { value: agreePolicy } = useField('agreePolicy');
  
  const handleRegister = handleSubmit(async (formValues) => {
    try {
      loading.value = true;
			const payload = {
				Name: formValues.nameRegister,
				Email: formValues.emailRegister,
        Gender: formValues.genderRegister,
				Password: formValues.passwordRegister
			}
      // console.log(payload);
      await register(payload);
      message.success('Đăng ký thành công!');
      router.push({ name: 'login' });
    } catch (error) {
      // console.error('Register error:', error);
      const errorMessage = error.response?.data?.message || 'Đăng ký thất bại!';
      message.error(errorMessage);
    } finally {
      loading.value = false;
    }
  });
  </script>
  <style scoped src="@/assets/admin/css/login.css"></style>