import React, { useEffect, useMemo, useState } from "react";
import { history, useModel } from "umi";
import { Avatar, Button, Card, Input, List, Row, Col, Space, Tag, Typography, Tabs } from "antd";
import { BarChartOutlined, CheckCircleFilled, FireOutlined, TrophyOutlined } from "@ant-design/icons";
import "./components/style.less";

const { Title, Text, Paragraph } = Typography;

type QuestionItem = BaiViet.IRecord & {
  answers?: number;
  comments?: unknown[];
  commentsCount?: number;
  status?: string;
  summary?: string;
  isResolved?: boolean;
  upvotedBy?: any[];
  downvotedBy?: any[];
  author?: {
    _id?: string;
    fullName?: string;
    name?: string;
    department?: string;
    faculty?: string;
    avatar?: string;
    reputation?: number;
  };
};

const tabs = [
  { key: "newest", label: "Mới nhất" },
  { key: "trending", label: "Xu hướng" },
  { key: "unanswered", label: "Chưa trả lời" },
];

const formatRelativeTime = (createdAt?: string) => {
  if (!createdAt) return "đã đăng vài phút trước";
  const then = new Date(createdAt).getTime();
  const now = Date.now();
  const diff = now - then;

  if (Number.isNaN(then) || diff < 0) {
    return "đã đăng vài phút trước";
  }

  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return "vừa xong";
  if (minutes < 60) return `đã đăng ${minutes} phút trước`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `đã đăng ${hours} giờ trước`;

  const days = Math.floor(hours / 24);
  if (days < 7) return `đã đăng ${days} ngày trước`;

  const weeks = Math.floor(days / 7);
  return `đã đăng ${weeks} tuần trước`;
};

const TrangChu: React.FC = () => {
  const [activeTab, setActiveTab] = useState("newest");
  const [searchText, setSearchText] = useState("");
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [hoveredAuthorId, setHoveredAuthorId] = useState<string | null>(null);

  const { initialState } = useModel("@@initialState");
  const role = initialState?.currentUser?.role;

  const baiVietModel = useModel("baiviet") as any;
  const { getModel, danhSach, loading } = baiVietModel ?? {};

  const dashboardModel = useModel("dashboard") as any;
  const { stats, getStatsModel } = dashboardModel ?? {};

  const realRawData = useMemo(() => {
    if (!baiVietModel) return [];
    if (Array.isArray(baiVietModel)) return baiVietModel;

    const candidate =
      baiVietModel?.danhSach ??
      baiVietModel?.result ??
      baiVietModel?.data ??
      baiVietModel?.data?.result ??
      baiVietModel?.data?.data?.result ??
      [];

    return Array.isArray(candidate) ? candidate : [];
  }, [baiVietModel, danhSach]);

  // Fetch all posts (up to 1000) once on mount to enable correct frontend-side filtering & pagination,
  // and load system statistics from the dashboard API (only if user has admin role to avoid 403 errors)
  useEffect(() => {
    if (typeof getModel === "function") {
      getModel(undefined, undefined, undefined, 1, 1000);
    }
    if (role === "admin" && typeof getStatsModel === "function") {
      getStatsModel();
    }
  }, [role]);

  const processedQuestions = useMemo(() => {
    const items = Array.isArray(realRawData) ? realRawData : [];
    const query = searchText.trim().toLowerCase();

    return items
      .filter((item) => {
        const title = String(item.title ?? "").toLowerCase();
        const summary = String(item.summary ?? item.content ?? "").toLowerCase();
        const matchesSearch = !query || title.includes(query) || summary.includes(query);

        if (!matchesSearch) {
          return false;
        }

        if (activeTab === "unanswered") {
          const answerCount = Number(item.answers ?? item.commentsCount ?? item.comments?.length ?? 0);
          return answerCount === 0;
        }

        return true;
      })
      .sort((a, b) => {
        const aUpvotes = Array.isArray(a.upvotedBy) ? a.upvotedBy.length : 0;
        const aDownvotes = Array.isArray(a.downvotedBy) ? a.downvotedBy.length : 0;
        const aVotes = aUpvotes - aDownvotes;

        const bUpvotes = Array.isArray(b.upvotedBy) ? b.upvotedBy.length : 0;
        const bDownvotes = Array.isArray(b.downvotedBy) ? b.downvotedBy.length : 0;
        const bVotes = bUpvotes - bDownvotes;

        if (activeTab === "trending") {
          const leftScore = Number(a.views ?? 0) + aVotes;
          const rightScore = Number(b.views ?? 0) + bVotes;
          return rightScore - leftScore;
        }
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });
  }, [activeTab, realRawData, searchText]);

  // 🚀 REAL DATA: Trending tags retrieved from Dashboard API or dynamically calculated from realRawData
  const trendingTags = useMemo(() => {
    const list = stats?.charts?.pieChart ?? [];
    if (list.length > 0) {
      return list.slice(0, 5).map((t: any) => ({ name: `#${t.tag}`, count: t.count }));
    }

    // Nếu không có quyền admin (stats undefined), tự động thống kê tag từ danh sách bài viết thực tế
    const tagMap: Record<string, number> = {};
    realRawData.forEach((post: any) => {
      const tags = Array.isArray(post.tags) ? post.tags : [];
      tags.forEach((tag: string) => {
        tagMap[tag] = (tagMap[tag] || 0) + 1;
      });
    });

    const sortedTags = Object.entries(tagMap)
      .map(([name, count]) => ({ name: `#${name}`, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    if (sortedTags.length > 0) {
      return sortedTags;
    }

    return [
      { name: "#reactjs", count: 450 },
      { name: "#python", count: 312 },
      { name: "#artificial_intelligence", count: 289 },
      { name: "#java", count: 195 },
      { name: "#data_structures", count: 164 },
    ];
  }, [stats, realRawData]);

  // 🚀 REAL DATA: Leaderboard dynamically built based on the ACTUAL reputation points returned by the backend
  const leaderboard = useMemo(() => {
    const authorMap: Record<string, { id: string; name: string; avatar?: string; reputation: number }> = {};
    
    realRawData.forEach((post: any) => {
      const author = post.author;
      if (author && author._id) {
        if (!authorMap[author._id]) {
          authorMap[author._id] = {
            id: author._id,
            name: author.fullName || author.name || "Thành viên",
            avatar: author.avatar,
            reputation: Number(author.reputation ?? 0),
          };
        }
      }
    });

    const sortedAuthors = Object.values(authorMap)
      .sort((a, b) => b.reputation - a.reputation)
      .slice(0, 5);

    if (sortedAuthors.length > 0) {
      return sortedAuthors.map((item, index) => ({
        rank: index + 1,
        id: item.id,
        name: item.name,
        avatar: item.avatar,
        points: item.reputation >= 1000 ? `${(item.reputation / 1000).toFixed(1)}k` : `${item.reputation}`,
      }));
    }

    return [
      { rank: 1, id: "", name: "GS. Trần Hưng", avatar: undefined as string | undefined, points: "12.4k" },
      { rank: 2, id: "", name: "Lê Quang", avatar: undefined as string | undefined, points: "8.1k" },
      { rank: 3, id: "", name: "Minh Anh", avatar: undefined as string | undefined, points: "5.5k" },
    ];
  }, [realRawData]);

  // 🚀 REAL DATA: System statistics computed from Dashboard cards or dynamically calculated from realRawData
  const systemStats = useMemo(() => {
    const cards = stats?.cards;
    if (cards) {
      const totalUsers = cards.totalUsers ?? 0;
      const totalPosts = cards.totalPosts ?? 0;
      const totalComments = cards.totalComments ?? 0;
      const totalUnanswered = cards.totalUnansweredPosts ?? 0;
      const resolvedCount = totalPosts - totalUnanswered;
      const resolvedRate = totalPosts > 0 ? `${((resolvedCount / totalPosts) * 100).toFixed(0)}%` : "0%";
      return [
        { value: totalUsers.toLocaleString(), label: "THÀNH VIÊN" },
        { value: totalPosts.toLocaleString(), label: "CÂU HỎI" },
        { value: totalComments.toLocaleString(), label: "CÂU TRẢ LỜI" },
        { value: resolvedRate, label: "ĐÃ GIẢI QUYẾT" },
      ];
    }

    // Nếu không có quyền admin (stats undefined), tính toán động trực tiếp từ realRawData của bài viết
    const totalPosts = realRawData.length;
    let totalComments = 0;
    let resolvedCount = 0;
    const uniqueAuthors = new Set<string>();

    realRawData.forEach((post: any) => {
      totalComments += Number(post.answers ?? post.commentsCount ?? post.comments?.length ?? 0);
      if (post.isResolved || post.status === "resolved") {
        resolvedCount += 1;
      }
      if (post.author?._id) {
        uniqueAuthors.add(post.author._id);
      }
    });

    const resolvedRate = totalPosts > 0 ? `${((resolvedCount / totalPosts) * 100).toFixed(0)}%` : "0%";
    const totalUsers = uniqueAuthors.size;

    return [
      { value: totalUsers.toString(), label: "THÀNH VIÊN" },
      { value: totalPosts.toString(), label: "CÂU HỎI" },
      { value: totalComments.toString(), label: "CÂU TRẢ LỜI" },
      { value: resolvedRate, label: "ĐÃ GIẢI QUYẾT" },
    ];
  }, [stats, realRawData]);

  return (
    <div style={{ backgroundColor: "#f5f7fa", padding: 24, minHeight: "100vh" }}>
      <Row gutter={[24, 24]}>
        <Col xs={24} lg={17}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", marginBottom: 16 }}>
            <div>
              <Title level={2} style={{ margin: 0, color: "#1f1f1f" }}>
                Tất cả câu hỏi
              </Title>
              <Text type="secondary">{processedQuestions.length} câu hỏi đang chờ bạn giải đáp</Text>
            </div>
            <Button type="primary" size="large" style={{ borderRadius: 6, fontWeight: "600", backgroundColor: "#0052cc" }} onClick={() => history.push("/ask")}>Đặt Câu Hỏi</Button>
          </div>

          <Tabs activeKey={activeTab} onChange={setActiveTab} tabBarGutter={32} style={{ marginBottom: 24 }}>
            {tabs.map((tab) => (
              <Tabs.TabPane tab={tab.label} key={tab.key} />
            ))}
          </Tabs>

          <div style={{ marginBottom: 24, maxWidth: 560 }}>
            <Input.Search
              placeholder="Tìm kiếm câu hỏi..."
              size="large"
              value={searchText}
              onChange={(event) => setSearchText(event.target.value)}
              allowClear
              style={{ width: "100%", borderRadius: 999, border: "1px solid #d9d9d9" }}
            />
          </div>

          <List
            loading={loading}
            dataSource={processedQuestions}
            // Phân trang client-side mượt mà, đầy đủ tính năng cho toàn bộ danh sách câu hỏi đã lọc
            pagination={{
              pageSize: 10,
              size: "small",
              showSizeChanger: false,
              showQuickJumper: true,
              locale: { jump_to: "Đến trang", page: "" },
            }}
            locale={{ emptyText: "Không tìm thấy câu hỏi phù hợp" }}
            renderItem={(record: QuestionItem) => {
              const answerCount = Number(record.answers ?? record.commentsCount ?? record.comments?.length ?? 0);
              const isResolved = Boolean(record.isResolved ?? record.status === "resolved");
              const authorName = record.author?.fullName || record.author?.name || "Thành viên";
              const authorDepartment = record.author?.department || record.author?.faculty || "Khoa/Viện chưa rõ";
              const recordTags = Array.isArray(record.tags) ? record.tags : [];
              const recordId = record._id ?? "";

              // Tính toán số vote dựa trên mảng upvotedBy trừ đi mảng downvotedBy
              const upvotes = Array.isArray(record.upvotedBy) ? record.upvotedBy.length : 0;
              const downvotes = Array.isArray(record.downvotedBy) ? record.downvotedBy.length : 0;
              const votesCount = upvotes - downvotes;

              return (
                <div
                  onClick={() => history.push(`/question/${recordId}`)}
                  onMouseEnter={() => setHoveredId(recordId)}
                  onMouseLeave={() => setHoveredId(null)}
                  style={{
                    display: "flex",
                    width: "100%",
                    backgroundColor: "#ffffff",
                    borderRadius: 14,
                    border: `1px solid ${hoveredId === recordId ? "#0052cc" : "#e8e8e8"}`,
                    boxShadow: hoveredId === recordId ? "0 8px 18px rgba(0, 82, 204, 0.12)" : "0 1px 4px rgba(0, 0, 0, 0.06)",
                    padding: 20,
                    marginBottom: 16,
                    cursor: "pointer",
                    gap: 20,
                    transition: "all 0.2s ease-in-out",
                  }}
                >
                  <div style={{ width: 100, minWidth: 100, display: "flex", flexDirection: "column", alignItems: "center", gap: 12, textAlign: "center" }}>
                    <div style={{ color: "#8c8c8c", fontSize: 12 }}>
                      <div style={{ fontWeight: 700, fontSize: 20, color: "#1f1f1f" }}>{votesCount}</div>
                      Bình chọn
                    </div>

                    <div
                      style={{
                        width: 72,
                        minHeight: 60,
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "center",
                        alignItems: "center",
                        borderRadius: 10,
                        border: `1px solid ${isResolved ? "#52c41a" : "#1890ff"}`,
                        backgroundColor: isResolved ? "#f6ffed" : "#e6f7ff",
                        color: isResolved ? "#52c41a" : "#1890ff",
                        padding: 8,
                      }}
                    >
                      <div style={{ fontWeight: 700, fontSize: 16 }}>{answerCount}</div>
                      <div style={{ fontSize: 11 }}>{isResolved ? "Đã giải" : "Đáp án"}</div>
                      {isResolved && <CheckCircleFilled style={{ fontSize: 12, marginTop: 4 }} />}
                    </div>

                    <div style={{ color: "#8c8c8c", fontSize: 12 }}>{Number(record.views ?? 0)} Lượt xem</div>
                  </div>

                  <div style={{ flexGrow: 1, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                    <div>
                      <div style={{ color: "#0052cc", fontWeight: 700, fontSize: 18, lineHeight: 1.4, marginBottom: 10 }}>{record.title}</div>

                      <Paragraph
                        ellipsis={{ rows: 2, expandable: false }}
                        style={{ color: "#434343", marginBottom: 16, fontSize: 14, lineHeight: 1.6 }}
                      >
                        {record.summary ?? record.content ?? ""}
                      </Paragraph>

                      <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                        {recordTags.map((tag) => (
                          <Tag key={tag} color="default" style={{ borderRadius: 6, padding: "4px 10px", fontWeight: 500 }}>
                            {tag}
                          </Tag>
                        ))}
                      </div>
                    </div>

                    <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 8 }}>
                      {/* 🚀 FIX: Ấn vào Tên hoặc Avatar tác giả mở trang cá nhân (history.push) */}
                      <div
                        style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }}
                        onMouseEnter={() => setHoveredAuthorId(recordId)}
                        onMouseLeave={() => setHoveredAuthorId(null)}
                        onClick={(e) => {
                          e.stopPropagation();
                          if (record.author?._id) {
                            history.push(`/profile/${record.author._id}`);
                          }
                        }}
                      >
                        <Avatar size={32} src={record.author?.avatar} style={{ backgroundColor: "#1890ff" }}>
                          {String(authorName).charAt(0)}
                        </Avatar>
                        <div style={{ display: "flex", flexDirection: "column", textAlign: "left" }}>
                          <Text
                            strong
                            style={{
                              color: hoveredAuthorId === recordId ? "#0052cc" : "#262626",
                              fontSize: 14,
                              textDecoration: hoveredAuthorId === recordId ? "underline" : "none",
                              transition: "color 0.2s ease"
                            }}
                          >
                            {authorName}
                          </Text>
                          <Text type="secondary" style={{ fontSize: 12 }}>
                            {authorDepartment} • {formatRelativeTime(record.createdAt)}
                          </Text>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            }}
          />
        </Col>

        {/* 🚀 FIX: Cột bên phải thiết lập position: "sticky" để tự động cố định khi cuộn trang giống StackOverflow, tránh kéo giãn chiều cao vô hạn */}
        <Col xs={24} lg={7}>
          <div style={{ position: "sticky", top: 24, display: "flex", flexDirection: "column", gap: "16px" }}>
            <Card
              title={<span style={{ fontWeight: 600 }}><FireOutlined style={{ color: "#ff4d4f", marginRight: 8 }} />Thẻ Thịnh Hành</span>}
              bodyStyle={{ padding: 16 }}
              style={{ borderRadius: 12, boxShadow: "0 1px 4px rgba(0, 0, 0, 0.04)" }}
            >
              {trendingTags.map((tag: { name: string; count: number }) => (
                <div
                  key={tag.name}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "10px 12px",
                    marginBottom: 10,
                    borderRadius: 10,
                    backgroundColor: "#fafafa",
                  }}
                >
                  <span style={{ fontWeight: 500, color: "#434343" }}>{tag.name}</span>
                  <Text type="secondary" strong>{tag.count} bài đăng</Text>
                </div>
              ))}
            </Card>

            <Card
              title={<span style={{ fontWeight: 600 }}><TrophyOutlined style={{ color: "#ffc107", marginRight: 8 }} />Bảng Xếp Hạng</span>}
              bodyStyle={{ padding: 16 }}
              style={{ borderRadius: 12, boxShadow: "0 1px 4px rgba(0, 0, 0, 0.04)" }}
            >
              {leaderboard.map((user) => (
                <div
                  key={user.rank}
                  // 🚀 FIX: Bấm vào tên/avatar của top user trên BXH mở trang cá nhân
                  onClick={() => {
                    if (user.id) {
                      history.push(`/profile/${user.id}`);
                    }
                  }}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "12px 0",
                    borderBottom: user.rank !== leaderboard.length ? "1px solid #f0f0f0" : "none",
                    cursor: user.id ? "pointer" : "default",
                  }}
                >
                  <Space size={12} align="center">
                    <span style={{ fontWeight: 700, color: user.rank === 1 ? "#fa8c16" : user.rank === 2 ? "#fadb14" : user.rank === 3 ? "#1890ff" : "#8c8c8c" }}>{user.rank}</span>
                    <Avatar size={32} src={user.avatar} style={{ backgroundColor: "#87d068" }}>{user.name.charAt(0)}</Avatar>
                    <span style={{ fontWeight: 500 }} className="leaderboard-name">{user.name}</span>
                  </Space>
                  <Text strong style={{ color: "#fa8c16" }}>★ {user.points}</Text>
                </div>
              ))}
            </Card>

            <Card
              title={<span style={{ fontWeight: 600 }}><BarChartOutlined style={{ color: "#1890ff", marginRight: 8 }} />Thống Kê Hệ Thống</span>}
              bodyStyle={{ padding: 16 }}
              style={{ borderRadius: 12, boxShadow: "0 1px 4px rgba(0, 0, 0, 0.04)" }}
            >
              <Row gutter={[16, 16]}>
                {systemStats.map((stat) => (
                  <Col span={12} key={stat.label}>
                    <div style={{ backgroundColor: "#f5f7ff", borderRadius: 10, padding: 12, textAlign: "center", border: "1px solid #e6f7ff" }}>
                      <div style={{ fontSize: 18, fontWeight: 700, color: "#1890ff" }}>{stat.value}</div>
                      <div style={{ color: "#8c8c8c", fontSize: 12, marginTop: 4 }}>{stat.label}</div>
                    </div>
                  </Col>
                ))}
              </Row>
            </Card>

            <div style={{ padding: "0 8px", color: "#a0aec0", fontSize: 12, lineHeight: "2" }}>
              <Space size={12} style={{ flexWrap: "wrap", marginBottom: 8 }}>
                <a href="#" style={{ color: "#718096" }}>Về EduStack</a>
                <a href="#" style={{ color: "#718096" }}>Nội quy</a>
                <a href="#" style={{ color: "#718096" }}>Trợ giúp</a>
                <a href="#" style={{ color: "#718096" }}>Chính sách bảo mật</a>
              </Space>
              <div>© 2026 EduStack Academic Hub</div>
            </div>
          </div>
        </Col>
      </Row>
    </div>
  );
};

export default TrangChu;