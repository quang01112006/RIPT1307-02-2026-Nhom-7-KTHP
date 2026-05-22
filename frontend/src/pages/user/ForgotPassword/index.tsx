import React, { useState, useEffect } from 'react';
import { Form, Input, Button, Typography, Card, Steps, message, Divider } from 'antd';
import { Mail, ChevronLeft, Send, ShieldCheck, Fingerprint, Timer, RefreshCcw, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const { Title, Text, Paragraph } = Typography;

const ForgotPasswordPage: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [countdown, setCountdown] = useState(0);

  // Xử lý đếm ngược gửi lại mã
  useEffect(() => {
    let timer: any;
    if (countdown > 0) {
      timer = setInterval(() => setCountdown((prev) => prev - 1), 1000);
    }
    return () => clearInterval(timer);
  }, [countdown]);

  const handleSendEmail = (values: any) => {
    setLoading(true);
    setEmail(values.email);
    // Giả lập gửi email trong 1.5s
    setTimeout(() => {
      setLoading(false);
      setCurrentStep(1);
      setCountdown(60);
      message.success('Mã xác thực đã được gửi đến email của bạn!');
    }, 1500);
  };

  const handleVerifyOTP = (values: any) => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      message.success('Xác thực thành công! Đang chuyển đến trang đặt lại mật khẩu.');
      // Điều hướng tới trang ResetPassword
      window.location.href = '/user/ResetPassword';
    }, 1500);
  };

  const s: { [key: string]: React.CSSProperties } = {
    layout: { minHeight: '100vh', background: '#020617', display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '20px' },
    card: { width: '100%', maxWidth: '500px', borderRadius: '32px', background: 'rgba(15, 23, 42, 0.9)', backdropFilter: 'blur(16px)', border: '1px solid rgba(255,255,255,0.08)', padding: '32px' },
    iconBox: { width: 80, height: 80, background: 'rgba(99,102,241,0.1)', borderRadius: '24px', display: 'flex', justifyContent: 'center', alignItems: 'center', margin: '0 auto 24px', border: '1px solid rgba(99,102,241,0.2)' },
    input: { borderRadius: '14px', height: '54px', background: '#1e293b', border: '1px solid #334155', color: '#fff' },
    btn: { height: '56px', borderRadius: '16px', background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)', border: 'none', fontWeight: 800, fontSize: '16px', color: '#fff' },
    stepWrapper: { marginBottom: '40px' }
  };

  return (
    <div style={s.layout}>
      <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 0.5 }}>
        <Card style={s.card} bordered={false}>
          <div style={s.stepWrapper}>
            <Steps
              current={currentStep}
              responsive={false}
            >
              <Steps.Step title="Gửi mail" />
              <Steps.Step title="Xác thực" />
            </Steps>
          </div>

          <AnimatePresence>
            {currentStep === 0 ? (
              <motion.div
                key="step1"
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: 20, opacity: 0 }}
              >
                <div style={{ textAlign: 'center' }}>
                  <div style={s.iconBox}><Fingerprint size={40} color="#6366f1" /></div>
                  <Title level={2} style={{ color: '#fff', fontWeight: 900, marginBottom: 12 }}>Quên mật khẩu?</Title>
                  <Paragraph style={{ color: '#94a3b8', marginBottom: 32 }}>
                    Đừng lo lắng! Nhập email học viện của bạn để bắt đầu quá trình khôi phục tài khoản.
                  </Paragraph>
                </div>

                <Form layout="vertical" onFinish={handleSendEmail}>
                  <Form.Item
                    name="email"
                    rules={[
                      { required: true, message: 'Vui lòng nhập Email!' },
                      { type: 'email', message: 'Email không đúng định dạng!' }
                    ]}
                  >
                    <Input 
                      prefix={<Mail size={18} color="#6366f1" style={{ marginRight: 8 }} />} 
                      placeholder="name@student.ptit.edu.vn" 
                      style={s.input} 
                    />
                  </Form.Item>
                  <Button type="primary" block htmlType="submit" loading={loading} style={s.btn}>
                    GỬI MÃ XÁC THỰC <Send size={18} style={{ marginLeft: 10 }} />
                  </Button>
                </Form>
              </motion.div>
            ) : (
              <motion.div
                key="step2"
                initial={{ x: 20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: -20, opacity: 0 }}
              >
                <div style={{ textAlign: 'center' }}>
                  <div style={s.iconBox}><ShieldCheck size={40} color="#10b981" /></div>
                  <Title level={2} style={{ color: '#fff', fontWeight: 900, marginBottom: 12 }}>Kiểm tra Email</Title>
                  <Paragraph style={{ color: '#94a3b8', marginBottom: 32 }}>
                    Chúng tôi đã gửi mã OTP gồm 6 chữ số đến <br /><b style={{ color: '#fff' }}>{email}</b>
                  </Paragraph>
                </div>

                <Form layout="vertical" onFinish={handleVerifyOTP}>
                  <Form.Item
                    name="otp"
                    rules={[{ required: true, message: 'Vui lòng nhập mã OTP!' }, { len: 6, message: 'Mã OTP phải có 6 chữ số!' }]}
                  >
                    <Input 
                      placeholder="0 0 0 0 0 0" 
                      style={{ ...s.input, textAlign: 'center', fontSize: '24px', letterSpacing: '8px' }} 
                      maxLength={6}
                    />
                  </Form.Item>
                  <Button type="primary" block htmlType="submit" loading={loading} style={s.btn}>
                    XÁC THỰC NGAY <ArrowRight size={20} style={{ marginLeft: 10 }} />
                  </Button>
                </Form>

                <div style={{ textAlign: 'center', marginTop: 24 }}>
                  {countdown > 0 ? (
                    <Text style={{ color: '#64748b' }}>
                      <Timer size={14} style={{ marginRight: 6, verticalAlign: 'middle' }} />
                      Gửi lại mã sau <b>{countdown}s</b>
                    </Text>
                  ) : (
                    <Button 
                      type="link" 
                      icon={<RefreshCcw size={16} />} 
                      onClick={() => setCountdown(60)}
                      style={{ color: '#818cf8', fontWeight: 600 }}
                    >
                      Gửi lại mã ngay
                    </Button>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <Divider style={{ borderColor: 'rgba(255,255,255,0.05)', margin: '24px 0' }} />

          <div style={{ textAlign: 'center' }}>
            <Button 
              type="link" 
              icon={<ChevronLeft size={18} />} 
              href="/user/Login" 
              style={{ color: '#64748b', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto' }}
            >
              Quay lại Đăng nhập
            </Button>
          </div>
        </Card>
      </motion.div>
    </div>
  );
};

export default ForgotPasswordPage;