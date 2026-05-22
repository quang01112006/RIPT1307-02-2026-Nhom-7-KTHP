declare module BinhLuan {
	export interface IRecord {
		_id: string;
		content: string;
		author: {
			_id: string;
			fullName: string;
			avatar?: string;
		};
		post: string;
		parent?: string;
		type?: 'ANSWER' | 'COMMENT';
		isAccepted?: boolean;
		upvotedBy: string[];
		downvotedBy: string[];
		createdAt: string;
		updatedAt: string;
	}
}
