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
		upvotedBy: string[];
		downvotedBy: string[];
		createdAt: string;
		updatedAt: string;
	}
}
