import React, { useState, useMemo } from "react";
import { Card, Input, Tag, Avatar, Space, Button, List, Row, Col, Empty } from "antd";
import {
  CheckCircleFilled,
  PaperClipOutlined,
  SearchOutlined,
  FireOutlined,
  TrophyOutlined,
  BarChartOutlined,
} from "@ant-design/icons";
import { useModel, history } from "umi";
import "./components/style.less";

const TrangChu: React.FC = () => {
  const { dataList, data, dataSource, refresh } = useModel("baiviet") || {};
  
  const realRawData = dataList || data || dataSource || [];

  const [activeTab, setActiveTab] = useState("newest");
  const [searchText, setSearchText] = useState("");

  const processedQuestions = useMemo(() => {
    if (!Array.isArray(realRawData)) return [];

    let result = [...realRawData];
    if (searchText.trim()) {
      const query = searchText.toLowerCase().trim();
      result = result.filter(
        (item) =>
          item.title?.toLowerCase().includes(query) ||
          item.summary?.toLowerCase().includes(query) ||
          item.content?.toLowerCase().includes(query)
      );
    }

    if (activeTab === "newest") {
      result.sort((a, b) => {
        const timeA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const timeB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return timeB - timeA;
      });
    } else if (activeTab === "trending") {
      result.sort((a, b) => {
        const votesA = typeof a.votes === "number" ? a.votes : (a.votes?.length || 0);
        const votesB = typeof b.votes === "number" ? b.votes : (b.votes?.length || 0);
        return votesB - votesA;
      });
    } else if (activeTab === "unanswered") {
      result = result.filter((item) => {
        const commentCount = item.answers ?? item.commentsCount ?? item.comments?.length ?? 0;
        return commentCount === 0;
      });
    }

    return result;
  }, [realRawData, activeTab, searchText]);

  return (
    <div style={{ backgroundColor: "#f5f7fa", padding: "24px", minHeight: "100vh" }}>
      <Row gutter={24}>
        
        {/* ==================== CỘT TRÁI: DANH SÁCH CÂU HỎI THẬT ==================== */}
        <Col xs={24} lg={17}>
          {/* Header Bảng tin */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
            <div>
              <h2 style={{ fontSize: 28, fontWeight: "bold", margin: 0, color: "#1f1f1f" }}>
                Tất cả câu hỏi
              </h2>
              <span style={{ fontSize: 14, color: "#8c8c8c" }}>
                {processedQuestions.length} câu hỏi phù hợp tiêu chí
              </span>
            </div>
            <Button 
              type="primary" 
              size="large"
              style={{ borderRadius: 6, fontWeight: "600", backgroundColor: "#0052cc" }}
              onClick={() => history.push("/ask")}
            >
              Đặt Câu Hỏi
            </Button>
          </div>

          {/* Thanh Tabs bộ lọc & Ô tìm kiếm hoạt động trực tiếp */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20, borderBottom: "1px solid #e8e8e8" }}>
            <Space size={24}>
              {[
                { key: "newest", label: "Mới nhất" },
                { key: "trending", label: "Xu hướng" },
                { key: "unanswered", label: "Chưa trả lời" },
              ].map((tab) => {
                const isActive = activeTab === tab.key;
                return (
                  <div
                    key={tab.key}
                    onClick={() => setActiveTab(tab.key)}
                    style={{
                      padding: "12px 4px",
                      cursor: "pointer",
                      fontWeight: isActive ? "bold" : "normal",
                      color: isActive ? "#0052cc" : "#595959",
                      borderBottom: isActive ? "3px solid #0052cc" : "3px solid transparent",
                      transition: "all 0.2s",
                      fontSize: 15
                    }}
                  >
                    {tab.label}
                  </div>
                );
              })}
            </Space>

            <Input
              placeholder="Tìm kiếm câu hỏi..."
              prefix={<SearchOutlined style={{ color: "#bfbfbf" }} />}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              style={{ width: 300, borderRadius: 20, backgroundColor: "#fff", border: "1px solid #d9d9d9" }}
              allowClear
            />
          </div>

          {/* Render danh sách câu hỏi động kèm logic phòng thủ dữ liệu rỗng */}
          <List
            dataSource={processedQuestions}
            pagination={{ pageSize: 10, size: "small" }}
            locale={{ emptyText: <Empty description="Không tìm thấy câu hỏi nào trong hệ thống!" /> }}
            renderItem={(record: any) => {
              const totalVotes = typeof record.votes === "number" ? record.votes : (record.votes?.length || 0);
              const totalAnswers = record.answers ?? record.commentsCount ?? record.comments?.length ?? 0;
              const isResolved = record.isResolved ?? (record.status === "resolved") ?? false;
              const displayViews = record.views ?? 0;

              const authorName = record.author?.name || record.authorName || "Thành viên";
              const authorDept = record.author?.department || record.authorDepartment || "Khoa CNTT";
              const displayTime = record.createdAt ? new Date(record.createdAt).toLocaleDateString("vi-VN") : "Vừa xong";

              return (
                <div
                  style={{
                    display: "flex",
                    backgroundColor: "#ffffff",
                    border: "1px solid #e8e8e8",
                    borderRadius: 8,
                    padding: "20px",
                    marginBottom: 16,
                    boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
                  }}
                >
                  {/* Số liệu tương tác bên trái */}
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", width: 80, flexShrink: 0, marginRight: 20, gap: 10 }}>
                    <div style={{ textAlign: "center", fontSize: 13, color: "#595959" }}>
                      <div style={{ fontWeight: "bold", color: "#1f1f1f", fontSize: 16 }}>{totalVotes}</div>
                      Bình chọn
                    </div>

                    <div style={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "center",
                      width: 68,
                      height: 56,
                      borderRadius: 6,
                      border: isResolved ? "1px solid #52c41a" : "1px solid #1890ff",
                      backgroundColor: isResolved ? "#f6ffed" : "#e6f7ff",
                      color: isResolved ? "#52c41a" : "#1890ff",
                    }}>
                      <span style={{ fontWeight: "bold", fontSize: 16 }}>{totalAnswers}</span>
                      <span style={{ fontSize: 11 }}>Đáp án</span>
                      {isResolved && <CheckCircleFilled style={{ fontSize: 11, marginTop: 2 }} />}
                    </div>

                    <div style={{ fontSize: 12, color: "#8c8c8c", textAlign: "center" }}>
                      {displayViews} Lượt xem
                    </div>
                  </div>

                  {/* Nội dung câu hỏi bên phải */}
                  <div style={{ flexGrow: 1, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                    <div>
                      {/* Tiêu đề - Ấn chuyển trang khớp 100% config/routes.ts */}
                      <h3
                        style={{ color: "#0052cc", fontWeight: "600", fontSize: 18, margin: "0 0 8px 0", cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 6 }}
                        onClick={() => history.push(`/question/${record._id || record.id}`)}
                      >
                        {record.title}
                        {record.hasAttachment && <PaperClipOutlined style={{ color: "#bfbfbf", fontSize: 15 }} />}
                      </h3>

                      {/* Tóm tắt nội dung */}
                      <div style={{
                        color: "#434343",
                        fontSize: 14,
                        marginBottom: 12,
                        display: "-webkit-box",
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: "vertical",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        lineHeight: "1.6",
                      }}>
                        {record.summary || record.content}
                      </div>

                      {/* Thẻ Tags thực tế từ mảng dữ liệu */}
                      <div style={{ marginBottom: 8 }}>
                        {record.tags?.map((tag: any, index: number) => (
                          <Tag key={index} style={{ backgroundColor: "#f0f2f5", border: "none", color: "#4f5e71", borderRadius: 4, padding: "4px 10px", fontWeight: "500" }}>
                            {typeof tag === "string" ? tag : (tag.name || tag.label)}
                          </Tag>
                        ))}
                      </div>
                    </div>

                    {/* Khối tác giả đổ data động */}
                    <div style={{ alignSelf: "flex-end", display: "flex", alignItems: "center", gap: 10, marginTop: 4 }}>
                      <Avatar size={28} src={record.author?.avatar || record.authorAvatar} style={{ backgroundColor: "#1890ff" }}>
                        {authorName.charAt(0)}
                      </Avatar>
                      <div style={{ display: "flex", flexDirection: "column", lineHeight: 1.3 }}>
                        <span style={{ fontSize: 14, fontWeight: "600", color: "#262626" }}>
                          {authorName}
                        </span>
                        <span style={{ fontSize: 12, color: "#8c8c8c" }}>
                          {authorDept} • đăng ngày {displayTime}
                        </span>
                      </div>
                    </div>

                  </div>
                </div>
              );
            }}
          />
        </Col>

        {/* ==================== CỘT PHẢI: SIDEBAR TIỆN ÍCH ==================== */}
        <Col xs={24} lg={7}>
          
          {/* Sửa lỗi giao diện AntD v5: Đổi bodyStyle thành styles={{ body: ... }} */}
          <Card 
            title={<span><FireOutlined style={{ color: "#ff4d4f", marginRight: 8 }} />Thẻ Thịnh Hành</span>}
            styles={{ body: { padding: "16px" } }}
            style={{ marginBottom: 16, borderRadius: 8, boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}
          >
            {[
              { name: "#reactjs", count: 450 },
              { name: "#python", count: 312 },
              { name: "#artificial_intelligence", count: 289, active: true },
              { name: "#java", count: 195 },
              { name: "#data_structures", count: 164 },
            ].map((tag, idx) => (
              <div key={idx} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 12px", marginBottom: 6, backgroundColor: tag.active ? "#fff7e6" : "#f5f5f5", borderRadius: 4, color: tag.active ? "#d46b08" : "#595959", fontWeight: tag.active ? "bold" : "normal" }}>
                <span>{tag.name}</span>
                <span style={{ color: "#8c8c8c", fontSize: 13 }}>{tag.count}</span>
              </div>
            ))}
          </Card>

          <Card 
            title={<span><TrophyOutlined style={{ color: "#ffc107", marginRight: 8 }} />Bảng Xếp Hạng</span>}
            styles={{ body: { padding: "16px" } }}
            style={{ marginBottom: 16, borderRadius: 8, boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}
          >
            {[
              { rank: 1, name: "GS. Trần Hưng", points: "12.4k" },
              { rank: 2, name: "Lê Quang", points: "8.1k" },
              { rank: 3, name: "Minh Anh", points: "5.5k" },
            ].map((user, idx) => (
              <div key={idx} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 0", borderBottom: idx !== 2 ? "1px solid #f0f0f0" : "none" }}>
                <Space size={12}>
                  <span style={{ fontWeight: "bold", fontSize: 16, color: user.rank === 1 ? "#ff4d4f" : user.rank === 2 ? "#ffa940" : "#ffec3d", width: 14 }}>{user.rank}</span>
                  <Avatar size={32} style={{ backgroundColor: "#87d068" }}>{user.name.charAt(0)}</Avatar>
                  <span style={{ fontWeight: "500", color: "#262626" }}>{user.name}</span>
                </Space>
                <span style={{ color: "#ffa940", fontWeight: "bold" }}>★ {user.points}</span>
              </div>
            ))}
          </Card>

          <Card 
            title={<span><BarChartOutlined style={{ color: "#1890ff", marginRight: 8 }} />Thống Kê Hệ Thống</span>}
            styles={{ body: { padding: "16px" } }}
            style={{ marginBottom: 16, borderRadius: 8, boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}
          >
            <Row gutter={[16, 16]} style={{ textAlign: "center" }}>
              {[
                { value: "15k", label: "THÀNH VIÊN" },
                { value: "42k", label: "CÂU HỎI" },
                { value: "120k", label: "CÂU TRẢ LỜI" },
                { value: "92%", label: "ĐÃ GIẢI QUYẾT" },
              ].map((stat, idx) => (
                <Col span={12} key={idx}>
                  <div style={{ backgroundColor: "#f8fafc", padding: "12px 0", borderRadius: 6, border: "1px solid #edf2f7" }}>
                    <div style={{ color: "#1890ff", fontSize: 20, fontWeight: "bold" }}>{stat.value}</div>
                    <div style={{ color: "#718096", fontSize: 11, fontWeight: "600", marginTop: 2 }}>{stat.label}</div>
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

        </Col>
      </Row>
    </div>
  );
};

export default TrangChu;