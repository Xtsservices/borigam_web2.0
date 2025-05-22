import React from "react";
import {
  Form,
  Input,
  Button,
  Select,
  Row,
  Col,
  Typography,
  message,
} from "antd";
import {
  UserOutlined,
  MailOutlined,
  PhoneOutlined,
  SolutionOutlined,
} from "@ant-design/icons";
import "./styles/signup.css";
import borigam_profile from "../assets/borigam-new.png";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const { Option } = Select;
const { Title, Text } = Typography;

const SignUpForm: React.FC = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = React.useState(false);

  const navigate = useNavigate();

  const onFinish = async (values: any) => {
    try {
      setLoading(true);
      const payload = {
        firstname: values.firstname,
        lastname: values.lastname,
        email: values.email,
        countrycode: values.countrycode,
        mobileno: values.mobileno,
        roles: Array.isArray(values.roles) ? values.roles : [values.roles],
      };

      const response = await axios.post(
        "http://localhost:3001/api/users/createUser",
        payload
      );
      
      alert(response.data.message);

      navigate("/login")


      if (response.data.success) {
        alert("Created User Success");
        const userConfirmed = window.confirm(
          "User created successfully!\n\nClick OK to go to login page."
        );
        if (userConfirmed) {
          form.resetFields();
        }

      } else {
        message.error(response.data.message || "Failed to create user");
      }
    } catch (error: any) {
      message.error(error.response?.data?.message || "An error occurred");
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

      {/* Right Panel - Form */}
      <div className="rightpanel">
        <Title level={3} className="signup-title">
          Create New Account
        </Title>
        <hr className="title-underline" />

        <Form form={form} layout="vertical" onFinish={onFinish}>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="firstname"
                rules={[
                  { required: true, message: "Please enter first name!" },
                ]}
              >
                <Input
                  prefix={<UserOutlined />}
                  placeholder="First name"
                  size="large"
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="lastname"
                rules={[{ required: true, message: "Please enter last name!" }]}
              >
                <Input
                  prefix={<UserOutlined />}
                  placeholder="Last name"
                  size="large"
                />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="email"
            rules={[
              { required: true, message: "Please enter email!" },
              { type: "email", message: "Please enter a valid email!" },
            ]}
          >
            <Input prefix={<MailOutlined />} placeholder="Email" size="large" />
          </Form.Item>

          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                name="countrycode"
                initialValue="+91"
                rules={[
                  { required: true, message: "Please select country code!" },
                ]}
              >
                <Select size="large">
                  <Option value="+91">+91 (India)</Option>
                  <Option value="+1">+1 (USA)</Option>
                  <Option value="+44">+44 (UK)</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={16}>
              <Form.Item
                name="mobileno"
                rules={[
                  { required: true, message: "Please enter mobile number!" },
                  {
                    pattern: /^[0-9]{10}$/,
                    message: "Please enter valid 10-digit mobile number!",
                  },
                ]}
              >
                <Input
                  prefix={<PhoneOutlined />}
                  placeholder="Mobile number"
                  size="large"
                />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="roles"
            label="Role"
            rules={[
              { required: true, message: "Please select at least one role!" },
            ]}
          >
            <Select
              mode="multiple" // Allows selecting multiple roles
              placeholder="Select role(s)"
              size="large"
              suffixIcon={<SolutionOutlined />}
            >
              <Option value="superadmin">Super Admin</Option>
              <Option value="admin">Admin</Option>
              <Option value="student">Student</Option>
            </Select>
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              block
              size="large"
              loading={loading}
            >
              Sign Up
            </Button>
          </Form.Item>
        </Form>

        <Text strong className="login-text" onClick={() => navigate("/")}>
          Already have an account?
        </Text>
      </div>
    </div>
  );
};

export default SignUpForm;
