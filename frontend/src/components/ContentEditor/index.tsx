import { uploadToCloudinary } from '@/services/cloudinaryService';
import { message } from 'antd';
import React, { useMemo, useRef, useState } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

interface ContentEditorProps {
	inputId?: string;
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
	disabled = false,
}: ContentEditorProps) => {
	const quillRef = useRef<ReactQuill>(null);
	const [uploadingImage, setUploadingImage] = useState(false);

	const imageHandler = () => {
		const input = document.createElement('input');
		input.setAttribute('type', 'file');
		input.setAttribute('accept', 'image/*');
		input.click();

		input.onchange = async () => {
			const file = input.files?.[0];
			if (!file) return;

			setUploadingImage(true);
			message.loading({ content: 'Đang tải ảnh lên...', key: 'uploadImage' });

			try {
				const imageUrl = await uploadToCloudinary(file);
				if (imageUrl) {
					const quill = quillRef.current?.getEditor();
					if (quill) {
						const range = quill.getSelection(true);
						quill.insertEmbed(range.index, 'image', imageUrl);
						quill.setSelection(range.index + 1, 0);
					}
					message.success({ content: 'Tải ảnh lên thành công!', key: 'uploadImage' });
				}
			} catch (error: any) {
				message.error({ content: error?.message || 'Không thể tải ảnh lên!', key: 'uploadImage' });
			} finally {
				setUploadingImage(false);
			}
		};
	};

	const modules = useMemo(
		() => ({
			toolbar: {
				container: [
					[{ header: [1, 2, 3, false] }],
					['bold', 'italic', 'underline', 'strike'],
					['blockquote', 'code-block'],
					[{ list: 'ordered' }, { list: 'bullet' }],
					['link', 'image'],
					['clean'],
				],
				handlers: {
					image: imageHandler,
				},
			},
		}),
		[],
	);

	return (
		<div className="custom-quill-editor" style={{ opacity: disabled || uploadingImage ? 0.6 : 1, pointerEvents: disabled || uploadingImage ? 'none' : 'auto' }}>
			<ReactQuill
				ref={quillRef}
				theme="snow"
				value={value}
				onChange={onChange}
				placeholder={placeholder}
				modules={modules}
				readOnly={disabled || uploadingImage}
				style={{ backgroundColor: '#fff', borderRadius: '8px' }}
			/>
		</div>
	);
};

export default ContentEditor;
