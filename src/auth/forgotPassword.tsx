import React from "react";
import { Form, Input, Button, Typography, message } from "antd";
import { MailOutlined } from "@ant-design/icons";
import borigam_profile from "../assets/borigam_profile.png";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const { Title, Text } = Typography;

const ForgotPassword: React.FC = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const [loading, setLoading] = React.useState(false);

  const onFinish = async (values: { email: string }) => {
    try {
      setLoading(true);
      const response = await axios.post(
        "http://localhost:3001/api/users/forgotPassword",
        {
          email: values.email,
        }
      );

      if (response.data.type) {
        message.success(response.data.message);
        // Navigate to login after showing success message
        setTimeout(() => {
          navigate("/login");
        }, 1500);
      } else {
        message.error(response.data.message || "Failed to reset password");
      }
    } catch (error: any) {
      message.error(
        error.response?.data?.message || "An error occurred. Please try again."
      );
    } finally {
      setLoading(false);
    }
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
          Enter your email to reset your password.
        </Text>

        <Form form={form} layout="vertical" onFinish={onFinish}>
          <Form.Item
            name="email"
            rules={[
              { required: true, message: "Please enter your email!" },
              { type: "email", message: "Please enter a valid email!" },
            ]}
          >
            <Input
              prefix={<MailOutlined />}
              placeholder="Enter your email"
              size="large"
            />
          </Form.Item>
          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              block
              loading={loading}
              disabled={loading}
            >
              Reset Password
            </Button>
          </Form.Item>
        </Form>
      </div>
    </div>
  );
};

export default ForgotPassword;