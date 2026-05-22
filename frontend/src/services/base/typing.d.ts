import { ERole } from './constant';
import type { Settings as LayoutSettings } from '@ant-design/pro-layout';

export interface IInitialState {
	settings?: Partial<LayoutSettings>;
	currentUser?: Login.IUser;
	permissionLoading?: boolean;
	authorizedPermissions?: any[];
}

export interface ISetting {
	_id?: string;
	key: ESettingKey;
	value: any;
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
		createdAt: string;
		updatedAt: string;
		sub?: string;
		family_name?: string;
		given_name?: string;
		name?: string;
		preferred_username?: string;
		realm_access?: {
			roles?: string[];
		};
		picture?: string;
		ssoId?: string;
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

	export interface IPermission {
		rsname: string;
		scopes?: string[];
	}

	export type TModule = {
		url: string;
		title: string;
		icon?: string;
	};
}
