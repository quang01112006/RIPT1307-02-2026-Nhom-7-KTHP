import { UserOutlined } from '@ant-design/icons';
import { Avatar, Button, Input } from 'antd';
import React, { useState } from 'react';

interface ReplyFormProps {
	commentId: string;
	authorName: string;
	avatar?: string;
	onSubmit: (content: string) => Promise<void>;
	onCancel: () => void;
}

const ReplyForm: React.FC<ReplyFormProps> = ({ commentId, authorName, avatar, onSubmit, onCancel }) => {
	const [replyContent, setReplyContent] = useState<string>('');
	const [submitting, setSubmitting] = useState<boolean>(false);

	const handleFormSubmit = async () => {
		if (!replyContent.trim()) return;
		setSubmitting(true);
		try {
			await onSubmit(replyContent.trim());
			setReplyContent('');
			onCancel();
		} catch (error) {
			console.error('Lỗi khi gửi phản hồi:', error);
		} finally {
			setSubmitting(false);
		}
	};

	return (
		<div style={{ display: 'flex', gap: '12px', marginTop: '12px', paddingLeft: '24px', alignItems: 'flex-start' }}>
			<Avatar src={avatar} icon={<UserOutlined />} size='small' style={{ width: '24px', height: '24px', marginTop: '4px' }} />
			<div style={{ flex: 1 }}>
				<Input.TextArea
					placeholder={`Phản hồi @${authorName}...`}
					value={replyContent}
					onChange={(e) => setReplyContent(e.target.value)}
					autoSize={{ minRows: 1, maxRows: 6 }}
					style={{
						borderRadius: '8px',
						border: '1px solid #d9d9d9',
						padding: '8px 12px',
						fontSize: '14px',
					}}
					disabled={submitting}
				/>
				<div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '8px' }}>
					<Button
						type='text'
						size='small'
						style={{ fontSize: '13px', color: '#595959', borderRadius: '4px' }}
						onClick={onCancel}
						disabled={submitting}
					>
						Hủy
					</Button>
					<Button
						type='primary'
						size='small'
						style={{ fontSize: '13px', borderRadius: '4px' }}
						disabled={!replyContent.trim() || submitting}
						loading={submitting}
						onClick={handleFormSubmit}
					>
						Phản hồi
					</Button>
				</div>
			</div>
		</div>
	);
};

export default ReplyForm;
