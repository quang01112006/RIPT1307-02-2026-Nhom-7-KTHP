import useInitModel from '@/hooks/useInitModel';
import { ip3 } from '@/utils/ip';

export default () => {
	const objInit = useInitModel<Tags.IRecord>('tags', undefined, undefined, ip3);

	return {
		...objInit,
	};
};
