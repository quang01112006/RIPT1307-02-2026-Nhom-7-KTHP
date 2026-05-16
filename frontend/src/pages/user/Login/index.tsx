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
	const { initialState, setInitialState, refresh } = useModel('@@initialState');
	const [form] = Form.useForm();

	const handleSubmit = async (values: { login: string; password: string }) => {
		setSubmitting(true);
		try {
			const response = await login({
				identifier: values.login,
				password: values.password,
			});
			const resData = response.data;

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
			const errorMsg = error?.response?.data?.message || 'Đăng nhập thất bại!';
			message.error(errorMsg);
		}
		setSubmitting(false);
	};

	return (
		<div className={styles.container}>
			<div className={styles.content}>
				<div className={styles.top}>
					<div className={styles.header}>
						<div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
							<img alt='logo' className={styles.logo} src='/logo-full.svg' />
						</div>
					</div>
				</div>

				<div className={styles.main}>
					<h2 style={{ textAlign: 'center', marginBottom: 24 }}>ĐĂNG NHẬP</h2>
					<Form form={form} onFinish={handleSubmit} layout='vertical'>
						<Form.Item label='' name='login' rules={[...rules.required]}>
							<Input placeholder='dev@gmail.com' prefix={<UserOutlined className={styles.prefixIcon} />} size='large' />
						</Form.Item>
						<Form.Item label='' name='password' rules={[...rules.required]}>
							<Input.Password
								placeholder='dev'
								prefix={<LockOutlined className={styles.prefixIcon} />}
								size='large'
							/>
						</Form.Item>
						<Button type='primary' block size='large' loading={submitting} htmlType='submit'>
							Đăng nhập
						</Button>
					</Form>
				</div>
			</div>
			<div className='login-footer'>
				<Footer />
			</div>
		</div>
	);
};

export default Login;
