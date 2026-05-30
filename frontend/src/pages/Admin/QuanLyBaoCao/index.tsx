import { message } from 'antd';
import React, { useEffect } from 'react';
import { useModel } from 'umi';

const QuanLyBaoCao: React.FC = () => {
	const { danhSach: reports, getModel, putModel, loading, page, limit, total, setPage } = useModel('reports');

	useEffect(() => {
		getModel();
	}, []);

	const handleResolve = async (id: string) => {
		try {
			await putModel(id, { status: 'RESOLVED' });
			message.success('Đã đánh dấu báo cáo là đã xử lý');
			getModel();
		} catch (error) {
			message.error('Lỗi khi cập nhật báo cáo');
		}
	};

	return <>hehe</>;
};

export default QuanLyBaoCao;
