import ContentEditor from '@/components/ContentEditor';
import { Button, Card, Col, Input, message, Modal, Row, Select } from 'antd';
import React, { useEffect, useState } from 'react';
import { history, useLocation, useModel } from 'umi';
import SidebarPhai from './components/SidebarPhai';

const DatCauHoi: React.FC = () => {
	const { postModel: createPost, putModel: editPost, getByIdModel: getPostDetail } = useModel('baiviet');
	const { initialState } = useModel('@@initialState');
	const { getAllModel: getAllTags, danhSach: dsTags } = useModel('tags');
	const location = useLocation() as any;
	const editId = location.query?.id;

	const currentUser = initialState?.currentUser;

	const [title, setTitle] = useState<string>('');
	const [content, setContent] = useState<string>('');
	const [selectedTags, setSelectedTags] = useState<string[]>([]);
	const [submitting, setSubmitting] = useState<boolean>(false);

	useEffect(() => {
		getAllTags(false, undefined, undefined, undefined, 'all');
		if (editId) {
			getPostDetail(editId, false).then((post) => {
				if (post) {
					setTitle(post.title || '');
					setContent(post.content || '');
					setSelectedTags(post.tags || []);
				}
			});
		}
	}, [editId]);

	const handleSubmit = async () => {
		if (!title.trim()) {
			message.warning('Vui lòng nhập tiêu đề câu hỏi!');
			return;
		}
		if (title.trim().length < 10) {
			message.warning('Tiêu đề quá ngắn! Hãy viết rõ nghĩa hơn nhé.');
			return;
		}
		if (!content.trim()) {
			message.warning('Vui lòng nhập nội dung câu hỏi!');
			return;
		}

		setSubmitting(true);
		try {
			const payload = {
				title: title.trim(),
				content: content.trim(),
				tags: selectedTags,
			};

			if (editId) {
				await editPost(editId, payload, undefined, true, false, 'Cập nhật câu hỏi thành công!');
				history.push(`/question/${editId}`);
			} else {
				const newPost = await createPost(payload, undefined, false, 'Đăng câu hỏi thành công!');

				if (newPost && newPost._id) {
					history.push(`/question/${newPost._id}`);
				} else {
					history.push('/');
				}
			}
		} catch (error) {
			console.error('Lỗi khi tạo câu hỏi:', error);
			message.error('Không thể đăng câu hỏi. Vui lòng thử lại!');
		} finally {
			setSubmitting(false);
		}
	};

	return (
		<div style={{ maxWidth: '1000px', margin: '0 auto', padding: '16px 24px' }}>
			{/* Tiêu đề & Hướng dẫn */}
			<div style={{ marginBottom: '24px' }}>
				<h1 style={{ fontSize: '26px', fontWeight: 700, color: '#262626', marginBottom: '8px' }}>
					{editId ? 'Chỉnh sửa câu hỏi' : 'Đặt một câu hỏi công khai'}
				</h1>
				<p style={{ fontSize: '15px', color: '#595959', margin: 0 }}>
					Bạn đang gặp khó khăn? Đặt câu hỏi để nhận sự trợ giúp từ mọi người trong cộng đồng nhé.
				</p>
			</div>

			<Row gutter={[24, 24]}>
				{/* Cột chính nhập liệu */}
				<Col xs={24} lg={17}>
					<div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
						{/* 1. Nhập tiêu đề */}
						<Card
							bordered={false}
							style={{
								borderRadius: '12px',
								boxShadow: '0 4px 20px rgba(0, 0, 0, 0.05)',
							}}
							bodyStyle={{ padding: '24px' }}
						>
							<div style={{ marginBottom: '16px' }}>
								<span
									style={{ fontSize: '16px', fontWeight: 600, color: '#262626', display: 'block', marginBottom: '4px' }}
								>
									Tiêu đề câu hỏi
								</span>
								<span style={{ fontSize: '13px', color: '#8c8c8c', display: 'block' }}>
									Hãy viết ngắn gọn, mô tả đúng trọng tâm vấn đề bạn đang gặp phải.
								</span>
							</div>
							<Input
								allowClear
								placeholder='Ví dụ: Làm sao để sửa lỗi CORS khi kết nối React với NestJS?'
								value={title}
								onChange={(e) => setTitle(e.target.value)}
								style={{
									borderRadius: '6px',
									padding: '8px 12px',
									fontSize: '15px',
								}}
								maxLength={150}
							/>
						</Card>

						{/* 2. Nhập nội dung chi tiết */}
						<Card
							bordered={false}
							style={{
								borderRadius: '12px',
								boxShadow: '0 4px 20px rgba(0, 0, 0, 0.05)',
							}}
							bodyStyle={{ padding: '24px' }}
						>
							<div style={{ marginBottom: '16px' }}>
								<span
									style={{ fontSize: '16px', fontWeight: 600, color: '#262626', display: 'block', marginBottom: '4px' }}
								>
									Nội dung chi tiết
								</span>
								<span style={{ fontSize: '13px', color: '#8c8c8c', display: 'block' }}>
									Mô tả đầy đủ ngữ cảnh, cách làm hiện tại, lỗi nhận được và những gì bạn mong muốn.
								</span>
							</div>

							<div style={{ position: 'relative' }}>
								<ContentEditor
									inputId='question-content-input'
									value={content}
									onChange={setContent}
									placeholder='Nhập nội dung chi tiết của bạn tại đây. Bạn có thể sử dụng các nút định dạng ở trên để chèn code hoặc tải lên hình ảnh...'
									minRows={8}
									maxRows={20}
									disabled={submitting}
								/>
								{content && (
									<div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '8px' }}>
										<Button
											type='text'
											danger
											size='small'
											onClick={() => {
												Modal.confirm({
													title: 'Xóa nội dung',
													content: 'Bạn có chắc chắn muốn xóa toàn bộ nội dung đã viết?',
													okText: 'Xóa',
													cancelText: 'Hủy',
													okButtonProps: { danger: true },
													onOk: () => setContent(''),
												});
											}}
										>
											Xóa toàn bộ nội dung
										</Button>
									</div>
								)}
							</div>
						</Card>

						{/* 3. Gắn tag */}
						<Card
							bordered={false}
							style={{
								borderRadius: '12px',
								boxShadow: '0 4px 20px rgba(0, 0, 0, 0.05)',
							}}
							bodyStyle={{ padding: '24px' }}
						>
							<div style={{ marginBottom: '16px' }}>
								<span
									style={{ fontSize: '16px', fontWeight: 600, color: '#262626', display: 'block', marginBottom: '4px' }}
								>
									Thẻ từ khóa (Tags)
								</span>
								<span style={{ fontSize: '13px', color: '#8c8c8c', display: 'block' }}>
									Thêm tối đa 5 thẻ để mọi người dễ dàng tìm thấy câu hỏi của bạn.
								</span>
							</div>
							<Select
								allowClear
								mode='tags'
								style={{ width: '100%' }}
								placeholder='Chọn hoặc nhập từ khóa (ví dụ: ReactJS, NodeJS, CSS...)'
								value={selectedTags}
								onChange={(tags) => {
									if (tags.length <= 5) {
										setSelectedTags(tags);
									} else {
										message.warning('Chỉ được chọn tối đa 5 thẻ từ khóa thôi nhé!');
									}
								}}
								tokenSeparators={[',', ' ']}
							>
								{dsTags.map((tag) => (
									<Select.Option key={tag._id} value={tag.name}>
										{tag.name}
									</Select.Option>
								))}
							</Select>
						</Card>

						{/* Nút hành động */}
						<div
							style={{
								display: 'flex',
								gap: '12px',
								justifyContent: 'flex-start',
								marginTop: '4px',
								marginBottom: '32px',
							}}
						>
							<Button
								type='primary'
								onClick={handleSubmit}
								loading={submitting}
								disabled={submitting}
								style={{
									borderRadius: '6px',
									height: '42px',
									padding: '0 24px',
									fontSize: '15px',
									fontWeight: 600,
								}}
							>
								{editId ? 'Lưu thay đổi' : 'Đăng câu hỏi'}
							</Button>
							<Button
								onClick={() => {
									if (editId) {
										history.push(`/question/${editId}`);
									} else {
										history.push('/');
									}
								}}
								style={{
									borderRadius: '6px',
									height: '42px',
									padding: '0 24px',
									fontSize: '15px',
								}}
							>
								Hủy bỏ
							</Button>
						</div>
					</div>
				</Col>

				{/* Cột bên phải */}
				<Col xs={24} lg={7}>
					<SidebarPhai currentUser={currentUser} />
				</Col>
			</Row>
		</div>
	);
};

export default DatCauHoi;
