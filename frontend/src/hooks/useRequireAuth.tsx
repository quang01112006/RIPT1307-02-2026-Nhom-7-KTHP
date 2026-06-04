import { Button, Modal } from 'antd';
import { history, useModel } from 'umi';

export const useRequireAuth = () => {
	const { initialState } = useModel('@@initialState');
	const isLogin = !!initialState?.currentUser;

	const requireAuth = (action: () => void) => {
		if (isLogin) {
			action();
		} else {
			Modal.info({
				title: null,
				icon: null,
				content: (
					<div style={{ textAlign: 'center', paddingTop: 8, paddingBottom: 8 }}>
						<div style={{ marginBottom: 28 }}>
							<div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, marginBottom: 16 }}>
								<img src='/logo.png' alt='EduStack Logo' style={{ width: 48, height: 48, objectFit: 'contain' }} />
								<span style={{ fontSize: 28, fontWeight: 700, color: '#1f1f1f' }}>EduStack</span>
							</div>
							<h2 style={{ fontSize: 24, fontWeight: 700, color: '#111827', margin: 0, letterSpacing: '-0.02em' }}>
								Tham gia cộng đồng
							</h2>
							<p style={{ color: '#6B7280', fontSize: 15, marginTop: 10, marginBottom: 0, lineHeight: 1.5, padding: '0 10px' }}>
								Đăng nhập để đặt câu hỏi, bình chọn và thảo luận cùng hàng ngàn sinh viên khác.
							</p>
						</div>
						<div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
							<Button
								type='primary'
								size='large'
								style={{ width: '100%', borderRadius: 12, height: 48, fontWeight: 600, fontSize: 16, background: '#1890ff', borderColor: '#1890ff', boxShadow: '0 4px 6px -1px rgba(24, 144, 255, 0.2)' }}
								onClick={() => {
									Modal.destroyAll();
									history.push('/user/login');
								}}
							>
								Đăng nhập ngay
							</Button>
							<Button
								size='large'
								style={{ width: '100%', borderRadius: 12, height: 48, fontWeight: 600, fontSize: 16, color: '#1890ff', border: '1px solid #1890ff' }}
								onClick={() => {
									Modal.destroyAll();
									history.push('/user/register');
								}}
							>
								Tạo tài khoản mới
							</Button>
						</div>
					</div>
				),
				okButtonProps: { style: { display: 'none' } },
				maskClosable: true,
				closable: true,
				centered: true,
				className: 'rounded-modal',
				width: 480,
			});
		}
	};

	return requireAuth;
};
