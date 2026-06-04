import Footer from '@/components/Footer';
import RightContent from '@/components/RightContent';
import { getMe } from '@/services/base/api';
import { ERole } from '@/services/base/constant';
import { notification } from 'antd';
import 'moment/locale/vi';
import type { RequestConfig, RunTimeLayoutConfig } from 'umi';
import { getIntl, getLocale, history } from 'umi';
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
	const guestWhiteList = ['/user/login', '/user/register', '/', '/explore'];
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
			// (Đã xóa redirect / vì / giờ là trang diễn đàn)
		},
		layout: 'mix',
		menuItemRender: (item: any, dom: any) => {
			const protectedPaths = ['/ask', '/notifications', '/bookmarks', '/profile'];
			const isProtected = protectedPaths.some((p) => item?.path?.startsWith(p));
			const isLogin = !!initialState?.currentUser;

			const handleClick = (e: React.MouseEvent) => {
				e.preventDefault();
				if (isProtected && !isLogin) {
					import('antd').then(({ Modal, Button }) => {
						Modal.info({
							title: null,
							icon: null,
							content: (
								<div style={{ textAlign: 'center', paddingTop: 8, paddingBottom: 8 }}>
									<div style={{ marginBottom: 28 }}>
										<div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, marginBottom: 16 }}>
											<img src='/logo.png' alt='EduStack Logo' style={{ width: 48, height: 48, objectFit: 'contain' }} />
											<span style={{ fontSize: 28, fontWeight: 700, color: '#1f1f1f' }}>EduStack</span>
										</div>
										<h2 style={{ fontSize: 24, fontWeight: 700, color: '#111827', margin: 0, letterSpacing: '-0.02em' }}>
											Tham gia cộng đồng
										</h2>
										<p style={{ color: '#6B7280', fontSize: 15, marginTop: 10, marginBottom: 0, lineHeight: 1.5, padding: '0 10px' }}>
											Đăng nhập để đặt câu hỏi, bình chọn và thảo luận cùng hàng ngàn sinh viên khác.
										</p>
									</div>
									<div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
										<Button
											type='primary'
											size='large'
											style={{ width: '100%', borderRadius: 12, height: 48, fontWeight: 600, fontSize: 16, background: '#1890ff', borderColor: '#1890ff', boxShadow: '0 4px 6px -1px rgba(24, 144, 255, 0.2)' }}
											onClick={() => {
												Modal.destroyAll();
												history.push('/user/login');
											}}
										>
											Đăng nhập ngay
										</Button>
										<Button
											size='large'
											style={{ width: '100%', borderRadius: 12, height: 48, fontWeight: 600, fontSize: 16, color: '#1890ff', border: '1px solid #1890ff' }}
											onClick={() => {
												Modal.destroyAll();
												history.push('/user/register');
											}}
										>
											Tạo tài khoản mới
										</Button>
									</div>
								</div>
							),
							okButtonProps: { style: { display: 'none' } },
							maskClosable: true,
							closable: true,
							centered: true,
							className: 'rounded-modal',
							width: 480,
						});
					});
				} else {
					history.push(item?.path ?? '/');
				}
			};

			return (
				<a className='not-underline' key={item?.path} onClick={handleClick} style={{ display: 'block' }}>
					{dom}
				</a>
			);
		},
		menuDataRender: (menuData: any[]) => {
			const currentPath = history.location.pathname;
			const isAdminContext = currentPath.startsWith('/admin');

			return menuData.filter((item) => {
				if (item.path === '/index.html') return false;

				const isAdminRoute = item.path && item.path.startsWith('/admin');

				// Không phải admin thì ẩn các menu admin (vì Umi có thể strip access property)
				if (isAdminRoute && role !== ERole.ADMIN) {
					return false;
				}

				// Nếu là admin, quyết định menu dựa trên URL hiện tại
				if (role === ERole.ADMIN) {
					if (isAdminContext) {
						// Đang ở trang Admin -> Chỉ hiện menu Admin
						return isAdminRoute;
					} else {
						// Đang ở trang diễn đàn -> Chỉ hiện menu diễn đàn
						return !isAdminRoute;
					}
				}
				return true;
			});
		},
		childrenRender: (dom) => <ErrorBoundary>{dom}</ErrorBoundary>,
		menuHeaderRender: undefined,
		onMenuHeaderClick: () => {
			const currentPath = history.location.pathname;
			if (role === ERole.ADMIN && currentPath.startsWith('/admin')) {
				history.push('/admin/dashboard');
			} else {
				history.push('/');
			}
		},
		...initialState?.settings,
	};
};
