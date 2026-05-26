import React from 'react';
import { Card, Typography } from 'antd';

const { Title, Text } = Typography;

const Notifications: React.FC = () => {
  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '16px 24px' }}>
      <Title level={2}>Thông báo của bạn</Title>
      <Text type="secondary">Trang này đang được phát triển bởi team...</Text>
      <Card style={{ marginTop: 24 }}>
        <p>Danh sách thông báo sẽ hiển thị ở đây.</p>
      </Card>
    </div>
  );
};

export default Notifications;
