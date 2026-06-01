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
  votes?: number;
  author?: {
    _id?: string;
    fullName?: string;
    name?: string;
    department?: string;
    faculty?: string;
    avatar?: string;
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

  const baiVietModel = useModel("baiviet") as any;
  const { getModel, danhSach, loading } = baiVietModel ?? {};

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

  // 🚀 FIX 1: Đổi thành mảng rỗng [] để tránh lỗi gọi API lặp vô hạn làm đứng trang
  useEffect(() => {
    if (typeof getModel === "function") {
      getModel();
    }
  }, []);

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
        if (activeTab === "trending") {
          const leftScore = Number(a.views ?? a.votes ?? 0);
          const rightScore = Number(b.views ?? b.votes ?? 0);
          return rightScore - leftScore;
        }
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });
  }, [activeTab, realRawData, searchText]);

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
            pagination={{ pageSize: 10, size: "small" }}
            locale={{ emptyText: "Không tìm thấy câu hỏi phù hợp" }}
            renderItem={(record: QuestionItem) => {
              const answerCount = Number(record.answers ?? record.commentsCount ?? record.comments?.length ?? 0);
              const isResolved = Boolean(record.isResolved ?? record.status === "resolved");
              const authorName = record.author?.fullName || record.author?.name || "Thành viên";
              const authorDepartment = record.author?.department || record.author?.faculty || "Khoa/Viện chưa rõ";
              const recordTags = Array.isArray(record.tags) ? record.tags : [];
              const recordId = record._id ?? "";

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
                      <div style={{ fontWeight: 700, fontSize: 20, color: "#1f1f1f" }}>{record.votes ?? 0}</div>
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

                    {/* 🚀 FIX 3: Chỉnh lại textAlign: "left" để text bám sát, thẳng hàng dọc theo Avatar */}
                    <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 8 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <Avatar size={32} src={record.author?.avatar} style={{ backgroundColor: "#1890ff" }}>
                          {String(authorName).charAt(0)}
                        </Avatar>
                        <div style={{ display: "flex", flexDirection: "column", textAlign: "left" }}>
                          <Text strong style={{ color: "#262626", fontSize: 14 }}>{authorName}</Text>
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

        {/* ==================== CỘT PHẢI: FIX THUỘC TÍNH CỦA CARD ANTD V5 ==================== */}
        <Col xs={24} lg={7}>
          {/* 🚀 FIX 2: Đổi bodyStyle thành styles={{ body: ... }} */}
          <Card
            title={<span style={{ fontWeight: 600 }}><FireOutlined style={{ color: "#ff4d4f", marginRight: 8 }} />Thẻ Thịnh Hành</span>}
            styles={{ body: { padding: 16 } }}
            style={{ marginBottom: 16, borderRadius: 12, boxShadow: "0 1px 4px rgba(0, 0, 0, 0.04)" }}
          >
            {[
              { name: "#reactjs", count: 450 },
              { name: "#python", count: 312 },
              { name: "#artificial_intelligence", count: 289 },
              { name: "#java", count: 195 },
              { name: "#data_structures", count: 164 },
            ].map((tag) => (
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
                <span>{tag.name}</span>
                <Text type="secondary">{tag.count}</Text>
              </div>
            ))}
          </Card>

          <Card
            title={<span style={{ fontWeight: 600 }}><TrophyOutlined style={{ color: "#ffc107", marginRight: 8 }} />Bảng Xếp Hạng</span>}
            styles={{ body: { padding: 16 } }}
            style={{ marginBottom: 16, borderRadius: 12, boxShadow: "0 1px 4px rgba(0, 0, 0, 0.04)" }}
          >
            {[
              { rank: 1, name: "GS. Trần Hưng", points: "12.4k" },
              { rank: 2, name: "Lê Quang", points: "8.1k" },
              { rank: 3, name: "Minh Anh", points: "5.5k" },
            ].map((user) => (
              <div
                key={user.rank}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "12px 0",
                  borderBottom: user.rank !== 3 ? "1px solid #f0f0f0" : "none",
                }}
              >
                <Space size={12} align="center">
                  <span style={{ fontWeight: 700, color: user.rank === 1 ? "#fa8c16" : user.rank === 2 ? "#fadb14" : "#1890ff" }}>{user.rank}</span>
                  <Avatar size={32} style={{ backgroundColor: "#87d068" }}>{user.name.charAt(0)}</Avatar>
                  <span style={{ fontWeight: 500 }}>{user.name}</span>
                </Space>
                <Text strong style={{ color: "#fa8c16" }}>★ {user.points}</Text>
              </div>
            ))}
          </Card>

          <Card
            title={<span style={{ fontWeight: 600 }}><BarChartOutlined style={{ color: "#1890ff", marginRight: 8 }} />Thống Kê Hệ Thống</span>}
            styles={{ body: { padding: 16 } }}
            style={{ marginBottom: 16, borderRadius: 12, boxShadow: "0 1px 4px rgba(0, 0, 0, 0.04)" }}
          >
            <Row gutter={[16, 16]}>
              {[
                { value: "15k", label: "THÀNH VIÊN" },
                { value: "42k", label: "CÂU HỎI" },
                { value: "120k", label: "CÂU TRẢ LỜI" },
                { value: "92%", label: "ĐÃ GIẢI QUYẾT" },
              ].map((stat) => (
                <Col span={12} key={stat.label}>
                  <div style={{ backgroundColor: "#f5f7ff", borderRadius: 10, padding: 12, textAlign: "center" }}>
                    <div style={{ fontSize: 18, fontWeight: 700, color: "#1890ff" }}>{stat.value}</div>
                    <div style={{ color: "#8c8c8c", fontSize: 12, marginTop: 4 }}>{stat.label}</div>
                  </div>
                </Col>
              ))}
            </Row>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default TrangChu;