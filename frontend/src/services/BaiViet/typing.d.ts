declare module BaiViet {
	export interface IRecord {
		_id: string;
		title: string;
		content: string;
		author: {
			_id: string;
			fullName: string;
			avatar?: string;
		};
		tags: string[];
		files?: any[];
		upvotedBy: string[];
		downvotedBy: string[];
		createdAt: string;
		updatedAt: string;
	}
	export interface IQuery {
		page?: number;
		limit?: number;
		search?: string;
		tag?: string;
	}
}
