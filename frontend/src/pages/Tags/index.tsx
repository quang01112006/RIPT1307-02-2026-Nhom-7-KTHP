import React from 'react';
import { Card, Typography } from 'antd';

const { Title, Text } = Typography;

const Tags: React.FC = () => {
  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '16px 24px' }}>
      <Title level={2}>Danh sách Thẻ từ khóa (Tags)</Title>
      <Text type="secondary">Trang này đang được phát triển bởi team...</Text>
      <Card style={{ marginTop: 24 }}>
        <p>Danh sách các thẻ từ khóa phổ biến sẽ hiển thị ở đây.</p>
      </Card>
    </div>
  );
};

export default Tags;
