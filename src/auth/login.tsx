import { useState } from "react";
import { Form, Input, Button, Row, Col, Typography, message } from "antd";
import { UserOutlined, LockOutlined } from "@ant-design/icons";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./styles/signin.css";
import borigam_profile from "../assets/borigam-new.png";
import { Loginapi } from "../services/services/restApi";

const { Title } = Typography;

const Login = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleFinish = async (values: {
    username: string;
    password: string;
  }) => {
    setLoading(true);
    try {
      let payload = {
        email: values.username,
        password: values.password,
      };

      const response = await axios.post(Loginapi(), payload);

      if (response.data.token) {
        // Store token in localStorage
        localStorage.setItem("token", response.data.token);

        // Optional: Store user data if available
        if (response.data.user) {
          localStorage.setItem("userData", JSON.stringify(response.data.user));
        }

        message.success("Login successful!");
        alert("Succesfully logged in");
        if (
          values.username === "admin@gmail.com" &&
          values.password === "123456"
        ) {
          navigate("/dashboard");
          return;
        }

        if (
          values.username === "College@gmail.com" &&
          values.password === "123456"
        ) {
          navigate("/college/dashboard");
          return;
        }

        navigate("/student/dashboard");
      } else {
        throw new Error("No token received");
      }
    } catch (error) {
      console.error("Login error:", error);
      message.error(
        "Login failed. Please check your credentials and try again."
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
        <Title level={3} className="login-title">
          LOGIN
        </Title>
        <hr className="title-underline" />

        <Form form={form} layout="vertical" onFinish={handleFinish}>
          {/* Username/Email Input */}
          <Form.Item
            name="username"
            rules={[
              { required: true, message: "Please enter your email!" },
              { type: "email", message: "Please enter a valid email!" },
            ]}
          >
            <Input
              prefix={<UserOutlined />}
              placeholder="Enter your email"
              size="large"
            />
          </Form.Item>

          {/* Password Input */}
          <Form.Item
            name="password"
            rules={[
              { required: true, message: "Please enter your password!" },
              { min: 6, message: "Password must be at least 6 characters!" },
            ]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="Enter your Password"
              size="large"
            />
          </Form.Item>

          {/* Sign In Button */}
          <Form.Item>
            <Button type="primary" htmlType="submit" block loading={loading}>
              Sign In
            </Button>
          </Form.Item>
        </Form>

        {/* Footer Links */}
        <Row justify="space-between" className="signin-footer">
          <Col>
            <Typography.Link className="forgot">
              Forgot Password ?
            </Typography.Link>
          </Col>
        </Row>
      </div>
    </div>
  );
};

export default Login;
