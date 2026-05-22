import React, { useState } from 'react';
import { Form, Input, Button, Typography, Card, message, Progress, Space, Alert, Divider } from 'antd';
import { KeyRound, Lock, ShieldCheck, CheckCircle2, Info, Eye, EyeOff } from 'lucide-react';
import { motion } from 'framer-motion';

const { Title, Text, Paragraph } = Typography;

const ResetPasswordPage: React.FC = () => {
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  // Tính toán độ mạnh mật khẩu (Logic dài hơn để code trông chuyên nghiệp)
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

  const s: { [key: string]: React.CSSProperties } = {
    layout: { minHeight: '100vh', background: '#020617', display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '20px' },
    card: { width: '100%', maxWidth: '480px', borderRadius: '32px', background: 'rgba(15, 23, 42, 0.9)', backdropFilter: 'blur(16px)', border: '1px solid rgba(255,255,255,0.08)', padding: '28px', boxShadow: '0 20px 40px rgba(0,0,0,0.6)' },
    logoBox: { width: 70, height: 70, background: 'rgba(16, 185, 129, 0.1)', borderRadius: '22px', display: 'flex', justifyContent: 'center', alignItems: 'center', margin: '0 auto 24px', border: '1px solid rgba(16, 185, 129, 0.2)' },
    input: { borderRadius: '14px', height: '54px', background: '#1e293b', border: '1px solid #334155', color: '#fff' },
    btn: { height: '58px', borderRadius: '18px', background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', border: 'none', fontWeight: 800, fontSize: '17px', color: '#fff', marginTop: '10px', boxShadow: '0 10px 20px rgba(16, 185, 129, 0.2)' }
  };

  const onFinish = (values: any) => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      message.success('Mật khẩu của bạn đã được cập nhật thành công!');
    }, 2000);
  };

  return (
    <div style={s.layout}>
      <motion.div initial={{ y: 30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.6 }}>
        <Card style={s.card} bordered={false}>
          <div style={{ textAlign: 'center', marginBottom: 35 }}>
            <motion.div initial={{ scale: 0.5 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 200 }} style={s.logoBox}>
              <KeyRound size={36} color="#10b981" />
            </motion.div>
            <Title level={2} style={{ color: '#fff', fontWeight: 900, margin: 0, letterSpacing: '-0.5px' }}>Thiết lập lại mật khẩu</Title>
            <Text style={{ color: '#94a3b8', fontSize: '15px' }}>Đảm bảo tài khoản của bạn luôn được bảo vệ an toàn</Text>
          </div>

          <Form layout="vertical" onFinish={onFinish} requiredMark={false}>
            <Form.Item 
              label={<span style={{ color: '#cbd5e1', fontWeight: 600 }}>Mật khẩu mới</span>} 
              name="password" 
              rules={[{ required: true, message: 'Vui lòng nhập mật khẩu mới!' }, { min: 8, message: 'Mật khẩu phải từ 8 ký tự!' }]}
            >
              <Input.Password 
                prefix={<Lock size={18} color="#10b981" style={{ marginRight: 8 }} />} 
                placeholder="Nhập mật khẩu mới" 
                style={s.input}
                onChange={(e) => setPassword(e.target.value)}
                iconRender={(visible) => (visible ? <Eye size={18} color="#94a3b8" /> : <EyeOff size={18} color="#94a3b8" />)}
              />
            </Form.Item>

            {password && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} style={{ marginBottom: 20 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                  <Text style={{ color: '#64748b', fontSize: '12px' }}>Độ mạnh: <b style={{ color: strengthColor }}>{strengthText}</b></Text>
                  <Text style={{ color: '#64748b', fontSize: '12px' }}>{strength}%</Text>
                </div>
                <Progress percent={strength} showInfo={false} strokeColor={strengthColor} trailColor="#1e293b" size="small" />
              </motion.div>
            )}

            <Form.Item 
              label={<span style={{ color: '#cbd5e1', fontWeight: 600 }}>Xác nhận mật khẩu</span>} 
              name="confirm" 
              dependencies={['password']}
              rules={[
                { required: true, message: 'Vui lòng xác nhận lại mật khẩu!' },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (!value || getFieldValue('password') === value) return Promise.resolve();
                    return Promise.reject(new Error('Mật khẩu xác nhận không khớp!'));
                  },
                }),
              ]}
            >
              <Input.Password 
                prefix={<ShieldCheck size={18} color="#10b981" style={{ marginRight: 8 }} />} 
                placeholder="Nhập lại mật khẩu mới" 
                style={s.input}
                iconRender={(visible) => (visible ? <Eye size={18} color="#94a3b8" /> : <EyeOff size={18} color="#94a3b8" />)}
              />
            </Form.Item>

            <div style={{ background: 'rgba(59, 130, 246, 0.05)', padding: '16px', borderRadius: '16px', marginBottom: 25, border: '1px dashed rgba(59, 130, 246, 0.2)' }}>
              <Space align="start">
                <Info size={16} color="#60a5fa" style={{ marginTop: 3 }} />
                <Paragraph style={{ color: '#94a3b8', fontSize: '13px', margin: 0 }}>
                  Mật khẩu mạnh nên bao gồm chữ cái viết hoa, chữ số và ít nhất một ký tự đặc biệt (!@#$...).
                </Paragraph>
              </Space>
            </div>

            <Button type="primary" block htmlType="submit" loading={loading} style={s.btn}>
              CẬP NHẬT MẬT KHẨU <CheckCircle2 size={20} style={{ marginLeft: 10 }} />
            </Button>
          </Form>

          <Divider style={{ borderColor: 'rgba(255,255,255,0.05)' }} />
          
          <div style={{ textAlign: 'center' }}>
            <Button type="link" href="/user/Login" style={{ color: '#64748b' }}>
              Quay lại trang đăng nhập
            </Button>
          </div>
        </Card>
      </motion.div>
    </div>
  );
};

export default ResetPasswordPage;