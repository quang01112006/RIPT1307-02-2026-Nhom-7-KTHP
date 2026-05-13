import { ERole } from './constant';

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
	}

	export interface ILoginResponse {
		access_token: string;
		user: IUser;
	}

	export interface IInitialState {
		settings?: Partial<LayoutSettings>;
		currentUser?: Login.IUser;
		permissionLoading?: boolean;
	}

	export interface IFile {
		_id: string;
		url: string;
		mimetype: string;
		author: string;
		createdAt: string;
	}
}
