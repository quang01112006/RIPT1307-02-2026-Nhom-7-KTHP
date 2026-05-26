import React from 'react';
import { Card, Typography } from 'antd';

const { Title, Text } = Typography;

const Leaderboard: React.FC = () => {
  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '16px 24px' }}>
      <Title level={2}>Bảng xếp hạng thành viên</Title>
      <Text type="secondary">Trang này đang được phát triển bởi team...</Text>
      <Card style={{ marginTop: 24 }}>
        <p>Bảng vinh danh các thành viên tích cực nhất sẽ hiển thị ở đây.</p>
      </Card>
    </div>
  );
};

export default Leaderboard;
