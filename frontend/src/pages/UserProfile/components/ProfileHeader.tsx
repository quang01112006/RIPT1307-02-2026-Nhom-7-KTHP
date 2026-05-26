import { CalendarOutlined, CheckCircleFilled, EditOutlined, UserOutlined, BankOutlined } from '@ant-design/icons';
import { Avatar, Button, Card, Space, Tag, Typography, Row, Col } from 'antd';
import moment from 'moment';
import styles from '../index.less';

const { Title, Text } = Typography;

interface Props {
	user: any;
	isMe: boolean;
	onEditClick: () => void;
}

const ProfileHeader = ({ user, isMe, onEditClick }: Props) => {
	return (
		<Card bordered={false} className={styles.headerCard} style={{ borderRadius: 16, overflow: 'hidden' }}>
			<Row gutter={32} align='middle'>
				{/* Avatar Section */}
				<Col>
					<div style={{ position: 'relative', display: 'inline-block' }}>
						<Avatar
							size={130}
							src={user.avatar}
							icon={<UserOutlined />}
							style={{
								backgroundColor: '#f0f2f5',
								border: '4px solid #fff',
								boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
							}}
						/>
						<div
							style={{
								position: 'absolute',
								bottom: 8,
								right: 8,
								width: 24,
								height: 24,
								borderRadius: '50%',
								background: '#52c41a',
								border: '4px solid #fff',
								boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
							}}
							title='Đang hoạt động'
						/>
					</div>
				</Col>

				{/* Info Section */}
				<Col flex='auto'>
					<div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
						<div>
							<Space align='center' size='middle' style={{ marginBottom: 4 }}>
								<Title level={2} style={{ margin: 0, fontWeight: 700, color: '#1f1f1f' }}>
									{user.fullName}
								</Title>
								{user.role === 'teacher' ? (
									<Tag color='geekblue' style={{ borderRadius: 12, padding: '2px 12px', fontSize: 13, fontWeight: 600 }}>
										<CheckCircleFilled style={{ marginRight: 4 }} /> Giảng viên
									</Tag>
								) : (
									<Tag color='blue' style={{ borderRadius: 12, padding: '2px 12px', fontSize: 13, fontWeight: 600 }}>
										Sinh viên
									</Tag>
								)}
							</Space>

							<Text type='secondary' style={{ fontSize: 16, display: 'block', marginBottom: 16, fontStyle: 'italic' }}>
								"{user.bio || 'Chưa có lời giới thiệu nào.'}"
							</Text>

							<Space size='large'>
								<Text style={{ color: '#595959', fontSize: 15, fontWeight: 500 }}>
									<CalendarOutlined style={{ marginRight: 8, color: '#8c8c8c' }} />
									Đã tham gia: {moment(user.createdAt).format('DD/MM/YYYY')}
								</Text>
								{user.faculty && (
									<Text style={{ color: '#595959', fontSize: 15, fontWeight: 500 }}>
										<BankOutlined style={{ marginRight: 8, color: '#8c8c8c' }} />
										Khoa: {user.faculty}
									</Text>
								)}
							</Space>
						</div>

						{/* Action Section */}
						{isMe && (
							<Button type='primary' shape='round' icon={<EditOutlined />} onClick={onEditClick} size='large' style={{ fontWeight: 600 }}>
								Chỉnh sửa hồ sơ
							</Button>
						)}
					</div>
				</Col>
			</Row>
		</Card>
	);
};

export default ProfileHeader;
