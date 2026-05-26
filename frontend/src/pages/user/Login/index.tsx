import Footer from '@/components/Footer';
import { login } from '@/services/base/api';
import rules from '@/utils/rules';
import { LockOutlined, UserOutlined } from '@ant-design/icons';
import { Button, Form, Input, message } from 'antd';
import React, { useState } from 'react';
import { history, useModel } from 'umi';
import styles from './index.less';

const Login: React.FC = () => {
	const [submitting, setSubmitting] = useState(false);
	const [loginErrorMessage, setLoginErrorMessage] = useState('');
	const { refresh } = useModel('@@initialState');
	const [form] = Form.useForm();

	const handleSubmit = async (values: { login: string; password: string }) => {
		setSubmitting(true);
		setLoginErrorMessage('');
		try {
			const response = await login({
				identifier: values.login,
				password: values.password,
			});
			const resData = (response as any)?.data?.data || (response as any)?.data || response;

			if (resData?.access_token) {
				message.success('Đăng nhập thành công!');

				localStorage.setItem('token', resData.access_token);
				await refresh();
				const role = resData.user?.role;

				if (role === 'admin') {
					history.push('/admin/dashboard');
				} else {
					history.push('/dashboard');
				}
			}
		} catch (error: any) {
			const errorMsg = error?.response?.data?.message || 'Thông tin đăng nhập không chính xác.';
			setLoginErrorMessage(errorMsg);
		}
		setSubmitting(false);
	};

	return (
		<div className={styles.container}>
			<div className={styles.canvas}>
				<div className={styles.loginCard}>
					<div className={styles.brand}>
						<img src='/logo.png' alt='Logo' className={styles.brandLogo} />
						<div className={styles.brandText}>
							<div className={styles.brandName}>EduStack</div>
							<div className={styles.brandTag}>Kết nối học tập và chia sẻ tri thức</div>
						</div>
					</div>

					<div className={styles.formWrapper}>
						<div className={styles.headerBlock}>
							<div className={styles.formBadge}>Đăng nhập</div>
							<h2 className={styles.heading}>Chào mừng trở lại</h2>
							<p className={styles.subheading}>Đăng nhập bằng email hoặc mã GV/SV để tiếp tục.</p>
						</div>
						<Form form={form} onFinish={handleSubmit} layout='vertical'>
							<Form.Item label='' name='login' rules={[...rules.required]}>
								<Input
									className='auth-input'
									placeholder='Nhập email hoặc mã GV/SV'
									prefix={<UserOutlined className={styles.prefixIcon} />}
									size='large'
								/>
							</Form.Item>
							<Form.Item
								label=''
								name='password'
								rules={[...rules.required]}
								validateStatus={loginErrorMessage ? 'error' : ''}
								help={
									loginErrorMessage ? (
										<span>
											{loginErrorMessage} — <a href='/user/forgot-password'>Quên mật khẩu?</a>
										</span>
									) : null
								}
							>
								<Input.Password
									className='auth-input'
									placeholder='Mật khẩu'
									prefix={<LockOutlined className={styles.prefixIcon} />}
									size='large'
								/>
							</Form.Item>
							<Button
								type='primary'
								block
								size='large'
								loading={submitting}
								htmlType='submit'
								className={styles.loginBtn}
							>
								Đăng nhập
							</Button>
						</Form>

						<div className={styles.bottomText}>
							<span>Bạn chưa có tài khoản?</span>
							<a href='/user/register'>Đăng ký ngay</a>
						</div>
					</div>
				</div>
			</div>

			<div className='login-footer'>
				<Footer />
			</div>
		</div>
	);
};

export default Login;
