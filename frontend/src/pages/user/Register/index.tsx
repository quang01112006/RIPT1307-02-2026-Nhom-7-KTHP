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
      padding: '24px',
    },
    card: {
      width: '100%',
      maxWidth: '520px',
      borderRadius: '28px',
      border: '1px solid #e8eff8',
      boxShadow: '0 32px 90px rgba(15, 23, 42, 0.08)',
      overflow: 'hidden',
    },
    cardBody: {
      padding: '42px 38px',
      background: '#ffffff',
    },
    header: {
      display: 'flex',
      alignItems: 'center',
      gap: '14px',
      marginBottom: '28px',
    },
    logo: {
      width: '48px',
      height: '48px',
      borderRadius: '14px',
      objectFit: 'cover',
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
      marginBottom: '8px',
      fontSize: '34px',
      fontWeight: 800,
      color: '#102a43',
      lineHeight: 1.1,
    },
    subtitle: {
      marginBottom: '28px',
      color: '#64748b',
      fontSize: '15px',
      lineHeight: 1.6,
    },
    input: {
      borderRadius: '14px',
      height: '52px',
      background: '#f7f8fc',
      borderColor: '#dbe3ee',
      color: '#102a43',
    },
    submit: {
      marginTop: '16px',
      height: '56px',
      borderRadius: '14px',
      fontWeight: 700,
      fontSize: '16px',
      boxShadow: '0 16px 34px rgba(99, 102, 241, 0.18)',
    },
    footerText: {
      marginTop: '24px',
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
      <motion.div initial={{ y: 24, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.5 }}>
        <Card style={styles.card} bodyStyle={styles.cardBody} bordered={false}>
          <div style={styles.header}>
            <img src="/logo.png" alt="logo" style={styles.logo} />
            <div>
              <Title level={5} style={styles.brandName}>EduStack</Title>
              <Text style={styles.brandTag}>Học tập cùng cộng đồng, thiết kế trải nghiệm tinh tế</Text>
            </div>
          </div>

          <div style={{ display: 'inline-flex', padding: '8px 14px', borderRadius: '999px', background: '#eef4ff', color: '#2563eb', fontWeight: 700, fontSize: '12px', marginBottom: 16 }}>
            Chỉ 1 phút để đăng ký
          </div>
          <Title style={styles.title}>Tạo tài khoản</Title>
          <Text style={styles.subtitle}>Điền đầy đủ thông tin dưới đây để tham gia hệ thống EduStack và quản lý nội dung dễ dàng.</Text>

          <Form layout="vertical" size="large" onFinish={onFinish}>
            <Form.Item label="Họ và tên" name="name" rules={[{ required: true, message: 'Vui lòng nhập họ và tên' }]}> 
              <Input className="auth-input" prefix={<UserPlus size={18} color="#667085" />} style={styles.input} placeholder="Nhập họ và tên" />
            </Form.Item>

            <Form.Item label="Email" name="email" rules={[{ required: true, message: 'Vui lòng nhập email' }, { type: 'email', message: 'Email không hợp lệ' }]}> 
              <Input className="auth-input" prefix={<Mail size={18} color="#667085" />} style={styles.input} placeholder="Nhập email" />
            </Form.Item>

            <Form.Item label="Mã SV/GV" name="code" rules={[{ required: true, message: 'Vui lòng nhập mã SV/GV' }]}> 
              <Input className="auth-input" prefix={<ShieldCheck size={18} color="#667085" />} style={styles.input} placeholder="Nhập mã SV/GV" />
            </Form.Item>

            <Form.Item label="Mật khẩu" name="password" rules={[{ required: true, message: 'Vui lòng nhập mật khẩu' }, { min: 8, message: 'Mật khẩu tối thiểu 8 ký tự' }]}> 
              <Input.Password className="auth-input" prefix={<Lock size={18} color="#667085" />} style={styles.input} placeholder="Nhập mật khẩu" />
            </Form.Item>

            <Form.Item label="Xác nhận mật khẩu" name="confirm" rules={[{ required: true, message: 'Vui lòng xác nhận mật khẩu' }]}> 
              <Input.Password className="auth-input" prefix={<Lock size={18} color="#667085" />} style={styles.input} placeholder="Nhập lại mật khẩu" />
            </Form.Item>

            <Form.Item>
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
