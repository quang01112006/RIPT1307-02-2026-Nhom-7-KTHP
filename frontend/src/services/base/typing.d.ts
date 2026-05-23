import { ERole } from './constant';
import type { Settings as LayoutSettings } from '@ant-design/pro-layout';

export interface IInitialState {
	settings?: Partial<LayoutSettings>;
	currentUser?: Login.IUser;
	permissionLoading?: boolean;
	authorizedPermissions?: any[];
}

declare module Login {
	export interface IUser {
		_id: string;
		fullName: string;
		email: string;
		code?: string; //mã gv  hoặc mã sv
		role: ERole;
		avatar?: string;
		isActive: boolean;
		bookmarks?: string[];
		createdAt: string;
		updatedAt: string;
	}

	export interface ILoginResponse {
		access_token: string;
		user: IUser;
	}

	export interface IFile {
		_id: string;
		url: string;
		mimetype: string;
		author: string;
		createdAt: string;
	}
}
