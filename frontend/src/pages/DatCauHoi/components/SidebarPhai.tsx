import { BulbOutlined } from '@ant-design/icons';
import { Card } from 'antd';
import React from 'react';

interface SidebarPhaiProps {
	currentUser?: any;
}

const SidebarPhai = ({ currentUser }: SidebarPhaiProps) => {
	return (
		<div
			style={{
				position: 'sticky',
				top: '16px',
				display: 'flex',
				flexDirection: 'column',
				gap: '16px',
				maxHeight: 'calc(100vh - 80px)',
				overflowY: 'auto',
			}}
		>
			<Card
				bordered={false}
				style={{ borderRadius: '12px', boxShadow: '0 4px 20px rgba(0, 0, 0, 0.05)' }}
				bodyStyle={{ padding: '18px 20px' }}
			>
				<div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '14px' }}>
					<BulbOutlined style={{ color: '#1890ff', fontSize: '16px' }} />
					<span style={{ fontSize: '14px', fontWeight: 600, color: '#262626' }}>Đặt câu hỏi hay</span>
				</div>
				<div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
					{[
						{
							n: 1,
							title: 'Tiêu đề trọng tâm:',
							desc: 'Viết ngắn gọn, tóm tắt chính xác lỗi hoặc vấn đề bạn đang gặp phải.',
						},
						{
							n: 2,
							title: 'Cung cấp ngữ cảnh:',
							desc: 'Mô tả chi tiết bạn đã thử làm gì, kết quả nhận được và kết quả bạn mong muốn.',
						},
						{
							n: 3,
							title: 'Chèn Code/Log:',
							desc: 'Hãy dùng toolbar để chèn code giúp mọi người dễ copy.',
						},
						{
							n: 4,
							title: 'Gắn thẻ (Tags):',
							desc: 'Thêm tối đa 5 từ khóa đúng với chủ đề câu hỏi của bạn.',
						},
					].map((item) => (
						<div key={item.n} style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
							<div
								style={{
									minWidth: '22px',
									height: '22px',
									borderRadius: '50%',
									background: '#e6f4ff',
									color: '#1890ff',
									fontSize: '12px',
									fontWeight: 600,
									display: 'flex',
									alignItems: 'center',
									justifyContent: 'center',
									flexShrink: 0,
								}}
							>
								{item.n}
							</div>
							<span style={{ fontSize: '13px', color: '#595959', lineHeight: '1.5' }}>
								<strong>{item.title}</strong> {item.desc}
							</span>
						</div>
					))}
				</div>
			</Card>

			<Card
				bordered={false}
				style={{ borderRadius: '12px', boxShadow: '0 4px 20px rgba(0, 0, 0, 0.05)' }}
				bodyStyle={{ padding: '16px 20px' }}
			>
				<span
					style={{
						fontSize: '13px',
						fontWeight: 600,
						color: '#8c8c8c',
						textTransform: 'uppercase',
						letterSpacing: '0.5px',
					}}
				>
					Thống kê cá nhân
				</span>
				<div style={{ display: 'flex', gap: '12px', marginTop: '12px' }}>
					<div
						style={{
							flex: 1,
							textAlign: 'center',
							padding: '10px 0',
							background: '#f5f5f5',
							borderRadius: '8px',
						}}
					>
						<div style={{ fontSize: '20px', fontWeight: 700, color: '#1890ff' }}>{currentUser?.postCount ?? 0}</div>
						<div style={{ fontSize: '12px', color: '#8c8c8c', marginTop: '2px' }}>Câu hỏi</div>
					</div>
					<div
						style={{
							flex: 1,
							textAlign: 'center',
							padding: '10px 0',
							background: '#f5f5f5',
							borderRadius: '8px',
						}}
					>
						<div style={{ fontSize: '20px', fontWeight: 700, color: '#52c41a' }}>{currentUser?.reputation ?? 0}</div>
						<div style={{ fontSize: '12px', color: '#8c8c8c', marginTop: '2px' }}>Điểm uy tín</div>
					</div>
				</div>
			</Card>
		</div>
	);
};

export default SidebarPhai;
