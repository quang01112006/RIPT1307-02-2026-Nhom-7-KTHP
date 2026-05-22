export enum ENotificationSource {
	LOP_HANH_CHINH = 'LOP_HANH_CHINH',
}

export enum ESourceTypeNotification {
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

export enum EReceiverType {
	All = 'All',
	User = 'User',
	Khoa = 'Khoa',
	KhoaSinhVien = 'KhoaSinhVien',
	LopHanhChinh = 'LopHanhChinh',
	LopHocPhan = 'LopHocPhan',
	Nganh = 'Nganh',
}

export enum EVaiTroKhaoSat {
	SINH_VIEN = 'SINH_VIEN',
	NHAN_VIEN = 'NHAN_VIEN',
}

export enum NotificationType {
	ONESIGNAL = 'ONESIGNAL',
	EMAIL = 'EMAIL',
}

export enum LoaiDoiTuongThongBao {
	All = 'Tất cả',
	Khoa = 'Khoa',
	KhoaSinhVien = 'Khoa sinh viên',
	LopHanhChinh = 'Lớp hành chính',
	LopHocPhan = 'Lớp học phần',
	Nganh = 'Ngành',
}

export const TenVaiTroKhaoSat: Record<EVaiTroKhaoSat, string> = {
	[EVaiTroKhaoSat.SINH_VIEN]: 'Sinh viên',
	[EVaiTroKhaoSat.NHAN_VIEN]: 'Cán bộ',
};

export const mapModuleKey: Record<ESourceTypeNotification, string> = {
	[ESourceTypeNotification.CORE]: 'CORE',
	[ESourceTypeNotification.QLDT]: 'QLDT',
	[ESourceTypeNotification.TCNS]: 'TCNS',
	[ESourceTypeNotification.CTSV]: 'CTSV',
	[ESourceTypeNotification.VPS]: 'VPS',
	[ESourceTypeNotification.TC]: 'TC',
	[ESourceTypeNotification.QLKH]: 'QLKH',
	[ESourceTypeNotification.KT]: 'KT',
	[ESourceTypeNotification.CSVC]: 'CSVC',
	[ESourceTypeNotification.CONG_CAN_BO]: 'CONG_CAN_BO',
};

export const mapModuleKeyToSourceType: Record<string, ESourceTypeNotification> = {
	CORE: ESourceTypeNotification.CORE,
	QLDT: ESourceTypeNotification.QLDT,
	TCNS: ESourceTypeNotification.TCNS,
	CTSV: ESourceTypeNotification.CTSV,
	VPS: ESourceTypeNotification.VPS,
	TC: ESourceTypeNotification.TC,
	QLKH: ESourceTypeNotification.QLKH,
	KT: ESourceTypeNotification.KT,
	CSVC: ESourceTypeNotification.CSVC,
	CONG_CAN_BO: ESourceTypeNotification.CONG_CAN_BO,
};

export const mapUrlNotifSource: Record<ENotificationSource, string> = {
	[ENotificationSource.LOP_HANH_CHINH]: '/lop-hanh-chinh/',
};
