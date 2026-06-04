import TinyEditor from '@/components/TinyEditor';
import { UserOutlined } from '@ant-design/icons';
import { Avatar, Button } from 'antd';
import React, { useState } from 'react';

interface AnswerFormProps {
	currentUserAvatar?: string;
	onSubmit: (content: string) => Promise<void>;
}

const AnswerForm = ({ currentUserAvatar, onSubmit }: AnswerFormProps) => {
	const [answerContent, setAnswerContent] = useState<string>('');
	const [submitting, setSubmitting] = useState<boolean>(false);

	const handleFormSubmit = async () => {
		if (!answerContent.trim()) return;
		setSubmitting(true);
		try {
			await onSubmit(answerContent.trim());
			setAnswerContent('');
		} catch (error) {
			console.error('Lỗi khi đăng câu trả lời:', error);
		} finally {
			setSubmitting(false);
		}
	};

	return (
		<div id="main-answer-input" style={{ marginTop: '32px', borderTop: '1px solid #f0f0f0', paddingTop: '24px' }}>
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
					<div style={{ position: 'relative', border: '1px solid #d9d9d9', borderRadius: '8px', overflow: 'hidden' }}>
						<TinyEditor
							value={answerContent}
							onChange={setAnswerContent}
							disabled={submitting}
							minHeight={150}
							hideMenubar={true}
							stickyToolbar={false}
							miniToolbar={true}
						/>
					</div>

					<div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '12px' }}>
						<Button
							type="primary"
							disabled={!answerContent.trim() || submitting}
							loading={submitting}
							onClick={handleFormSubmit}
							style={{ borderRadius: '6px', padding: '4px 20px', height: '38px', fontSize: '14px', fontWeight: 500 }}
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
