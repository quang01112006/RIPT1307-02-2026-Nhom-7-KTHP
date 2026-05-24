import styles from '@/pages/ChiTietBaiViet/index.less';
import { uploadToCloudinary } from '@/services/cloudinaryService';
import {
	BoldOutlined,
	CodeOutlined,
	CommentOutlined,
	EditOutlined,
	EyeOutlined,
	ItalicOutlined,
	LinkOutlined,
	PictureOutlined,
} from '@ant-design/icons';
import { Button, Input, Tooltip, message } from 'antd';
import React, { useState } from 'react';

interface ContentEditorProps {
	inputId: string;
	value: string;
	onChange: (val: string) => void;
	placeholder?: string;
	minRows?: number;
	maxRows?: number;
	disabled?: boolean;
}

const ContentEditor = ({
	inputId,
	value,
	onChange,
	placeholder = 'Nhập nội dung...',
	minRows = 6,
	maxRows = 12,
	disabled = false,
}: ContentEditorProps) => {
	const [mode, setMode] = useState<'edit' | 'preview'>('edit');
	const [uploadingImage, setUploadingImage] = useState(false);

	const insertFormatting = (prefix: string, suffix: string) => {
		const textarea = document.getElementById(inputId) as HTMLTextAreaElement;
		if (!textarea) return;

		const start = textarea.selectionStart;
		const end = textarea.selectionEnd;
		const text = textarea.value;
		const selectedText = text.substring(start, end);
		const newValue = text.substring(0, start) + prefix + (selectedText || '') + suffix + text.substring(end);

		onChange(newValue);

		setTimeout(() => {
			textarea.focus();
			textarea.setSelectionRange(start + prefix.length, start + prefix.length + (selectedText || '').length);
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
					insertFormatting(
						`\n<img src="${imageUrl}" alt="image" style="max-width: 100%; border-radius: 8px; margin: 8px 0;" />\n`,
						'',
					);
					message.success('Tải ảnh lên thành công!');
				}
			} catch (error: any) {
				message.error(error?.message || 'Không thể tải ảnh lên!');
			} finally {
				setUploadingImage(false);
			}
		};
		input.click();
	};

	return (
		<div>
			<div style={{ display: 'flex', borderBottom: '1px solid #f0f0f0', marginBottom: '12px' }}>
				{(['edit', 'preview'] as const).map((tab) => (
					<div
						key={tab}
						onClick={() => setMode(tab)}
						style={{
							padding: '8px 16px',
							cursor: 'pointer',
							fontWeight: mode === tab ? 600 : 400,
							borderBottom: mode === tab ? '2px solid #1890ff' : '2px solid transparent',
							color: mode === tab ? '#1890ff' : '#595959',
							display: 'flex',
							alignItems: 'center',
							gap: '6px',
							fontSize: '14px',
							transition: 'all 0.2s',
						}}
					>
						{tab === 'edit' ? (
							<>
								<EditOutlined /> Viết
							</>
						) : (
							<>
								<EyeOutlined /> Xem trước
							</>
						)}
					</div>
				))}
			</div>

			{mode === 'edit' ? (
				<div>
					{/* toolbar định dạng */}
					<div
						style={{
							display: 'flex',
							gap: '6px',
							flexWrap: 'wrap',
							background: '#f5f5f5',
							padding: '6px 8px',
							border: '1px solid #d9d9d9',
							borderBottom: 'none',
							borderTopLeftRadius: '8px',
							borderTopRightRadius: '8px',
						}}
					>
						{[
							{ icon: <BoldOutlined />, title: 'In đậm', pre: '<b>', suf: '</b>' },
							{ icon: <ItalicOutlined />, title: 'In nghiêng', pre: '<i>', suf: '</i>' },
							{
								icon: <CodeOutlined />,
								title: 'Khối code ',
								pre: '<pre><code>\n',
								suf: '\n</code></pre>',
							},
							{
								icon: <LinkOutlined />,
								title: 'Đường dẫn (link)',
								pre: '<a href="https://example.com" target="_blank">',
								suf: '</a>',
							},
							{
								icon: <CommentOutlined />,
								title: 'Trích dẫn',
								pre: '<blockquote>',
								suf: '</blockquote>',
							},
						].map((item, i) => (
							<Tooltip key={i} title={item.title}>
								<Button
									size='small'
									type='text'
									icon={item.icon}
									onClick={() => insertFormatting(item.pre, item.suf)}
									style={{ color: '#595959' }}
								/>
							</Tooltip>
						))}
						<Tooltip title='Tải ảnh lên'>
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
						id={inputId}
						placeholder={placeholder}
						value={value}
						onChange={(e) => onChange(e.target.value)}
						autoSize={{ minRows, maxRows }}
						disabled={disabled}
						style={{
							borderTopLeftRadius: 0,
							borderTopRightRadius: 0,
							borderBottomLeftRadius: '8px',
							borderBottomRightRadius: '8px',
							border: '1px solid #d9d9d9',
							padding: '12px 16px',
							fontSize: '14px',
							boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
						}}
					/>
				</div>
			) : (
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
						whiteSpace: 'pre-wrap',
					}}
				>
					{value ? (
						<div className={styles.postContent} dangerouslySetInnerHTML={{ __html: value }} />
					) : (
						<span style={{ color: '#8c8c8c', fontStyle: 'italic' }}>Nội dung xem trước sẽ hiển thị ở đây...</span>
					)}
				</div>
			)}
		</div>
	);
};

export default ContentEditor;
