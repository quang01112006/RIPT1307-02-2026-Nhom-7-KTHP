import Footer from '@/components/Footer';
import RightContent from '@/components/RightContent';
import { getMe } from '@/services/base/api';
import { notification } from 'antd';
import 'moment/locale/vi';
import type { RequestConfig, RunTimeLayoutConfig } from 'umi';
import { history } from 'umi';
import type { RequestOptionsInit, ResponseError } from 'umi-request';
import defaultSettings from '../config/defaultSettings';
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
	const token = localStorage.getItem('token');
	const guestWhiteList = ['/user/login', '/user/register', '/dashboard', '/explore'];
	const { pathname } = history.location;

	if (!token) {
		if (!guestWhiteList.some((path) => pathname.startsWith(path))) {
			if (pathname.startsWith('/admin') || pathname.startsWith('/profile')) {
				history.replace('/user/login');
			}
		}
		return {
			permissionLoading: false,
			settings: defaultSettings,
		};
	}

	try {
		const response: any = await getMe();
		const userData = response.data?.data || response.data || response;
		return {
			permissionLoading: false,
			currentUser: userData,
			settings: defaultSettings,
		};
	} catch (error) {
		localStorage.removeItem('token');
		if (!guestWhiteList.includes(pathname)) {
			history.replace('/user/login');
		}
		return {
			permissionLoading: false,
			settings: defaultSettings,
		};
	}
}

const authHeaderInterceptor = (url: string, options: RequestOptionsInit) => {
	const token = localStorage.getItem('token');
	return {
		url,
		options: {
			...options,
			headers: {
				...(options.headers || {}),
				...(token ? { Authorization: `Bearer ${token}` } : {}),
			},
		},
	};
};

export const request: RequestConfig = {
	errorHandler: (error: ResponseError) => {
		const { response } = error;
		if (response && response.status) {
			notification.error({ message: `Lỗi ${response.status}: ${response.url}` });
		}
		throw error;
	},
	requestInterceptors: [authHeaderInterceptor],
};

export const layout: RunTimeLayoutConfig = ({ initialState }) => {
	const role = initialState?.currentUser?.role;

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
			if (location.pathname === '/') {
				if (role === 'admin') history.replace('/admin/dashboard');
				else history.replace('/dashboard');
			}
		},
		layout: 'mix',
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
		menuDataRender: (menuData: any[]) => {
			return menuData.filter((item) => {
				if (item.access === 'isAdmin' && role !== 'admin') {
					return false;
				}
				if (item.access === 'isUser' && role === 'admin') {
					return false;
				}
				return true;
			});
		},
		childrenRender: (dom) => <ErrorBoundary>{dom}</ErrorBoundary>,
		menuHeaderRender: undefined,
		onMenuHeaderClick: () => {
			if (role === 'admin') {
				history.push('/admin/dashboard');
			} else {
				history.push('/dashboard');
			}
		},
		...initialState?.settings,
	};
};
