import useInitModel from '@/hooks/useInitModel';
import { ip3 } from '@/utils/ip';
import { getUserProfile } from '@/services/base/api';
import { message } from 'antd';
import { history } from 'umi';

export default () => {
	const objInit = useInitModel<any>('users', undefined, undefined, ip3);
	const { setLoading, setRecord } = objInit;

	const fetchUser = async (id: string) => {
		setLoading(true);
		try {
			const res = await getUserProfile(id);
			setRecord(res?.data?.data || res?.data);
		} catch (error) {
			message.error('Không tìm thấy người dùng!');
			history.push('/404');
		} finally {
			setLoading(false);
		}
	};

	return {
		...objInit,
		fetchUser,
	};
};
