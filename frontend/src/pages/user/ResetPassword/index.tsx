import React, { useState } from 'react';
import { Form, Input, Button, Typography, message, Progress } from 'antd';
import { Lock, ShieldCheck, CheckCircle2, Info, Eye, EyeOff } from 'lucide-react';
import { motion } from 'framer-motion';
import { history } from 'umi';

const { Title, Text, Paragraph } = Typography;

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
    padding: '24px 32px',
    background: '#ffffff',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    gap: '14px',
    marginBottom: '20px',
  },
  logo: {
    width: '64px',
    height: '40px',
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
    marginBottom: '8px',
    fontSize: '34px',
    fontWeight: 800,
    color: '#102a43',
    lineHeight: 1.1,
  },
  subtitle: {
    marginBottom: '20px',
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
    boxShadow: '0 16px 34px rgba(16, 185, 129, 0.18)',
  },
};

const ResetPasswordPage: React.FC = () => {
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const calculateStrength = (pass: string) => {
    let score = 0;
    if (pass.length > 8) score += 25;
    if (/[A-Z]/.test(pass)) score += 25;
    if (/[0-9]/.test(pass)) score += 25;
    if (/[^A-Za-z0-9]/.test(pass)) score += 25;
    return score;
  };

  const strength = calculateStrength(password);
  const strengthColor = strength < 50 ? '#ff4d4f' : strength < 100 ? '#faad14' : '#52c41a';
  const strengthText = strength < 50 ? 'Yếu' : strength < 100 ? 'Trung bình' : 'Mạnh';

  const onFinish = (values: any) => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      message.success('Mật khẩu của bạn đã được cập nhật thành công!');
      history.push('/user/login');
    }, 2000);
  };

  return (
    <div style={styles.page}>
      <motion.div initial={{ y: 24, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.5 }}>
        <div style={styles.card}>
          <div style={styles.cardBody}>
            <div style={styles.header}>
              <img src="/logo.png" alt="logo" style={styles.logo} />
              <div>
                <Title level={5} style={styles.brandName}>EduStack</Title>
                <Text style={styles.brandTag}>Kết nối học tập và chia sẻ tri thức</Text>
              </div>
            </div>

            <div style={{ display: 'inline-flex', padding: '8px 14px', borderRadius: '999px', background: '#ecfdf5', color: '#10b981', fontWeight: 700, fontSize: '12px', marginBottom: 16 }}>
              Bảo mật tài khoản
            </div>
            
            <Title style={styles.title}>Mật khẩu mới</Title>
            <Text style={styles.subtitle}>Tạo mật khẩu mới an toàn để hoàn tất quá trình khôi phục tài khoản của bạn.</Text>

              <Form layout="vertical" onFinish={onFinish} requiredMark={false}>
                <Form.Item
                  label={<span style={{ color: '#475569', fontWeight: 600 }}>Mật khẩu mới</span>}
                  name="password"
                  rules={[{ required: true, message: 'Vui lòng nhập mật khẩu mới!' }, { min: 8, message: 'Mật khẩu phải từ 8 ký tự!' }]}
                >
                  <Input.Password
                    prefix={<Lock size={18} color="#10b981" style={{ marginRight: 8 }} />}
                    placeholder="Nhập mật khẩu mới"
                    className='auth-input'
                    style={styles.input}
                    onChange={(e) => setPassword(e.target.value)}
                    iconRender={(visible) => (visible ? <Eye size={18} color="#94a3b8" /> : <EyeOff size={18} color="#94a3b8" />)}
                  />
                </Form.Item>

                {password && (
                  <div style={{ marginBottom: 18 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                      <Text style={{ color: '#64748b', fontSize: 12 }}>Độ mạnh: <b style={{ color: strengthColor }}>{strengthText}</b></Text>
                      <Text style={{ color: '#64748b', fontSize: 12 }}>{strength}%</Text>
                    </div>
                    <Progress percent={strength} showInfo={false} strokeColor={strengthColor} trailColor="#e2e8f0" size="small" />
                  </div>
                )}

                <Form.Item
                  label={<span style={{ color: '#475569', fontWeight: 600 }}>Xác nhận mật khẩu</span>}
                  name="confirm"
                  dependencies={['password']}
                  rules={[
                    { required: true, message: 'Vui lòng xác nhận lại mật khẩu!' },
                    ({ getFieldValue }) => ({
                      validator(_, value) {
                        if (!value || getFieldValue('password') === value) {
                          return Promise.resolve();
                        }
                        return Promise.reject(new Error('Mật khẩu xác nhận không khớp!'));
                      },
                    }),
                  ]}
                >
                  <Input.Password
                    prefix={<ShieldCheck size={18} color="#10b981" style={{ marginRight: 8 }} />}
                    placeholder="Nhập lại mật khẩu mới"
                    className='auth-input'
                    style={styles.input}
                    iconRender={(visible) => (visible ? <Eye size={18} color="#94a3b8" /> : <EyeOff size={18} color="#94a3b8" />)}
                  />
                </Form.Item>

                <div style={{ background: '#f8fafc', padding: 14, borderRadius: 16, marginBottom: 24, border: '1px solid #e2e8f0' }}>
                  <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                    <Info size={18} color="#2563eb" style={{ marginTop: 2 }} />
                    <Paragraph style={{ margin: 0, color: '#64748b', fontSize: 13 }}>
                      Mật khẩu nên có chữ hoa, số và ký tự đặc biệt để bảo mật tốt hơn.
                    </Paragraph>
                  </div>
                </div>

                <Button type="primary" block htmlType="submit" loading={loading} style={{ ...styles.submit, background: '#10b981', borderColor: '#10b981' }}>CẬP NHẬT MẬT KHẨU <CheckCircle2 size={18} style={{ marginLeft: 8 }} /></Button>
              </Form>

              <div style={{ textAlign: 'center', marginTop: 18 }}>
                <a href="/user/login" style={{ color: '#2563eb', fontWeight: 600 }}>Quay lại trang đăng nhập</a>
              </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default ResetPasswordPage;