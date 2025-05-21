import { Button, Col, Form, Input, Row, Select } from "antd";
import borigam_profile from "../assets/borigam-new.png";
import { useNavigate } from "react-router-dom";

const { Option } = Select;

const EnquiryNow = () => {

  const navigate = useNavigate();
  const [form] = Form.useForm();

  const onFinish = (values: any) => {
    console.log("Form Data:", values);
    // You can send data to backend here
  };

  return (
    <Row style={{ minHeight: "100vh" }}>
      {/* Left Side */}
      <Col span={12} className="leftpanel">
        <img
          src={borigam_profile}
          alt="Profile"
          className="logo-img"
          style={{ height: "100%", width: "100%", objectFit: "cover" }}
        />
      </Col>

      {/* Right Side */}
      <Col span={12} style={{ backgroundColor: "#fff", padding: "40px" }}>
        <h2 style={{ marginBottom: "24px" }}>Enquiry Form</h2>
        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
          style={{ maxWidth: "500px" }}
        >
          <Form.Item
            label="First Name"
            name="firstName"
            rules={[
              { required: true, message: "Please enter your first name" },
            ]}
          >
            <Input placeholder="Enter your first name" />
          </Form.Item>

          <Form.Item
            label="Last Name"
            name="lastName"
            rules={[{ required: true, message: "Please enter your last name" }]}
          >
            <Input placeholder="Enter your last name" />
          </Form.Item>

          <Form.Item
            label="City"
            name="city"
            rules={[{ required: true, message: "Please enter your city" }]}
          >
            <Input placeholder="Enter your city" />
          </Form.Item>

          <Form.Item
            label="Courses Interested In"
            name="courses"
            rules={[
              { required: true, message: "Please select at least one course" },
            ]}
          >
            <Select mode="multiple" placeholder="Select courses">
              <Option value="NIFT">NIFT</Option>
              <Option value="NID">NID</Option>
              <Option value="NATA">NATA</Option>
              <Option value="B.ARCH">B.ARCH</Option>
              <Option value="CEED">CEED</Option>
              <Option value="UCEED">UCEED</Option>
            </Select>
          </Form.Item>

          <Form.Item label="Comments" name="comments">
            <Input.TextArea rows={4} placeholder="Any additional comments" />
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              style={{
                backgroundColor: "#ffc107",
                borderColor: "#ffc107",
                color: "#000",
              }}
              onClick={()=> navigate("/")}
            >
              Submit
            </Button>
          </Form.Item>
        </Form>
      </Col>
    </Row>
  );
};

export default EnquiryNow;
