import React, { useState, useEffect } from 'react';
import { Form, Input, Button, Typography, Steps, message, Alert } from 'antd';
import { Mail, Send, ShieldCheck, Timer, RefreshCcw, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { history } from 'umi';
import { forgotPassword as forgotPasswordApi } from '@/services/base/api';

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
    maxWidth: '580px',
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
    boxShadow: '0 16px 34px rgba(59, 130, 246, 0.18)',
  },
};

const ForgotPasswordPage: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [countdown, setCountdown] = useState(0);

  useEffect(() => {
    let timer: any;
    if (countdown > 0) {
      timer = setInterval(() => setCountdown((prev) => prev - 1), 1000);
    }
    return () => clearInterval(timer);
  }, [countdown]);

  const handleSendEmail = async (values: any) => {
    setLoading(true);
    try {
      await forgotPasswordApi(values.email);
      setEmail(values.email);
      setCurrentStep(1);
      setCountdown(60);
      message.success('Mã xác thực đã được gửi đến email của bạn!');
    } catch (error: any) {
      message.error(error?.response?.data?.message || 'Có lỗi xảy ra khi gửi mã xác thực!');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = (values: any) => {
    // Chuyển hướng sang trang Reset Password, truyền email và otp qua state
    history.push({
      pathname: '/user/reset-password',
      state: { email, otp: values.otp }
    });
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

            <div style={{ display: 'inline-flex', padding: '8px 14px', borderRadius: '999px', background: '#eef4ff', color: '#2563eb', fontWeight: 700, fontSize: '12px', marginBottom: 16 }}>
              Quên mật khẩu
            </div>
            
            <Title style={styles.title}>{currentStep === 0 ? 'Khôi phục mật khẩu' : 'Xác thực OTP'}</Title>
            <Text style={styles.subtitle}>{currentStep === 0 ? 'Nhập email học viện của bạn để nhận mã xác thực khôi phục tài khoản.' : `Mã OTP đã được gửi đến ${email}`}</Text>

              <AnimatePresence>
                {currentStep === 0 ? (
                  <motion.div key="step1" initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: 20, opacity: 0 }}>
                    <Form layout="vertical" onFinish={handleSendEmail}>
                      <Form.Item name="email" rules={[{ required: true, message: 'Vui lòng nhập Email!' }, { type: 'email', message: 'Email không đúng định dạng!' }]}>
                        <Input className='auth-input' style={styles.input} placeholder='name@student.ptit.edu.vn' prefix={<Mail size={18} color="#667085" style={{ marginRight: 8 }} />} size='large' />
                      </Form.Item>
                      <Button type="primary" block htmlType="submit" loading={loading} style={styles.submit}>GỬI MÃ XÁC THỰC <Send size={16} style={{ marginLeft: 8 }} /></Button>
                    </Form>
                  </motion.div>
                ) : (
                  <motion.div key="step2" initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -20, opacity: 0 }}>
                    <div style={{ textAlign: 'center', marginBottom: 14 }}>
                      <div style={{ width: 64, height: 64, margin: '0 auto 12px', borderRadius: 20, background: 'rgba(16,185,129,0.08)', display: 'flex', justifyContent: 'center', alignItems: 'center' }}><ShieldCheck size={32} color='#10b981' /></div>
                    </div>

                    <Alert
                      message='Mã OTP đã gửi'
                      description='Vui lòng kiểm tra hộp thư đến (hoặc hộp thư rác) trong email của bạn để lấy mã xác thực 6 chữ số.'
                      type='info'
                      showIcon
                      style={{ marginBottom: 20, borderRadius: 16 }}
                    />
                    <Form layout="vertical" onFinish={handleVerifyOTP}>
                      <Form.Item name="otp" rules={[{ required: true, message: 'Vui lòng nhập mã OTP!' }, { len: 6, message: 'Mã OTP phải có 6 chữ số!' }]}>
                        <Input className='auth-input' placeholder='000000' maxLength={6} style={{ ...styles.input, textAlign: 'center', fontSize: 24, letterSpacing: 8 }} />
                      </Form.Item>
                      <Button type="primary" block htmlType="submit" loading={loading} style={styles.submit}>XÁC THỰC NGAY <ArrowRight size={16} style={{ marginLeft: 8 }} /></Button>
                    </Form>

                    <div style={{ textAlign: 'center', marginTop: 18 }}>
                      {countdown > 0 ? (
                        <Text style={{ color: '#64748b' }}><Timer size={14} style={{ marginRight: 6, verticalAlign: 'middle' }} /> Gửi lại mã sau <b>{countdown}s</b></Text>
                      ) : (
                        <Button type="link" icon={<RefreshCcw size={14} />} onClick={() => setCountdown(60)} style={{ color: '#2563eb', fontWeight: 600 }}>Gửi lại mã</Button>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div style={{ textAlign: 'center', marginTop: 18 }}>
                <a href="/user/login" style={{ color: '#2563eb', fontWeight: 600 }}>Quay lại Đăng nhập</a>
              </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default ForgotPasswordPage;