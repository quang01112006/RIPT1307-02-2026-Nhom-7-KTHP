import { getDashboardStats } from '@/services/Dashboard';
import { message } from 'antd';
import { useState } from 'react';

export default () => {
	const [loading, setLoading] = useState<boolean>(true);
	const [stats, setStats] = useState<Dashboard.IStatsResponse>();

	const getStatsModel = async () => {
		setLoading(true);
		try {
			const res: any = await getDashboardStats();
			setStats(res?.data?.data);
		} catch (error) {
			console.error('Lỗi khi lấy dữ liệu Dashboard:', error);
			message.error('Lỗi khi lấy dữ liệu thống kê!');
		} finally {
			setLoading(false);
		}
	};

	return {
		loading,
		stats,
		getStatsModel,
	};
};
