import React, { useEffect, useState } from "react";
import { 
  Button, 
  Form, 
  Input, 
  Modal, 
  Popconfirm, 
  Space, 
  Spin, 
  Table, 
  Tag, 
  message,
  Card,
  Typography,
  Row,
  Col,
  Statistic
} from "antd";
import { 
  EditOutlined, 
  DeleteOutlined, 
  SearchOutlined,
  FileTextOutlined,
  BookOutlined,
  ClockCircleOutlined,
  TrophyOutlined
} from "@ant-design/icons";
import LayoutWrapper from "../../components/adminlayout/layoutWrapper";

const { Text, Title } = Typography;

interface Course {
  course_id: number;
  course_name: string;
}

interface Batch {
  batch_id: number;
  batch_name: string;
  start_date: number;
  end_date: number;
}

interface Student {
  student_id: number;
  firstname: string;
  lastname: string;
  email: string;
  countrycode: string;
  mobileno: string;
  college_name: string | null;
  courses: Course[];
  batches: Batch[];
}

const AllStudents: React.FC = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [form] = Form.useForm();

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = () => {
    setLoading(true);
    fetch("http://13.233.33.133:3001/api/student/getAllStudents", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        token: localStorage.getItem("token") || "",
      },
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return response.json();
      })
      .then((data) => {
        setStudents(data.data || []);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching students:", error);
        setLoading(false);
      });
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleDateString();
  };

  const showEditModal = (student: Student) => {
    setEditingStudent(student);
    form.setFieldsValue({
      firstname: student.firstname,
      lastname: student.lastname,
      email: student.email,
      countrycode: student.countrycode,
      mobileno: student.mobileno,
      batchName: student.batches[0]?.batch_name,
      courseName: student.courses[0]?.course_name,
    });
    setIsModalVisible(true);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    form.resetFields();
  };

  const handleUpdate = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);

      const response = await fetch(
        "http://13.233.33.133:3001/api/student/updateStudent",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            token: localStorage.getItem("token") || "",
          },
          body: JSON.stringify({
            studentId: editingStudent?.student_id,
            ...values,
          }),
        }
      );
      setIsModalVisible(false);
      window.location.reload();

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const result = await response.json();
      if (result.success) {
        message.success("Student updated successfully");
        fetchStudents();
      } else {
        throw new Error(result.message || "Failed to update student");
      }
    } catch (error) {
      console.error("Error updating student:", error);
      message.error(
        error instanceof Error ? error.message : "Failed to update student"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (studentId: number) => {
    try {
      setLoading(true);
      const response = await fetch(
        "http://13.233.33.133:3001/api/student/deleteStudent",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            token: localStorage.getItem("token") || "",
          },
          body: JSON.stringify({ studentId }),
        }
      );

      alert("Deleting student with ID: " + studentId);
      window.location.reload();

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const result = await response.json();
      if (result.ok) {
        message.success("Student deleted successfully");
        fetchStudents();
        window.location.reload();
      } else {
        throw new Error(result.message || "Failed to delete student");
      }
    } catch (error) {
      console.error("Error deleting student:", error);
      message.error(
        error instanceof Error ? error.message : "Failed to delete student"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (value: string) => {
    if (!value) {
      fetchStudents();
      return;
    }
    const searchText = value.trim().toLowerCase();
    const filtered = students.filter((student) => {
      const studentFields = `${student.firstname} ${student.lastname} ${
        student.email
      } ${student.countrycode} ${student.mobileno} ${
        student.student_id
      } ${student.college_name ?? ""}`.toLowerCase();
      const courseFields = student.courses
        .map((c) => `${c.course_id} ${c.course_name}`.toLowerCase())
        .join(" ");
      const batchFields = student.batches
        .map((b) =>
          `${b.batch_id} ${b.batch_name} ${b.start_date} ${b.end_date}`.toLowerCase()
        )
        .join(" ");
      return (
        studentFields.includes(searchText) ||
        courseFields.includes(searchText) ||
        batchFields.includes(searchText)
      );
    });
    setStudents(filtered);
  };

  const columns = [
    {
      title: (
        <span style={{ fontWeight: 600, color: '#1f2937' }}>
          <FileTextOutlined style={{ marginRight: 8, color: '#6366f1' }} />
          Student Name
        </span>
      ),
      key: "studentName",
      render: (_: unknown, record: Student) => (
        <Text strong style={{ fontSize: '14px' }}>{`${record.firstname} ${record.lastname}`}</Text>
      ),
    },
    {
      title: (
        <span style={{ fontWeight: 600, color: '#1f2937' }}>
          <BookOutlined style={{ marginRight: 8, color: '#6366f1' }} />
          Email
        </span>
      ),
      dataIndex: "email",
      key: "email",
      render: (email: string) => <Text type="secondary" style={{ fontSize: '14px' }}>{email}</Text>,
    },
    {
      title: (
        <span style={{ fontWeight: 600, color: '#1f2937' }}>
          <ClockCircleOutlined style={{ marginRight: 8, color: '#6366f1' }} />
          Phone Number
        </span>
      ),
      key: "phoneNumber",
      render: (_: unknown, record: Student) => (
        <Text style={{ fontSize: '14px' }}>{`${record.countrycode} ${record.mobileno}`}</Text>
      ),
    },
    {
      title: (
        <span style={{ fontWeight: 600, color: '#1f2937' }}>
          <TrophyOutlined style={{ marginRight: 8, color: '#6366f1' }} />
          Courses
        </span>
      ),
      key: "courses",
      render: (_: unknown, record: Student) => (
        <div>
          {record.courses.map((course) => (
            <Tag 
              color="blue" 
              key={course.course_id}
              style={{ marginBottom: 4, fontSize: '12px', padding: '4px 12px' }}
            >
              {course.course_name}
            </Tag>
          ))}
        </div>
      ),
    },
    {
      title: (
        <span style={{ fontWeight: 600, color: '#1f2937' }}>
          Batches
        </span>
      ),
      key: "batches",
      render: (_: unknown, record: Student) => (
        <div>
          {record.batches.map((batch) => (
            <div key={batch.batch_id} style={{ marginBottom: 4 }}>
              <Tag 
                color="green" 
                style={{ fontSize: '12px', padding: '4px 12px' }}
              >
                {batch.batch_name}
              </Tag>
              <div style={{ fontSize: 12, color: '#6b7280' }}>
                {formatDate(batch.start_date)} to {formatDate(batch.end_date)}
              </div>
            </div>
          ))}
        </div>
      ),
    },
    {
      title: (
        <span style={{ fontWeight: 600, color: '#1f2937' }}>
          Actions
        </span>
      ),
      key: "action",
      render: (_: unknown, record: Student) => (
        <Space size="middle">
          <Button
            type="text"
            icon={<EditOutlined style={{ color: '#8b5eab' }} />}
            onClick={() => showEditModal(record)}
            title="Edit"
          />
          <Popconfirm
            title="Are you sure to delete this student?"
            onConfirm={() => handleDelete(record.student_id)}
            okText="Yes"
            cancelText="No"
            placement="topRight"
          >
            <Button 
              type="text" 
              icon={<DeleteOutlined style={{ color: '#ff4d4f' }} />} 
              title="Delete" 
            />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <LayoutWrapper pageTitle="BORIGAM / All Students">
      <div style={{ 
        padding: "32px", 
        background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
        minHeight: '100vh'
      }}>
        <div style={{ 
          background: 'white', 
          borderRadius: '16px', 
          padding: '32px',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
        }}>
          <Title 
            level={2} 
            style={{ 
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              fontSize: '32px',
              fontWeight: 700,
              marginBottom: '8px'
            }}
          >
            Students Management
          </Title>
          
          <Card
            style={{ 
              marginBottom: 32, 
              borderRadius: '16px',
              border: '1px solid #e5e7eb',
              boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)'
            }}
            bodyStyle={{ padding: '24px' }}
          >
            <Row gutter={[16, 16]} align="middle">
              <Col xs={24} sm={18} md={12}>
                <Input.Search
                  placeholder="Search students..."
                  allowClear
                  size="large"
                  onSearch={handleSearch}
                  onChange={(e) => handleSearch(e.target.value)}
                  enterButton={
                    <Button 
                      icon={<SearchOutlined />} 
                      style={{ 
                        background: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)',
                        border: 'none',
                        height: '40px'
                      }}
                    >
                      Search
                    </Button>
                  }
                />
              </Col>
              <Col xs={24} sm={6} md={4}>
                <Statistic
                  title="Total Students"
                  value={students.length}
                  valueStyle={{ 
                    color: '#6366f1', 
                    fontSize: '24px', 
                    fontWeight: 700 
                  }}
                />
              </Col>
            </Row>
          </Card>

          <Spin spinning={loading} tip="Loading students...">
            <Table
              columns={columns}
              dataSource={students}
              rowKey="student_id"
              pagination={{ 
                pageSize: 5,
                showSizeChanger: true,
                pageSizeOptions: ['10', '20', '50', '100'],
                style: { padding: '16px 24px' }
              }}
              bordered={false}
              style={{ 
                background: 'white',
                borderRadius: '16px',
                border: '1px solid #e5e7eb',
                overflow: 'hidden'
              }}
              onRow={() => ({
                style: { 
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                },
                onMouseEnter: (e) => {
                  e.currentTarget.style.backgroundColor = '#f8fafc';
                },
                onMouseLeave: (e) => {
                  e.currentTarget.style.backgroundColor = 'white';
                }
              })}
            />
          </Spin>

          {/* Edit Student Modal */}
          <Modal
            title={<span style={{ color: '#8b5eab', fontWeight: 600 }}>Edit Student Details</span>}
            open={isModalVisible}
            onOk={handleUpdate}
            onCancel={handleCancel}
            confirmLoading={loading}
            footer={[
              <Button key="back" onClick={handleCancel} style={{ height: '40px', borderRadius: '8px' }}>
                Cancel
              </Button>,
              <Button
                key="submit"
                type="primary"
                loading={loading}
                onClick={handleUpdate}
                style={{ 
                  background: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)',
                  border: 'none',
                  height: '40px',
                  borderRadius: '8px'
                }}
              >
                Update
              </Button>,
            ]}
            centered
            width={700}
            destroyOnClose
            bodyStyle={{ padding: '24px' }}
          >
            <Form form={form} layout="vertical" preserve={false}>
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    name="firstname"
                    label={<Text strong>First Name</Text>}
                    rules={[{ required: true, message: "Please input first name!" }]}
                  >
                    <Input placeholder="Enter first name" size="large" />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    name="lastname"
                    label={<Text strong>Last Name</Text>}
                    rules={[{ required: true, message: "Please input last name!" }]}
                  >
                    <Input placeholder="Enter last name" size="large" />
                  </Form.Item>
                </Col>
              </Row>
              
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    name="batchName"
                    label={<Text strong>Batch Name</Text>}
                    rules={[{ required: true, message: "Please input batch name!" }]}
                  >
                    <Input placeholder="Enter batch name" size="large" />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    name="courseName"
                    label={<Text strong>Course Name</Text>}
                    rules={[{ required: true, message: "Please input course name!" }]}
                  >
                    <Input placeholder="Enter course name" size="large" />
                  </Form.Item>
                </Col>
              </Row>
              
              <Form.Item
                name="email"
                label={<Text strong>Email</Text>}
                rules={[
                  { required: true, message: "Please input email!" },
                  { type: "email", message: "Please enter a valid email!" },
                ]}
              >
                <Input placeholder="Enter email address" size="large" />
              </Form.Item>
              
              <Row gutter={16}>
                <Col span={8}>
                  <Form.Item
                    name="countrycode"
                    label={<Text strong>Country Code</Text>}
                    rules={[{ required: true, message: "Please input country code!" }]}
                  >
                    <Input placeholder="+91" size="large" />
                  </Form.Item>
                </Col>
                <Col span={16}>
                  <Form.Item
                    name="mobileno"
                    label={<Text strong>Mobile Number</Text>}
                    rules={[{ required: true, message: "Please input mobile number!" }]}
                  >
                    <Input placeholder="Enter mobile number" size="large" />
                  </Form.Item>
                </Col>
              </Row>
            </Form>
          </Modal>
        </div>
        
        <style>{`
          .ant-table-thead > tr > th {
            background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%) !important;
            border-bottom: 2px solid #e5e7eb !important;
            font-weight: 600 !important;
            color: #1f2937 !important;
            padding: 16px !important;
          }
          .ant-table-tbody > tr > td {
            padding: 16px !important;
            border-bottom: 1px solid #f3f4f6 !important;
          }
          .ant-table-tbody > tr:hover > td {
            background-color: #f8fafc !important;
          }
        `}</style>
      </div>
    </LayoutWrapper>
  );
};

export default AllStudents;