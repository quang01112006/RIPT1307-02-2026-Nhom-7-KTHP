import Footer from '@/components/Footer';
import RightContent from '@/components/RightContent';
import { notification } from 'antd';
import 'moment/locale/vi';
import type { RequestConfig, RunTimeLayoutConfig } from 'umi';
import { getIntl, getLocale, history } from 'umi';
import type { RequestOptionsInit, ResponseError } from 'umi-request';
import ErrorBoundary from './components/ErrorBoundary';
import TechnicalSupportBounder from './components/TechnicalSupportBounder';
import NotAccessible from './pages/exception/403';
import NotFoundContent from './pages/exception/404';
import type { IInitialState } from './services/base/typing';
import './styles/global.less';

export const initialStateConfig = {
	loading: <></>,
};

export async function getInitialState(): Promise<IInitialState> {
	// Lấy token từ localStorage (Dấu hiệu nhận biết đã đăng nhập)
	const token = localStorage.getItem('token');

	const whiteList = ['/user/login', '/user/register', '/user/forgot-password', '/user/reset-password'];
	if (!token && !whiteList.includes(history.location.pathname)) {
		history.replace('/user/login');
	}

	return {
		permissionLoading: false,
		currentUser: token ? ({ name: 'Admin', role: 'admin' } as any) : undefined,
	};
}

const authHeaderInterceptor = (url: string, options: RequestOptionsInit) => {
	const token = localStorage.getItem('token');
	return {
		headers: {
			...(token ? { Authorization: `Bearer ${token}` } : {}),
		},
	};
};

export const request: RequestConfig = {
	errorHandler: (error: ResponseError) => {
		const { messages } = getIntl(getLocale());
		const { response } = error;
		if (response && response.status) {
			notification.error({ message: `Lỗi ${response.status}: ${response.url}` });
		}
		throw error;
	},
	requestInterceptors: [authHeaderInterceptor],
};

export const layout: RunTimeLayoutConfig = ({ initialState }) => {
	return {
		unAccessible: (
			<TechnicalSupportBounder>
				<NotAccessible />
			</TechnicalSupportBounder>
		),
		noFound: <NotFoundContent />,
		rightContentRender: () => <RightContent />,
		disableContentMargin: false,
		footerRender: () => <Footer />,
		onPageChange: () => {
			const { location } = history;
			if (location.pathname === '/') history.replace('/dashboard');
		},
		menuItemRender: (item: any, dom: any) => (
			<a
				className='not-underline'
				key={item?.path}
				onClick={(e) => {
					e.preventDefault();
					history.push(item?.path ?? '/');
				}}
				style={{ display: 'block' }}
			>
				{dom}
			</a>
		),
		childrenRender: (dom) => <ErrorBoundary>{dom}</ErrorBoundary>,
		menuHeaderRender: undefined,
		...initialState?.settings,
	};
};
