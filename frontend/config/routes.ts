export default [
	{
		path: '/user',
		layout: false,
		routes: [
			{
				path: '/user/login',
				layout: false,
				name: 'login',
				component: './user/Login',
			},
			{
				path: '/user/register',
				layout: false,
				name: 'register',
				component: './user/Register',
			},
			{
				path: '/user/forgot-password',
				layout: false,
				name: 'forgot-password',
				component: './user/ForgotPassword',
			},
			{
				path: '/user/reset-password',
				layout: false,
				name: 'reset-password',
				component: './user/ResetPassword',
			},
			{
				path: '/user',
				redirect: '/user/login',
			},
		],
	},

	///////////////////////////////////
	// DEFAULT MENU
	{
		path: '/dashboard',
		name: 'Trang chủ',
		component: './TrangChu',
		icon: 'HomeOutlined',
		access: 'isUser',
	},
	{
		path: '/question/:id',
		name: 'Chi tiết câu hỏi',
		component: './ChiTietBaiViet',
		hideInMenu: true,
	},
	{
		path: '/ask',
		name: 'Đặt câu hỏi',
		component: './DatCauHoi',
	},
	{
		path: '/profile/:id',
		name: 'Hồ sơ cá nhân',
		component: './UserProfile',
		hideInMenu: true,
	},

	// route admin
	{
		path: '/admin/dashboard',
		name: 'Trang chủ',
		icon: 'DashboardOutlined',
		access: 'isAdmin',
		component: './Admin/Dashboard',
	},
	{
		path: '/admin/posts',
		name: 'Quản lý bài viết',
		icon: '',
		access: 'isAdmin',
		component: './Admin/QuanLyBaiViet',
	},
	{
		path: '/admin/tags',
		name: 'Quản lý Tag',
		icon: '',
		access: 'isAdmin',
		component: './Admin/QuanLyTag',
	},
	{
		path: '/admin/users',
		name: 'Quản lý người dùng',
		icon: 'UserOutlined',
		access: 'isAdmin',
		component: './Admin/QuanLyUser',
	},

	{
		path: '/',
		redirect: 'dashboard',
	},
	{
		path: '/403',
		component: './exception/403/403Page',
		layout: false,
	},
	{
		path: '/hold-on',
		component: './exception/DangCapNhat',
		layout: false,
	},
	{
		component: './exception/404',
	},
];
