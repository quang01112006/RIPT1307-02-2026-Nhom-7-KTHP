import { ERole } from './services/base/constant';
import type { IInitialState } from './services/base/typing';

export default function access(initialState: IInitialState) {
	const { currentUser } = initialState || {};

	return {
		isAdmin: currentUser && currentUser.role === ERole.ADMIN,
		isUser: currentUser && (currentUser.role === ERole.STUDENT || currentUser.role === ERole.TEACHER),
		isGuest: !currentUser,
		canComment: !!currentUser,
		accessFilter: (route: any) =>
			initialState.authorizedPermissions
				?.map((item) => item.scopes)
				.flat()
				?.includes(route?.maChucNang) || false,
	};
}
