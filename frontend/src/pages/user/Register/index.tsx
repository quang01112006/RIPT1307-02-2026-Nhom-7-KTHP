import React from 'react';
import { Form, Input, Button, Typography, Card, Row, Col, Space, message, Checkbox } from 'antd';
import { UserPlus, Mail, Lock, ShieldCheck, ArrowRight, CheckCircle, Sparkles, Phone } from 'lucide-react';
import { motion } from 'framer-motion';

const { Title, Text, Paragraph } = Typography;

const RegisterPage: React.FC = () => {
  const s: { [key: string]: React.CSSProperties } = {
    layout: { minHeight: '100vh', background: '#020617', display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '40px 20px' },
    card: { width: '100%', maxWidth: '1100px', borderRadius: '40px', background: '#0f172a', border: '1px solid rgba(255,255,255,0.05)', overflow: 'hidden', boxShadow: '0 40px 100px rgba(0,0,0,0.6)' },
    left: { background: 'linear-gradient(180deg, #4f46e5 0%, #1e1b4b 100%)', padding: '60px', height: '100%', color: '#fff', display: 'flex', flexDirection: 'column', position: 'relative' },
    right: { padding: '60px', background: 'transparent' },
    input: { borderRadius: '14px', height: '52px', background: '#1e293b', border: '1px solid #334155', color: '#fff' },
    btn: { height: '58px', borderRadius: '18px', background: 'linear-gradient(90deg, #6366f1, #a855f7)', border: 'none', fontWeight: 800, fontSize: '18px', color: '#fff', marginTop: 20 }
  };

  return (
    <div style={s.layout}>
      <motion.div initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.7 }}>
        <Card style={s.card} bodyStyle={{ padding: 0 }} bordered={false}>
          <Row>
            <Col xs={0} lg={11}>
              <div style={s.left}>
                <div style={{ background: 'rgba(255,255,255,0.1)', padding: 12, borderRadius: 14, width: 'fit-content', marginBottom: 40 }}>
                  <Sparkles color="#fff" size={28} />
                </div>
                <Title level={1} style={{ color: '#fff', fontWeight: 900, fontSize: '48px', lineHeight: 1.2 }}>Bắt đầu kỷ nguyên <br /> tri thức mới.</Title>
                <Paragraph style={{ color: '#c7d2fe', fontSize: '18px', marginTop: 24, marginBottom: 50 }}>
                  Chỉ mất 1 phút để sở hữu tài khoản EduStack và tiếp cận hàng ngàn tài nguyên học tập giá trị.
                </Paragraph>
                
                <Space direction="vertical" size={24}>
                  {[
                    { t: 'Định danh sinh viên PTIT', d: 'Xác thực nhanh qua email học viện.' },
                    { t: 'Lộ trình cá nhân hóa', d: 'Hệ thống gợi ý môn học thông minh.' },
                    { t: 'Bảo mật tuyệt đối', d: 'Mã hóa dữ liệu chuẩn quốc tế.' }
                  ].map((item, i) => (
                    <div key={i} style={{ display: 'flex', gap: 16 }}>
                      <div style={{ background: 'rgba(99,102,241,0.2)', padding: 10, borderRadius: 12, height: 'fit-content' }}>
                        <CheckCircle color="#818cf8" size={20} />
                      </div>
                      <div>
                        <Text style={{ color: '#fff', fontWeight: 700, display: 'block' }}>{item.t}</Text>
                        <Text style={{ color: '#94a3b8', fontSize: '14px' }}>{item.d}</Text>
                      </div>
                    </div>
                  ))}
                </Space>

                <div style={{ marginTop: 'auto', paddingTop: 40 }}>
                  <Text style={{ color: '#6366f1' }}>© 2026 EduStack Team - PTIT Project</Text>
                </div>
              </div>
            </Col>
            <Col xs={24} lg={13}>
              <div style={s.right}>
                <Title level={2} style={{ color: '#fff', fontWeight: 800, marginBottom: 8 }}>Tạo tài khoản</Title>
                <Text style={{ color: '#64748b', display: 'block', marginBottom: 40 }}>Điền thông tin bên dưới để đăng ký</Text>
                
                <Form layout="vertical" size="large" onFinish={() => message.success('Đăng ký thành công!')}>
                  <Row gutter={16}>
                    <Col span={12}>
                      <Form.Item label={<span style={{color: '#94a3b8'}}>Họ và tên</span>} name="name" rules={[{ required: true }]}>
                        <Input prefix={<UserPlus size={18} color="#6366f1" />} style={s.input} />
                      </Form.Item>
                    </Col>
                    <Col span={12}>
                      <Form.Item label={<span style={{color: '#94a3b8'}}>Số điện thoại</span>} name="phone">
                        <Input prefix={<Phone size={18} color="#6366f1" />} placeholder="09xxx" style={s.input} />
                      </Form.Item>
                    </Col>
                  </Row>

                  <Form.Item label={<span style={{color: '#94a3b8'}}>Email học viện</span>} name="email" rules={[{ required: true, type: 'email' }]}>
                    <Input prefix={<Mail size={18} color="#6366f1" />} placeholder="name@student.ptit.edu.vn" style={s.input} />
                  </Form.Item>

                  <Row gutter={16}>
                    <Col span={12}>
                      <Form.Item label={<span style={{color: '#94a3b8'}}>Mật khẩu</span>} name="password" rules={[{ required: true, min: 8 }]}>
                        <Input.Password style={s.input}/>
                      </Form.Item>
                    </Col>
                    <Col span={12}>
                      <Form.Item label={<span style={{color: '#94a3b8'}}>Xác nhận</span>} name="confirm" rules={[{ required: true }]}>
                        <Input.Password style={s.input}/>
                      </Form.Item>
                    </Col>
                  </Row>

                  <Form.Item name="agreement" valuePropName="checked" rules={[{ validator: (_, value) => value ? Promise.resolve() : Promise.reject(new Error('Vui lòng đồng ý điều khoản!')) }]}>
                    <Checkbox style={{ color: '#94a3b8' }}>
                      Tôi đồng ý với <a href="#" style={{ color: '#818cf8' }}>Điều khoản & Chính sách</a> của EduStack
                    </Checkbox>
                  </Form.Item>

                  <Button type="primary" block htmlType="submit" style={s.btn}>
                    BẮT ĐẦU NGAY <ArrowRight size={20} style={{ marginLeft: 10 }} />
                  </Button>

                  <div style={{ textAlign: 'center', marginTop: 30 }}>
                    <Text style={{ color: '#64748b' }}>Bạn đã có tài khoản? <a href="/user/Login" style={{ color: '#818cf8', fontWeight: 700 }}>Đăng nhập</a></Text>
                  </div>
                </Form>
              </div>
            </Col>
          </Row>
        </Card>
      </motion.div>
    </div>
  );
};

export default RegisterPage;