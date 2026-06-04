import React from 'react';
import { Form, Input, Button, Typography, Card, message } from 'antd';
import { UserPlus, Mail, Lock, ShieldCheck, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { register } from '@/services/base/api';

const { Title, Text } = Typography;

const RegisterPage: React.FC = () => {
  const styles: { [key: string]: React.CSSProperties } = {
    page: {
      minHeight: '100vh',
      background: 'radial-gradient(circle at top, rgba(56, 189, 248, 0.18), transparent 35%), #f5f7fb',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '16px',
    },
    card: {
      width: '100%',
      maxWidth: '640px',
      borderRadius: '28px',
      border: '1px solid #e8eff8',
      boxShadow: '0 32px 90px rgba(15, 23, 42, 0.08)',
      overflow: 'hidden',
      boxSizing: 'border-box',
    },
    cardBody: {
      padding: '22px 28px',
      background: '#ffffff',
    },
    header: {
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      marginBottom: '18px',
    },
    logo: {
      width: '56px',
      height: '36px',
      borderRadius: '6px',
      objectFit: 'contain',
    },
    brandName: {
      margin: 0,
      fontSize: '22px',
      fontWeight: 700,
      color: '#102a43',
      lineHeight: 1.1,
    },
    brandTag: {
      fontSize: '14px',
      color: '#64748b',
      margin: 0,
    },
    title: {
      marginBottom: '6px',
      fontSize: '26px',
      fontWeight: 700,
      color: '#102a43',
      lineHeight: 1.15,
    },
    subtitle: {
      marginBottom: '12px',
      color: '#64748b',
      fontSize: '14px',
      lineHeight: 1.4,
    },
    input: {
      borderRadius: '12px',
      height: '40px',
      background: '#f7f8fc',
      borderColor: '#dbe3ee',
      color: '#102a43',
    },
    submit: {
      marginTop: '10px',
      height: '44px',
      borderRadius: '12px',
      fontWeight: 700,
      fontSize: '14px',
      boxShadow: '0 10px 22px rgba(99, 102, 241, 0.10)',
    },
    footerText: {
      marginTop: '12px',
      textAlign: 'center' as const,
      color: '#64748b',
    },
  };

  const onFinish = async (values: any) => {
    try {
      if (values.password !== values.confirm) {
        return message.error('Mật khẩu xác nhận không khớp!');
      }
      const payload = {
        fullName: values.name,
        email: values.email,
        password: values.password,
        code: values.code,
      };

      await register(payload);
      message.success('Đăng ký tài khoản thành công!');
      setTimeout(() => {
        window.location.href = '/user/login';
      }, 1000);
    } catch (error: any) {
      const errorMsg = error?.response?.data?.message || 'Đăng ký thất bại!';
      message.error(errorMsg);
    }
  };

  return (
    <div style={styles.page}>
      <motion.div initial={{ y: 24, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.5 }} style={{ width: '100%', maxWidth: '560px' }}>
        <Card style={styles.card} bodyStyle={styles.cardBody} bordered={false}>
          <div style={styles.header}>
            <img src="/logo.png" alt="logo" style={styles.logo} />
            <div>
              <Title level={5} style={styles.brandName}>EduStack</Title>
              <Text style={styles.brandTag}>Kết nối học tập và chia sẻ tri thức</Text>
            </div>
          </div>

          <div style={{ display: 'inline-flex', padding: '6px 12px', borderRadius: '999px', background: '#eef4ff', color: '#2563eb', fontWeight: 700, fontSize: '12px', marginBottom: 12 }}>
            Chỉ 1 phút để đăng ký
          </div>
          <Title style={styles.title}>Tạo tài khoản</Title>
          <Text style={styles.subtitle}>Điền nhanh thông tin để bắt đầu sử dụng EduStack.</Text>

          <Form layout="vertical" size="middle" onFinish={onFinish}>
            <Form.Item style={{ marginBottom: 12 }} label="Họ và tên" name="name" rules={[{ required: true, message: 'Vui lòng nhập họ và tên' }]}> 
              <Input className="auth-input" prefix={<UserPlus size={18} color="#667085" />} style={styles.input} placeholder="Nhập họ và tên" />
            </Form.Item>

            <Form.Item style={{ marginBottom: 12 }} label="Email" name="email" rules={[{ required: true, message: 'Vui lòng nhập email' }, { type: 'email', message: 'Email không hợp lệ' }]}> 
              <Input className="auth-input" prefix={<Mail size={18} color="#667085" />} style={styles.input} placeholder="Nhập email" />
            </Form.Item>

            <Form.Item style={{ marginBottom: 12 }} label="Mã SV/GV" name="code" rules={[{ required: true, message: 'Vui lòng nhập mã SV/GV' }]}> 
              <Input className="auth-input" prefix={<ShieldCheck size={18} color="#667085" />} style={styles.input} placeholder="Nhập mã SV/GV" />
            </Form.Item>

            <Form.Item style={{ marginBottom: 12 }} label="Mật khẩu" name="password" rules={[{ required: true, message: 'Vui lòng nhập mật khẩu' }, { min: 8, message: 'Mật khẩu tối thiểu 8 ký tự' }]}> 
              <Input.Password className="auth-input" prefix={<Lock size={18} color="#667085" />} style={styles.input} placeholder="Nhập mật khẩu" />
            </Form.Item>

            <Form.Item style={{ marginBottom: 12 }} label="Xác nhận mật khẩu" name="confirm" rules={[{ required: true, message: 'Vui lòng xác nhận mật khẩu' }]}> 
              <Input.Password className="auth-input" prefix={<Lock size={18} color="#667085" />} style={styles.input} placeholder="Nhập lại mật khẩu" />
            </Form.Item>

            <Form.Item style={{ marginBottom: 0 }}>
              <Button type="primary" htmlType="submit" block style={styles.submit}>
                Đăng ký <ArrowRight size={18} style={{ marginLeft: 8 }} />
              </Button>
            </Form.Item>
          </Form>

          <div style={styles.footerText}>
            <Text>Đã có tài khoản? <a href="/user/login">Đăng nhập</a></Text>
          </div>
        </Card>
      </motion.div>
    </div>
  );
};

export default RegisterPage;
