import { useEffect, useState } from "react";
import {
  Card,
  Button,
  Typography,
  Image,
  Modal,
  Input,
  Form,
  message,
  Drawer,
  DatePicker,
  List,
  Space,
  Tag,
} from "antd";
import LayoutWrapper from "../../../components/adminlayout/layoutWrapper";
import { useNavigate } from "react-router-dom";
import add_dashboard from "../../../assets/add_dashboard.png";
import dayjs from "dayjs";

const { Title, Text } = Typography;
const { TextArea } = Input;

// Define TypeScript Interface for Course
interface Course {
  id: number;
  name: string;
  status: string;
}

interface User {
  userId: number;
  firstname: string;
  lastname: string;
  email: string;
  countrycode: string;
  mobileno: string;
  status: number;
  role: string;
}

interface College {
  collegeId: number;
  collegeName: string;
  collegeAddress: string;
  collegeStatus: number;
  users: User[];
}

interface Students {
  mobileno: string;
  email: string;
  studentId: number;
  firstname: string;
  lastname: string;
  role: string;
  countrycode: string;
  status: number;
}

interface UnassignedStudents {
  count: number;
}

interface Announcement {
  id: number;
  start_date: string;
  end_date: string;
  text: string;
  created_date: string | null;
  updated_date: string | null;
  status: string;
  created_by_id: number;
  updated_by_id: number;
}

const Dashboard = () => {
  const navigate = useNavigate();
  const [, setCourses] = useState<Course[]>([]);
  const [colleges, setColleges] = useState<College[]>([]);
  const [students, setStudents] = useState<Students[]>([]);
  const [unassignedStudents, setunassignedStudents] =
    useState<UnassignedStudents>({ count: 0 });
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  
  const [modalVisible, setModalVisible] = useState(false);
  const [modalVisible1, setModalVisible1] = useState(false);
  const [createAnnouncementDrawer, setCreateAnnouncementDrawer] = useState(false);
  const [viewAnnouncementDrawer, setViewAnnouncementDrawer] = useState(false);
  
  const [form] = Form.useForm();
  const [form1] = Form.useForm();
  const [announcementForm] = Form.useForm();

  useEffect(() => {
    const fetchCourses = async () => {
      const token = localStorage.getItem("token");

      if (!token) {
        console.error("No token found, authentication required");
        return;
      }

      try {
        const response = await fetch(
          "http://13.233.33.133:3001/api/course/getCourses",
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              token: token,
            },
          }
        );

        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data: Course[] = await response.json();
        setCourses(data);
      } catch (error) {
        console.error("Error fetching courses:", error);
      }
    };

    fetchColleges();
    fetchCourses();
    fetchStudents();
    fetchUnassignedStudentsCount();
    fetchAnnouncements();
  }, []);

  const fetchColleges = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      console.error("No token found, authentication required");
      return;
    }

    try {
      const response = await fetch(
        "http://13.233.33.133:3001/api/college/viewAllCollegesAndUsers",
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            token: token,
          },
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const result = await response.json();
      setColleges(result.data);
    } catch (error) {
      console.error("Error fetching colleges:", error);
    }
  };

  const fetchUnassignedStudentsCount = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      console.error("No token found, authentication required");
      return;
    }

    try {
      const response = await fetch(
        "http://13.233.33.133:3001/api/student/getUnassignedStudentsCount",
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            token: token,
          },
        }
      );
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      const result = await response.json();
      if (result.data) {
        setunassignedStudents({ count: result.data.count });
      } else {
        console.error("Unexpected response format:", result);
      }
    } catch (error) {
      console.error("Error fetching unassigned students count:", error);
    }
  };

  const fetchStudents = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      console.error("No token found, authentication required");
      return;
    }
    try {
      const response = await fetch(
        "http://13.233.33.133:3001/api/student/getAllStudents",
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            token: token,
          },
        }
      );
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      const result = await response.json();
      console.log("Fetched Students:", result);
      setStudents(result.data || []);
    } catch (error) {
      console.error("Error fetching students:", error);
    }
  };

  const fetchAnnouncements = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      console.error("No token found, authentication required");
      return;
    }

    try {
      const response = await fetch(
        "http://13.233.33.133:3001/api/announcements/getAnnouncements",
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            token: token,
          },
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const result = await response.json();
      if (result.type && result.data) {
        setAnnouncements(result.data);
      }
    } catch (error) {
      console.error("Error fetching announcements:", error);
    }
  };

  const handleCollegeSubmit = async (values: any) => {
    try {
      const response = await fetch(
        "http://13.233.33.133:3001/api/college/registerCollege",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            token: localStorage.getItem("token") || "",
          },
          body: JSON.stringify(values),
        }
      );
      if (!response.ok) {
        throw new Error("Failed to register college");
      }
      alert("College registered successfully!");
      setModalVisible(false);
      form.resetFields();
      window.location.reload();
    } catch (error) {
      console.error("Error registering college:", error);
      message.error("Failed to register college");
    }
  };

  const handleStudentSubmit = async (values: any) => {
    try {
      const response = await fetch(
        "http://13.233.33.133:3001/api/student/createStudent",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            token: localStorage.getItem("token") || "",
          },
          body: JSON.stringify(values),
        }
      );
      if (!response.ok) {
        throw new Error("Failed to create student");
      }
      alert("Student created successfully!");
      setModalVisible1(false);
      form1.resetFields();
      window.location.reload();
    } catch (error) {
      console.error("Error creating student:", error);
      message.error("Failed to create student");
    }
  };

  const handleAnnouncementSubmit = async (values: any) => {
    try {
      const payload = {
        start_date: values.start_date.format("DD-MM-YYYY"),
        end_date: values.end_date.format("DD-MM-YYYY"),
        text: values.text,
      };

      const response = await fetch(
        "http://13.233.33.133:3001/api/announcements/createAnnouncement",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            token: localStorage.getItem("token") || "",
          },
          body: JSON.stringify(payload),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to create announcement");
      }

      message.success("Announcement created successfully!");
      setCreateAnnouncementDrawer(false);
      announcementForm.resetFields();
      fetchAnnouncements(); // Refresh announcements list
    } catch (error) {
      console.error("Error creating announcement:", error);
      message.error("Failed to create announcement");
    }
  };

  const formatTimestamp = (timestamp: string) => {
    if (!timestamp) return "N/A";
    // Convert Unix timestamp to readable date
    const date = new Date(parseInt(timestamp) * 1000);
    return date.toLocaleDateString();
  };

  const handleCollegeClick = () => {
    setModalVisible(true);
  };

  const handleStudentClick = () => {
    setModalVisible1(true);
  };

  const navigateToColleges = () => {
    navigate("/dashboard/CollageList");
  };

  const navigateToStudents = () => {
    navigate("/dashboard/AllStudents");
  };

  return (
    <LayoutWrapper pageTitle="BORIGAM">
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          flexWrap: "nowrap",
          gap: "10px",
          marginBottom: "20px",
        }}
      >
        {/* Students Card */}
        <Card
          style={{
            minWidth: "22%",
            borderRadius: "10px",
            borderColor: "#8B5EAB",
            boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
            flexShrink: 0,
          }}
        >
          <Button
            type="primary"
            style={{
              background: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)',
              borderColor: "#8B5EAB",
              width: "100%",
              fontWeight: "bold",
              marginBottom: "20px",
              whiteSpace: "nowrap",
            }}
            onClick={handleStudentClick}
          >
            Students +
          </Button>
          <div
            style={{
              display: "flex",
              gap: "8px",
              flexWrap: "wrap",
              justifyContent: "center",
              marginBottom: "16px",
            }}
          >
            <Button
              style={{ width: "120px", height: "45px", fontSize: "14px" }}
              onClick={navigateToStudents}
            >
              All: {students.length}
            </Button>
            <Button
              style={{ width: "120px", height: "45px", fontSize: "14px" }}
              onClick={() => navigate("/dashboard/unassigned")}
            >
              Unassigned: {unassignedStudents.count}
            </Button>
          </div>
        </Card>

        {/* Tests Card */}
        <Card
          style={{
            minWidth: "22%",
            borderRadius: "10px",
            borderColor: "#8B5EAB",
            boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
            flexShrink: 0,
          }}
        >
          <Button
            type="primary"
            style={{
              background: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)',
              borderColor: "#8B5EAB",
              width: "100%",
              fontWeight: "bold",
              marginBottom: "20px",
              whiteSpace: "nowrap",
            }}
          >
            Tests
          </Button>
          <div
            style={{
              display: "flex",
              gap: "8px",
              flexWrap: "wrap",
              justifyContent: "center",
              marginBottom: "16px",
            }}
          >
            <Button
              style={{ width: "120px", height: "45px", fontSize: "14px" }}
              onClick={() => navigate("/dashboard/OngoingTest")}
            >
              Ongoing
            </Button>
            <Button
              style={{ width: "120px", height: "45px", fontSize: "14px" }}
              onClick={() => navigate("/dashboard/CompletedTest")}
            >
              Completed
            </Button>
          </div>
        </Card>

        {/* Colleges Card */}
        <Card
          style={{
            minWidth: "22%",
            borderRadius: "10px",
            borderColor: "#8B5EAB",
            boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
            flexShrink: 0,
          }}
        >
          <Button
            type="primary"
            style={{
              background: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)',
              borderColor: "#8B5EAB",
              width: "100%",
              fontWeight: "bold",
              marginBottom: "20px",
              whiteSpace: "nowrap",
            }}
            onClick={handleCollegeClick}
          >
            Colleges +
          </Button>
          <div
            style={{
              display: "flex",
              gap: "8px",
              flexWrap: "wrap",
              justifyContent: "center",
              marginBottom: "16px",
            }}
          >
            <Button
              onClick={navigateToColleges}
              style={{ width: "120px", height: "45px", fontSize: "14px" }}
            >
              Colleges: {colleges.length}
            </Button>
            <Button
              style={{ width: "120px", height: "45px", fontSize: "14px" }}
              onClick={() => navigate("/dashboard/CollageStudents")}
            >
              Students
            </Button>
          </div>
        </Card>

        {/* Announcements Card */}
        <Card
          style={{
            minWidth: "22%",
            borderRadius: "10px",
            borderColor: "#8B5EAB",
            boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
            flexShrink: 0,
          }}
        >
          <Button
            type="primary"
            style={{
              background: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)',
              borderColor: "#8B5EAB",
              width: "100%",
              fontWeight: "bold",
              marginBottom: "20px",
              whiteSpace: "nowrap",
            }}
            onClick={() => setCreateAnnouncementDrawer(true)}
          >
            Announcements +
          </Button>
          <div
            style={{
              display: "flex",
              gap: "8px",
              flexWrap: "wrap",
              justifyContent: "center",
              marginBottom: "16px",
            }}
          >
            <Button
              style={{ width: "120px", height: "45px", fontSize: "14px" }}
              onClick={() => setViewAnnouncementDrawer(true)}
            >
              View All: {announcements.length}
            </Button>
            <Button
              style={{ width: "120px", height: "45px", fontSize: "14px" }}
              onClick={() => setCreateAnnouncementDrawer(true)}
            >
              Create New
            </Button>
          </div>
        </Card>
      </div>

      <Card
        style={{
          width: "100%",
          textAlign: "center",
          borderRadius: "10px",
          borderColor: "#8B5EAB",
          boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
          padding: "10px",
        }}
      >
        <Image
          src={add_dashboard}
          alt="Dashboard Illustration"
          preview={false}
          style={{ height: "300px", width: "400px" }}
        />
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            gap: "20px",
            marginTop: "20px",
          }}
        >
          <Button
            type="primary"
            style={{
              background: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)',
              borderColor: "#FFD439",
              fontWeight: "bold",
              width: "200px",
            }}
            onClick={() => navigate("addtest")}
          >
            Add Test +
          </Button>

          <Button
            type="primary"
            style={{
              background: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)',
              borderColor: "#8B5EAB",
              fontWeight: "bold",
              width: "200px",
            }}
            onClick={() => navigate("addquestions")}
          >
            Add Questions +
          </Button>
        </div>
      </Card>

      {/* College Registration Modal */}
      <Modal
        title="Register College"
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={null}
      >
        <Form form={form} layout="vertical" onFinish={handleCollegeSubmit}>
          <Form.Item
            name="name"
            label="College Name"
            rules={[{ required: true, message: "Please enter college name" }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="address"
            label="Address"
            rules={[{ required: true, message: "Please enter address" }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="code"
            label="College Code"
            rules={[{ required: true, message: "Please enter college code" }]}
          >
            <Input />
          </Form.Item>
          <Title level={5}>Contact Information</Title>
          <Form.Item
            name={["contact", "firstname"]}
            label="First Name"
            rules={[{ required: true, message: "Enter first name" }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name={["contact", "lastname"]}
            label="Last Name"
            rules={[{ required: true, message: "Enter last name" }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name={["contact", "email"]}
            label="Email"
            rules={[
              { required: true, type: "email", message: "Enter a valid email" },
            ]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name={["contact", "countrycode"]}
            label="Country Code"
            initialValue="+91"
          >
            <Input />
          </Form.Item>
          <Form.Item
            name={["contact", "mobileno"]}
            label="Mobile Number"
            rules={[{ required: true, message: "Enter mobile number" }]}
          >
            <Input />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit">
              Register
            </Button>
          </Form.Item>
        </Form>
      </Modal>

      {/* Student Registration Modal */}
      <Modal
        title="Register Student"
        open={modalVisible1}
        onCancel={() => setModalVisible1(false)}
        footer={null}
      >
        <Form form={form1} layout="vertical" onFinish={handleStudentSubmit}>
          <Form.Item
            name={["firstname"]}
            label="First Name"
            rules={[{ required: true, message: "Enter first name" }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name={["lastname"]}
            label="Last Name"
            rules={[{ required: true, message: "Enter last name" }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name={["email"]}
            label="Email"
            rules={[
              { required: true, type: "email", message: "Enter a valid email" },
            ]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name={["countrycode"]}
            label="Country Code"
            initialValue="+91"
          >
            <Input />
          </Form.Item>
          <Form.Item
            name={["mobileno"]}
            label="Mobile Number"
            rules={[{ required: true, message: "Enter mobile number" }]}
          >
            <Input />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit">
              Register
            </Button>
          </Form.Item>
        </Form>
      </Modal>

      {/* Create Announcement Drawer */}
      <Drawer
        title="Create Announcement"
        placement="right"
        onClose={() => setCreateAnnouncementDrawer(false)}
        open={createAnnouncementDrawer}
        width={400}
      >
        <Form
          form={announcementForm}
          layout="vertical"
          onFinish={handleAnnouncementSubmit}
        >
          <Form.Item
            name="start_date"
            label="Start Date"
            rules={[{ required: true, message: "Please select start date" }]}
          >
            <DatePicker
              style={{ width: "100%" }}
              format="DD-MM-YYYY"
            />
          </Form.Item>
          <Form.Item
            name="end_date"
            label="End Date"
            rules={[{ required: true, message: "Please select end date" }]}
          >
            <DatePicker
              style={{ width: "100%" }}
              format="DD-MM-YYYY"
            />
          </Form.Item>
          <Form.Item
            name="text"
            label="Announcement Text"
            rules={[{ required: true, message: "Please enter announcement text" }]}
          >
            <TextArea
              rows={4}
              placeholder="Enter your announcement here..."
            />
          </Form.Item>
          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">
                Create Announcement
              </Button>
              <Button onClick={() => setCreateAnnouncementDrawer(false)}>
                Cancel
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Drawer>

      {/* View Announcements Drawer */}
      <Drawer
        title="All Announcements"
        placement="right"
        onClose={() => setViewAnnouncementDrawer(false)}
        open={viewAnnouncementDrawer}
        width={500}
      >
        <List
          dataSource={announcements}
          renderItem={(item) => (
            <List.Item>
              <Card
                size="small"
                style={{ width: "100%", marginBottom: "10px" }}
              >
                <Space direction="vertical" style={{ width: "100%" }}>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <Text strong>ID: {item.id}</Text>
                    <Tag color={item.status === "active" ? "green" : "red"}>
                      {item.status.toUpperCase()}
                    </Tag>
                  </div>
                  <Text>{item.text}</Text>
                  <div>
                    <Text type="secondary" style={{ fontSize: "12px" }}>
                      Start: {formatTimestamp(item.start_date)} | 
                      End: {formatTimestamp(item.end_date)}
                    </Text>
                  </div>
                  {item.created_date && (
                    <Text type="secondary" style={{ fontSize: "12px" }}>
                      Created: {formatTimestamp(item.created_date)}
                    </Text>
                  )}
                </Space>
              </Card>
            </List.Item>
          )}
          locale={{ emptyText: "No announcements found" }}
        />
      </Drawer>
    </LayoutWrapper>
  );
};

export default Dashboard;