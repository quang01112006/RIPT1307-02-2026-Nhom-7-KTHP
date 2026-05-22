/** Đường link landing page */
export const landingUrl = APP_CONFIG_URL_LANDING;

/** Màu sắc chủ đạo */
export const primaryColor = APP_CONFIG_PRIMARY_COLOR;

/** Tên trường Học viện */
export const unitName = APP_CONFIG_TEN_TRUONG;

/** Cơ quan chủ quản của trường */
export const coQuanChuQuan = APP_CONFIG_CO_QUAN_CHU_QUAN;

/** Trường / Học viện */
export const unitPrefix = APP_CONFIG_TIEN_TO_TRUONG;

/** Tên tiếng anh của trường */
export const tenTruongVietTatTiengAnh = APP_CONFIG_TEN_TRUONG_VIET_TAT_TIENG_ANH;

/** Cài đặt hệ thống */
export enum ESettingKey {
	KEY = 'KEY',
}

/** Định dạng file */
export enum EDinhDangFile {
	WORD = 'word',
	EXCEL = 'excel',
	POWERPOINT = 'powerpoint',
	PDF = 'pdf',
	IMAGE = 'image',
	VIDEO = 'video',
	AUDIO = 'audio',
	TEXT = 'text',
	UNKNOWN = 'unknown',
}

export enum EScopeFile {
	PUBLIC = 'Public',
	INTERNAL = 'Internal',
	PRIVATE = 'Private',
}

export enum EStorageFile {
	DATABASE = 'Database',
	S3 = 'S3',
}

export enum ERole {
	ADMIN = 'admin',
	STUDENT = 'student',
	TEACHER = 'teacher',
}

export enum EModuleKey {
	CONNECT = 'CONNECT',
	CORE = 'CORE',
	QLDT = 'QLDT',
	TCNS = 'TCNS',
	CTSV = 'CTSV',
	VPS = 'VPS',
	TC = 'TC',
	QLKH = 'QLKH',
	KT = 'KT',
	CSVC = 'CSVC',
	CONG_CAN_BO = 'CONG_CAN_BO',
}

export interface IAppModule {
	url: string;
	title: string;
	icon?: string;
	clientId?: string;
}

export const AppModules: Record<string, IAppModule> = {
	[EModuleKey.CONNECT]: { url: APP_CONFIG_URL_CONNECT ?? '/', title: 'Cổng thông tin' },
	[EModuleKey.CORE]: { url: APP_CONFIG_URL_CORE ?? '/', title: 'Cổng chính' },
	[EModuleKey.QLDT]: { url: APP_CONFIG_URL_DAO_TAO ?? '/', title: 'Quản lý đào tạo' },
	[EModuleKey.TCNS]: { url: APP_CONFIG_URL_NHAN_SU ?? '/', title: 'Tài chính - Nhân sự' },
	[EModuleKey.CTSV]: { url: APP_CONFIG_URL_CTSV ?? '/', title: 'Công tác sinh viên' },
	[EModuleKey.VPS]: { url: APP_CONFIG_URL_VPS ?? '/', title: 'Văn phòng sở' },
	[EModuleKey.TC]: { url: APP_CONFIG_URL_TAI_CHINH ?? '/', title: 'Tài chính' },
	[EModuleKey.QLKH]: { url: APP_CONFIG_URL_QLKH ?? '/', title: 'Quản lý khoa' },
	[EModuleKey.KT]: { url: APP_CONFIG_URL_KHAO_THI ?? '/', title: 'Khảo thí' },
	[EModuleKey.CSVC]: { url: APP_CONFIG_URL_CSVC ?? '/', title: 'Cơ sở vật chất' },
	[EModuleKey.CONG_CAN_BO]: { url: APP_CONFIG_URL_CAN_BO ?? '/', title: 'Cổng cán bộ' },
};

export const moduleCongThongTin: IAppModule = {
	url: APP_CONFIG_URL_CONNECT ?? '/',
	title: 'Cổng thông tin',
};
export const moduleQuanLyVanBan: IAppModule = {
	url: APP_CONFIG_URL_QLVB ?? '/',
	title: 'Quản lý văn bản',
};
export const moduleThuVien: IAppModule = {
	url: APP_CONFIG_URL_THU_VIEN ?? '/',
	title: 'Thư viện',
};
