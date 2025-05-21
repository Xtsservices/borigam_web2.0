import React from "react";
import { Form, Input, Button, Typography } from "antd";
import { MailOutlined , LockOutlined} from "@ant-design/icons";
import borigam_profile from "../assets/borigam-new.png";

const { Title, Text } = Typography;

const ForgotPassword: React.FC = () => {
  const [form] = Form.useForm();

  const onFinish = (values: any) => {
    console.log("Forgot Password Request:", values);
  };

  return (
    <div className="container">
      {/* Left Panel */}
      <div className="leftpanel">
        <img src={borigam_profile} alt="Profile" className="logo-img" />
      </div>

      {/* Right Panel */}
      <div className="rightpanel">
        <Title level={3} className="forgot-title">
          Forgot Password?
        </Title>
        <hr className="title-underline" />
        <Text className="forgot-text">
          check if email is verified or not? if verified then reset password
        </Text>

        <Form form={form} layout="vertical" onFinish={onFinish}>
          <Form.Item
            name="contact"
            rules={[{ required: true, message: "Enter your email or mobile!" }]}
          >
            <Input
              prefix={<MailOutlined />}
              placeholder="Enter email or mobile"
              size="large"
            />
          </Form.Item>
          <Form.Item
            name="New Password"
            rules={[{ required: true, message: "Enter new password!" }]}
          >
            <Input.Password prefix={<LockOutlined />} placeholder="Enter new password" size="large" />
          </Form.Item>
          <Form.Item
            name="Retype Password"
            rules={[{ required: true, message: "Retype new password!" }]}
          >
            <Input.Password prefix={<LockOutlined />} placeholder="Retype new password" size="large" />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" block>
              Reset Password
            </Button>
          </Form.Item>
        </Form>
      </div>
    </div>
  );
};

export default ForgotPassword;
