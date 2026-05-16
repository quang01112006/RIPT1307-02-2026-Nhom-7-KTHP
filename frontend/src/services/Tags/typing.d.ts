declare namespace Tags {
	export interface IRecord {
		_id: string;
		name: string;
		description?: string;
		postCount: number;
		createdAt: string;
		updatedAt: string;
	}

	export interface IQuery {
		page?: number;
		limit?: number;
		condition?: any;
	}
}
