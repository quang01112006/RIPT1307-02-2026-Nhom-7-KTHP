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
	{
		path: '/dashboard',
		name: 'Trang chủ',
		component: './TrangChu',
		icon: 'HomeTwoTone',
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
		icon: 'EditTwoTone',
		component: './DatCauHoi',
	},
	{
		path: '/profile/:id',
		name: 'Hồ sơ cá nhân',
		component: './UserProfile',
		hideInMenu: true,
	},
	{
		path: '/notifications',
		name: 'Thông báo',
		icon: 'BellTwoTone',
		component: './Notifications',
	},
	{
		path: '/tags',
		name: 'Thẻ từ khóa',
		icon: 'TagsTwoTone',
		component: './Tags',
	},
	{
		path: '/tags/:name',
		name: 'Chi tiết thẻ',
		component: './Tags/TagDetail',
		hideInMenu: true,
	},
	{
		path: '/bookmarks',
		name: 'Bài viết đã lưu',
		icon: '/bookmark.svg',
		component: './Bookmarks',
	},
	{
		path: '/leaderboard',
		name: 'Bảng xếp hạng',
		icon: 'TrophyTwoTone',
		component: './Leaderboard',
	},

	// route admin
	{
		path: '/admin/dashboard',
		name: 'Trang chủ',
		icon: 'HomeOutlined',
		access: 'isAdmin',
		component: './Admin/Dashboard',
	},
	{
		path: '/admin/posts',
		name: 'Quản lý bài viết',
		icon: 'FileTextOutlined',
		access: 'isAdmin',
		component: './Admin/QuanLyBaiViet',
	},
	{
		path: '/admin/tags',
		name: 'Quản lý Tag',
		icon: 'TagsOutlined',
		access: 'isAdmin',
		component: './Admin/QuanLyTag',
	},
	{
		path: '/admin/users',
		name: 'Quản lý người dùng',
		icon: 'TeamOutlined',
		access: 'isAdmin',
		component: './Admin/QuanLyUser',
	},
	{
		path: '/admin/reports',
		name: 'Quản lý báo cáo',
		icon: 'FlagOutlined',
		access: 'isAdmin',
		component: './Admin/QuanLyBaoCao',
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
