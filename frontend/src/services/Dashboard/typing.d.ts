declare module Dashboard {
  export interface ICards {
    totalUsers: number;
    totalPosts: number;
    totalComments: number;
    totalUnansweredPosts: number;
  }

  export interface ILineChart {
    date: string;
    posts: number;
    comments: number;
  }

  export interface IPieChart {
    tag: string;
    count: number;
  }

  export interface IRecentPost {
    _id: string;
    title: string;
    createdAt: string;
    author: {
      _id: string;
      fullName: string;
      email: string;
    };
  }

  export interface IRecentUser {
    _id: string;
    fullName: string;
    email: string;
    code: string;
    role: string;
    createdAt: string;
  }

  export interface IStatsResponse {
    cards: ICards;
    charts: {
      lineChart: ILineChart[];
      pieChart: IPieChart[];
    };
    recent: {
      posts: IRecentPost[];
      users: IRecentUser[];
    };
  }
}
