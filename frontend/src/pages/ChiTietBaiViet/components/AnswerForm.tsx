import {
	BoldOutlined,
	CodeOutlined,
	CommentOutlined,
	EditOutlined,
	EyeOutlined,
	ItalicOutlined,
	LinkOutlined,
	PictureOutlined,
	UserOutlined,
} from '@ant-design/icons';
import { Avatar, Button, Input, Tooltip, message } from 'antd';
import React, { useState } from 'react';
import styles from '../index.less';
import { uploadToCloudinary } from '@/services/cloudinaryService';

interface AnswerFormProps {
	currentUserAvatar?: string;
	onSubmit: (content: string) => Promise<void>;
}

const AnswerForm: React.FC<AnswerFormProps> = ({ currentUserAvatar, onSubmit }) => {
	const [answerContent, setAnswerContent] = useState<string>('');
	const [submitting, setSubmitting] = useState<boolean>(false);
	const [uploadingImage, setUploadingImage] = useState<boolean>(false);
	const [mode, setMode] = useState<'edit' | 'preview'>('edit');

	const insertFormatting = (prefix: string, suffix: string) => {
		const textarea = document.getElementById('main-answer-input') as HTMLTextAreaElement;
		if (!textarea) return;

		const start = textarea.selectionStart;
		const end = textarea.selectionEnd;
		const text = textarea.value;
		const selectedText = text.substring(start, end);

		const replacement = prefix + (selectedText || '') + suffix;
		const newValue = text.substring(0, start) + replacement + text.substring(end);
		
		setAnswerContent(newValue);

		// Trỏ ngược con trỏ chuột lại vị trí cũ để soạn thảo liên tục
		setTimeout(() => {
			textarea.focus();
			textarea.setSelectionRange(
				start + prefix.length,
				start + prefix.length + (selectedText || '').length
			);
		}, 0);
	};

	const handleImageUpload = () => {
		const input = document.createElement('input');
		input.type = 'file';
		input.accept = 'image/*';
		input.onchange = async (e: any) => {
			const file = e.target.files?.[0];
			if (!file) return;

			setUploadingImage(true);
			try {
				const imageUrl = await uploadToCloudinary(file);
				if (imageUrl) {
					// Chèn thẻ <img> vào editor
					insertFormatting(
						`\n<img src="${imageUrl}" alt="image" style="max-width: 100%; border-radius: 8px; margin: 8px 0;" />\n`,
						''
					);
					message.success('Tải ảnh lên thành công!');
				}
			} catch (error: any) {
				console.error('Lỗi khi upload ảnh:', error);
				message.error(error?.message || 'Không thể tải ảnh lên. Vui lòng kiểm tra lại cấu hình!');
			} finally {
				setUploadingImage(false);
			}
		};
		input.click();
	};

	const handleFormSubmit = async () => {
		if (!answerContent.trim()) return;
		setSubmitting(true);
		try {
			await onSubmit(answerContent.trim());
			setAnswerContent('');
			setMode('edit'); // Trở lại tab viết sau khi đăng thành công
		} catch (error) {
			console.error('Lỗi khi đăng câu trả lời:', error);
		} finally {
			setSubmitting(false);
		}
	};

	return (
		<div style={{ marginTop: '32px', borderTop: '1px solid #f0f0f0', paddingTop: '24px' }}>
			<div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start', marginBottom: '16px' }}>
				<Avatar
					src={currentUserAvatar}
					icon={<UserOutlined />}
					style={{ width: '36px', height: '36px', flexShrink: 0 }}
				/>
				<div style={{ flex: 1 }}>
					<span style={{ fontSize: '15px', fontWeight: 500, color: '#262626', display: 'block', marginBottom: '12px' }}>
						Viết câu trả lời của bạn
					</span>

					{/* Thanh Tab chuyển chế độ GitHub-style */}
					<div style={{ display: 'flex', borderBottom: '1px solid #f0f0f0', marginBottom: '12px' }}>
						<div
							onClick={() => setMode('edit')}
							style={{
								padding: '8px 16px',
								cursor: 'pointer',
								fontWeight: mode === 'edit' ? 600 : 400,
								borderBottom: mode === 'edit' ? '2px solid #1890ff' : '2px solid transparent',
								color: mode === 'edit' ? '#1890ff' : '#595959',
								display: 'flex',
								alignItems: 'center',
								gap: '6px',
								fontSize: '14px',
								transition: 'all 0.2s',
							}}
						>
							<EditOutlined /> Viết
						</div>
						<div
							onClick={() => setMode('preview')}
							style={{
								padding: '8px 16px',
								cursor: 'pointer',
								fontWeight: mode === 'preview' ? 600 : 400,
								borderBottom: mode === 'preview' ? '2px solid #1890ff' : '2px solid transparent',
								color: mode === 'preview' ? '#1890ff' : '#595959',
								display: 'flex',
								alignItems: 'center',
								gap: '6px',
								fontSize: '14px',
								transition: 'all 0.2s',
							}}
						>
							<EyeOutlined /> Xem trước
						</div>
					</div>

					{mode === 'edit' ? (
						<div>
							{/* Thanh công cụ định dạng nhanh */}
							<div
								style={{
									display: 'flex',
									gap: '6px',
									background: '#f5f5f5',
									padding: '6px 8px',
									borderTopLeftRadius: '8px',
									borderTopRightRadius: '8px',
									border: '1px solid #d9d9d9',
									borderBottom: 'none',
									flexWrap: 'wrap',
								}}
							>
								<Tooltip title='Bôi đậm (<b>)'>
									<Button
										size='small'
										type='text'
										icon={<BoldOutlined />}
										onClick={() => insertFormatting('<b>', '</b>')}
										style={{ color: '#595959' }}
									/>
								</Tooltip>
								<Tooltip title='In nghiêng (<i>)'>
									<Button
										size='small'
										type='text'
										icon={<ItalicOutlined />}
										onClick={() => insertFormatting('<i>', '</i>')}
										style={{ color: '#595959' }}
									/>
								</Tooltip>
								<Tooltip title='Khối mã nguồn (<pre><code>)'>
									<Button
										size='small'
										type='text'
										icon={<CodeOutlined />}
										onClick={() => insertFormatting('<pre><code>', '</code></pre>')}
										style={{ color: '#595959' }}
									/>
								</Tooltip>
								<Tooltip title='Đường liên kết (<a>)'>
									<Button
										size='small'
										type='text'
										icon={<LinkOutlined />}
										onClick={() =>
											insertFormatting(
												'<a href="https://example.com" target="_blank">',
												'</a>'
											)
										}
										style={{ color: '#595959' }}
									/>
								</Tooltip>
								<Tooltip title='Trích dẫn (<blockquote>)'>
									<Button
										size='small'
										type='text'
										icon={<CommentOutlined />}
										onClick={() => insertFormatting('<blockquote>', '</blockquote>')}
										style={{ color: '#595959' }}
									/>
								</Tooltip>
								<Tooltip title='Tải ảnh lên (Cloudinary)'>
									<Button
										size='small'
										type='text'
										icon={<PictureOutlined />}
										loading={uploadingImage}
										onClick={handleImageUpload}
										style={{ color: '#595959' }}
									/>
								</Tooltip>
							</div>

							<Input.TextArea
								id='main-answer-input'
								placeholder='Chia sẻ câu trả lời của bạn, nhớ viết chi tiết và rõ ràng nhé...'
								value={answerContent}
								onChange={(e) => setAnswerContent(e.target.value)}
								autoSize={{ minRows: 6, maxRows: 12 }}
								style={{
									borderTopLeftRadius: '0px',
									borderTopRightRadius: '0px',
									borderBottomLeftRadius: '8px',
									borderBottomRightRadius: '8px',
									border: '1px solid #d9d9d9',
									padding: '12px 16px',
									fontSize: '14px',
									boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
								}}
								disabled={submitting}
							/>
						</div>
					) : (
						/* Chế độ xem trước thời gian thực */
						<div
							style={{
								minHeight: '140px',
								padding: '16px 20px',
								border: '1px solid #d9d9d9',
								borderRadius: '8px',
								background: '#fafafa',
								fontSize: '15px',
								lineHeight: '1.6',
								color: '#262626',
								wordBreak: 'break-word',
								boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.02)',
								whiteSpace: 'pre-wrap',
							}}
						>
							{answerContent ? (
								<div
									className={styles.postContent}
									dangerouslySetInnerHTML={{ __html: answerContent }}
								/>
							) : (
								<span style={{ color: '#8c8c8c', fontStyle: 'italic' }}>
									Nội dung xem trước sẽ hiển thị ở đây khi bạn bắt đầu viết...
								</span>
							)}
						</div>
					)}

					<div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '12px' }}>
						<Button
							type='primary'
							disabled={!answerContent.trim() || submitting}
							loading={submitting}
							onClick={handleFormSubmit}
							style={{
								borderRadius: '6px',
								padding: '4px 20px',
								height: '38px',
								fontSize: '14px',
								fontWeight: 500,
							}}
						>
							Đăng câu trả lời
						</Button>
					</div>
				</div>
			</div>
		</div>
	);
};

export default AnswerForm;
