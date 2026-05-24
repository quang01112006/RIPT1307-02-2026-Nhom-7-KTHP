import React, { useState } from "react";
import { Card, Input, Tag, Avatar, Space } from "antd";
import {
  CheckCircleFilled,
  PaperClipOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import { useModel } from "umi";
import TableBase from "@/components/Table";
import "./components/style.less";

const FormChiTietQuestion = () => {
  const model = useModel("baiviet") || {};
  const { record } = model;

  return (
    <div style={{ padding: "8px 16px" }}>
      <h3>{record?.title}</h3>
      <p style={{ color: "#595959" }}>{record?.summary}</p>
    </div>
  );
};

const TrangChu = () => {
  const model = useModel("baiviet") || {};

  const [activeTab, setActiveTab] = useState("newest");
  const [searchText, setSearchText] = useState("");

  const columns = [
    {
      title: () => (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 16,
            width: "100%",
          }}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <div>
                <h2
                  style={{
                    fontSize: 24,
                    fontWeight: "bold",
                    margin: 0,
                    color: "#1f1f1f",
                  }}
                >
                  Tất cả câu hỏi
                </h2>

                <span style={{ fontSize: 13, color: "#8c8c8c" }}>
                  2,451 câu hỏi đang chờ bạn giải đáp
                </span>
              </div>

              <div style={{ width: 350 }}>
                <Input
                  placeholder="Tìm kiếm câu hỏi..."
                  prefix={<SearchOutlined style={{ color: "#bfbfbf" }} />}
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  style={{
                    borderRadius: 20,
                    backgroundColor: "#f5f5f5",
                    border: "none",
                  }}
                  allowClear
                />
              </div>
            </div>

            <div style={{ borderBottom: "1px solid #f0f0f0" }}>
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
                        padding: "8px 4px",
                        cursor: "pointer",
                        fontWeight: isActive ? "bold" : "normal",
                        color: isActive ? "#000000" : "#595959",
                        borderBottom: isActive
                          ? "2px solid #1890ff"
                          : "2px solid transparent",
                        transition: "all 0.3s",
                      }}
                    >
                      {tab.label}
                    </div>
                  );
                })}
              </Space>
            </div>
          </div>
        </div>
      ),

      dataIndex: "allData",
      key: "allData",

      render: (_: any, record: any) => {
        const isResolved = record.isResolved ?? false;

        return (
          <div
            style={{
              display: "flex",
              backgroundColor: "#ffffff",
              border: "1px solid #f0f0f0",
              borderRadius: 8,
              padding: "16px 20px",
              marginBottom: 16,
              boxShadow: "0 1px 2px rgba(0,0,0,0.02)",
            }}
          >
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                width: 90,
                flexShrink: 0,
                borderRight: "1px solid #f5f5f5",
                paddingRight: 16,
                marginRight: 16,
                gap: 8,
              }}
            >
              <div
                style={{
                  textAlign: "center",
                  fontSize: 12,
                  color: "#8c8c8c",
                }}
              >
                <div
                  style={{
                    fontWeight: "bold",
                    color: "#262626",
                    fontSize: 14,
                  }}
                >
                  {record.votes ?? 0}
                </div>

                Bình chọn
              </div>

              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  width: 64,
                  height: 54,
                  borderRadius: 4,
                  border: isResolved
                    ? "1px solid #1890ff"
                    : "1px solid #d9d9d9",
                  backgroundColor: isResolved
                    ? "#e6f7ff"
                    : "transparent",
                  color: isResolved ? "#1890ff" : "#262626",
                }}
              >
                <span style={{ fontWeight: "bold", fontSize: 15 }}>
                  {record.answers ?? 0}
                </span>

                <span
                  style={{
                    fontSize: 11,
                    color: isResolved ? "#1890ff" : "#8c8c8c",
                  }}
                >
                  Đáp án
                </span>

                {isResolved && (
                  <CheckCircleFilled
                    style={{
                      color: "#1890ff",
                      fontSize: 12,
                      marginTop: 2,
                    }}
                  />
                )}
              </div>

              <div
                style={{
                  fontSize: 12,
                  color: "#8c8c8c",
                  textAlign: "center",
                }}
              >
                {record.views ?? 0} Lượt xem
              </div>
            </div>

            <div
              style={{
                flexGrow: 1,
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
              }}
            >
              <div>
                <h3
                  style={{
                    color: "#1890ff",
                    fontWeight: "bold",
                    fontSize: 16,
                    margin: "0 0 8px 0",
                    cursor: "pointer",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 6,
                  }}
                  onClick={() => {
                    console.log(record);
                  }}
                >
                  {record.title}

                  {record.hasAttachment && (
                    <PaperClipOutlined
                      style={{ color: "#bfbfbf", fontSize: 14 }}
                    />
                  )}
                </h3>

                <div
                  style={{
                    color: "#595959",
                    fontSize: 14,
                    marginBottom: 12,
                    display: "-webkit-box",
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: "vertical",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    lineHeight: "1.5",
                  }}
                >
                  {record.summary}
                </div>

                <div style={{ marginBottom: 8 }}>
                  {record.tags?.map((tag: string, index: number) => (
                    <Tag
                      key={index}
                      style={{
                        backgroundColor: "#f0f5ff",
                        border: "none",
                        color: "#2f54eb",
                        borderRadius: 4,
                        padding: "2px 8px",
                      }}
                    >
                      {tag}
                    </Tag>
                  ))}
                </div>
              </div>

              <div
                style={{
                  alignSelf: "flex-end",
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  marginTop: 4,
                }}
              >
                <Avatar size={24} src={record.authorAvatar}>
                  {!record.authorAvatar && "U"}
                </Avatar>

                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    lineHeight: 1.2,
                  }}
                >
                  <span
                    style={{
                      fontSize: 13,
                      fontWeight: "bold",
                      color: "#434343",
                    }}
                  >
                    {record.authorName}
                  </span>

                  <span style={{ fontSize: 11, color: "#8c8c8c" }}>
                    {record.authorDepartment} • {record.createdAt}
                  </span>
                </div>
              </div>
            </div>
          </div>
        );
      },
    },
  ];

  return (
    <Card bodyStyle={{ padding: "16px", backgroundColor: "#f5f5f5" }}>
      <TableBase
        modelName="baiviet"
        columns={columns}
        Form={FormChiTietQuestion}
        showHeader={false}
      />
    </Card>
  );
};

export default TrangChu;