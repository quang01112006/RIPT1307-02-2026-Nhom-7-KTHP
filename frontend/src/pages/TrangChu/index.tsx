import React, { useState } from "react";
import { Card, Input, Tag, Avatar, Space, Button, List, Row, Col } from "antd";
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
  const model = useModel("baiviet") || {};
  
  const dataFromModel = model.dataList || model.data || model.dataSource;

  const [activeTab, setActiveTab] = useState("newest");
  const [searchText, setSearchText] = useState("");

  const mockQuestions = [
    {
      id: "1",
      title: "Cách triển khai thuật toán Dijkstra trong đồ thị có trọng số âm?",
      summary: "Mình đang làm bài tập về lý thuyết đồ thị và gặp khó khăn khi áp dụng Dijkstra cho đồ thị có cung trọng số âm. Nghe nói phải dùng Bellman-Ford nhưng...",
      tags: ["Lý thuyết đồ thị", "Thuật toán", "Toán rời rạc"],
      votes: 12,
      answers: 3,
      isResolved: true,
      views: 241,
      authorName: "Hoàng Minh",
      authorDepartment: "Khoa CNTT",
      createdAt: "15 phút",
      authorAvatar: "",
    },
    {
      id: "2",
      title: "Phân biệt giữa 'Abstract Class' và 'Interface' trong ngôn ngữ Java?",
      summary: "Cho mình hỏi khi nào thì nên dùng Abstract Class và khi nào nên dùng Interface? Mình thấy cả hai đều cung cấp tính trừu tượng nhưng không rõ sự khác biệt thực tế...",
      tags: ["Java", "OOP", "Lập trình hướng đối tượng"],
      votes: 8,
      answers: 0,
      isResolved: false,
      views: 56,
      authorName: "Linh Chi",
      authorDepartment: "Khoa Kỹ thuật Phần mềm",
      createdAt: "2 giờ",
      authorAvatar: "",
    },
    {
      id: "3",
      title: "Tổng hợp tài liệu ôn thi cao học ngành Hệ thống thông tin 2024",
      summary: "Dành cho các bạn đang có ý định thi cao học năm nay, mình xin chia sẻ bộ tài liệu tự ôn tập các môn cơ sở ngành và chuyên ngành mà mình đã tổng hợp được...",
      tags: ["Tài liệu", "Cao học", "HTTT"],
      votes: 42,
      answers: 12,
      isResolved: true,
      views: "1.2k",
      authorName: "Thế Anh",
      authorDepartment: "Viện CNTT & TT",
      createdAt: "1 ngày",
      hasAttachment: true,
      authorAvatar: "",
    },
  ];

  const dataSource = dataFromModel || mockQuestions;

  return (
    <div style={{ backgroundColor: "#f5f7fa", padding: "24px", minHeight: "100vh" }}>
      <Row gutter={24}>
        
        {/* ==================== CỘT TRÁI: DANH SÁCH CÂU HỎI ==================== */}
        <Col xs={24} lg={17}>
          {/* Header Bảng tin */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
            <div>
              <h2 style={{ fontSize: 28, fontWeight: "bold", margin: 0, color: "#1f1f1f" }}>
                Tất cả câu hỏi
              </h2>
              <span style={{ fontSize: 14, color: "#8c8c8c" }}>
                2,451 câu hỏi đang chờ bạn giải đáp
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

          {/* Thanh Tabs bộ lọc & Ô tìm kiếm */}
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

          {/* Thay thế TableBase bằng List AntD */}
          <List
            dataSource={dataSource}
            pagination={{ pageSize: 10, size: "small" }}
            renderItem={(record: any) => {
              const isResolved = record.isResolved ?? false;
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
                      <div style={{ fontWeight: "bold", color: "#1f1f1f", fontSize: 16 }}>{record.votes ?? 0}</div>
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
                      <span style={{ fontWeight: "bold", fontSize: 16 }}>{record.answers ?? 0}</span>
                      <span style={{ fontSize: 11 }}>Đáp án</span>
                      {isResolved && <CheckCircleFilled style={{ fontSize: 11, marginTop: 2 }} />}
                    </div>

                    <div style={{ fontSize: 12, color: "#8c8c8c", textAlign: "center" }}>
                      {record.views ?? 0} Lượt xem
                    </div>
                  </div>

                  {/* Nội dung câu hỏi bên phải */}
                  <div style={{ flexGrow: 1, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                    <div>
                      {/* Tiêu đề - Ấn vào điều hướng sang trang Chi Tiết Bài Viết */}
                      <h3
                        style={{ color: "#0052cc", fontWeight: "600", fontSize: 18, margin: "0 0 8px 0", cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 6 }}
                        onClick={() => history.push(`/question/${record.id}`)}
                      >
                        {record.title}
                        {record.hasAttachment && <PaperClipOutlined style={{ color: "#bfbfbf", fontSize: 15 }} />}
                      </h3>

                      {/* Tóm tắt nội dung (Hiện đúng 2 dòng như trong ảnh) */}
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
                        {record.summary}
                      </div>

                      {/* Khối danh sách các thẻ Tags */}
                      <div style={{ marginBottom: 8 }}>
                        {record.tags?.map((tag: string, index: number) => (
                          <Tag key={index} style={{ backgroundColor: "#f0f2f5", border: "none", color: "#4f5e71", borderRadius: 4, padding: "4px 10px", fontWeight: "500" }}>
                            {tag}
                          </Tag>
                        ))}
                      </div>
                    </div>

                    {/* Khối thông tin tác giả chuẩn theo ảnh: avatar, tên, đã đăng... */}
                    <div style={{ alignSelf: "flex-end", display: "flex", alignItems: "center", gap: 10, marginTop: 4 }}>
                      <Avatar size={28} src={record.authorAvatar} style={{ backgroundColor: "#1890ff" }}>
                        {!record.authorAvatar && record.authorName?.charAt(0)}
                      </Avatar>
                      <div style={{ display: "flex", flexDirection: "column", lineHeight: 1.3 }}>
                        <span style={{ fontSize: 14, fontWeight: "600", color: "#262626" }}>
                          {record.authorName}
                        </span>
                        <span style={{ fontSize: 12, color: "#8c8c8c" }}>
                          {record.authorDepartment} • đã đăng {record.createdAt} trước
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
          
          {/* Widget 1: Thẻ thịnh hành */}
          <Card 
            title={<span><FireOutlined style={{ color: "#ff4d4f", marginRight: 8 }} />Thẻ Thịnh Hành</span>}
            bodyStyle={{ padding: "16px" }}
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
            <div style={{ textAlign: "center", marginTop: 12 }}>
              <a href="#" style={{ color: "#1890ff", fontWeight: "500" }}>Xem thêm thẻ</a>
            </div>
          </Card>

          {/* Widget 2: Bảng xếp hạng */}
          <Card 
            title={<span><TrophyOutlined style={{ color: "#ffc107", marginRight: 8 }} />Bảng Xếp Hạng</span>}
            bodyStyle={{ padding: "16px" }}
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

          {/* Widget 3: Thống kê hệ thống */}
          <Card 
            title={<span><BarChartOutlined style={{ color: "#1890ff", marginRight: 8 }} />Thống Kê Hệ Thống</span>}
            bodyStyle={{ padding: "16px" }}
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

          {/* Footer bản quyền góc dưới bên phải */}
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