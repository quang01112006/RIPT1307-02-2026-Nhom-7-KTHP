import Footer from '@/components/Footer';
import rules from '@/utils/rules';
import { LockOutlined, UserOutlined } from '@ant-design/icons';
import { Button, Form, Input, message } from 'antd';
import React, { useState } from 'react';
import { history, useModel } from 'umi';
import styles from './index.less';

const Login: React.FC = () => {
	const [submitting, setSubmitting] = useState(false);
	const { initialState, setInitialState } = useModel('@@initialState');
	const [form] = Form.useForm();

	const handleSubmit = async (values: { login: string; password: string }) => {
		setSubmitting(true);
		try {
			// TẠM THỜI MOCK LOGIN: Cứ gõ đại tài khoản mật khẩu là cho qua
			// Sau này bạn sẽ thay đoạn này bằng hàm gọi API sang NestJS
			if (values.login && values.password) {
				const fakeToken = 'day_la_token_gia_cho_den_khi_co_backend';
				localStorage.setItem('token', fakeToken);

				setInitialState({
					...initialState,
					currentUser: { name: values.login, role: 'admin' } as any,
				});

				message.success('Đăng nhập thành công!');
				history.replace('/dashboard');
			}
		} catch (error) {
			message.error('Đăng nhập thất bại');
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
							<Input
								placeholder='Nhập tên đăng nhập (gõ đại)'
								prefix={<UserOutlined className={styles.prefixIcon} />}
								size='large'
							/>
						</Form.Item>
						<Form.Item label='' name='password' rules={[...rules.required]}>
							<Input.Password
								placeholder='Nhập mật khẩu (gõ đại)'
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
