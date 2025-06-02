import React, { useEffect, useState } from "react";
import { 
  Table, 
  Spin, 
  Button, 
  Modal, 
  Select, 
  message,
  Card,
  Typography,
  Row,
  Col,
  Statistic,
  
} from "antd";
import { 

  FileTextOutlined,
  BookOutlined,
  ClockCircleOutlined,
} from "@ant-design/icons";
import LayoutWrapper from "../../components/adminlayout/layoutWrapper";
import axios from "axios";

const { Option } = Select;
const { Text, Title } = Typography;

interface Student {
  student_id: number;
  firstname: string;
  lastname: string;
  email: string;
  countrycode: string;
  mobileno: string;
  college_name: string;
}

interface Course {
  id: number;
  name: string;
}

interface Batch {
  batch_id: number;
  name: string;
  course_id: number;
}

const UnassignedStudents: React.FC = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [courses, setCourses] = useState<Course[]>([]);
  const [batches, setBatches] = useState<Batch[]>([]);
  const [filteredBatches, setFilteredBatches] = useState<Batch[]>([]);
  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [selectedCourse, setSelectedCourse] = useState<number | null>(null);
  const [selectedBatch, setSelectedBatch] = useState<number | null>(null);
  const [assignLoading, setAssignLoading] = useState<boolean>(false);

  const token = localStorage.getItem("token");

  useEffect(() => {
    setLoading(true);
    fetch("http://localhost:3001/api/student/getUnassignedStudentsList", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        token: token || "",
      },
    })
      .then((response) => response.json())
      .then((data) => {
        setStudents(data.data || []);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching students:", error);
        setLoading(false);
      });

    fetchCourses();
    fetchBatches();
  }, []);

  const fetchCourses = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      console.error("No token found, authentication required");
      return;
    }
    try {
      const response = await fetch(
        "http://localhost:3001/api/course/getCourses",
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            token: token,
          },
        }
      );
      if (!response.ok)
        throw new Error(`HTTP error! Status: ${response.status}`);
      const data: Course[] = await response.json();
      setCourses(data);
    } catch (error) {
      console.error("Error fetching courses:", error);
    }
  };

  const fetchBatches = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      console.error("No token found, authentication required");
      return;
    }
    try {
      const response = await fetch(
        "http://localhost:3001/api/course/viewAllBatches",
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            token: token,
          },
        }
      );
      if (!response.ok)
        throw new Error(`HTTP error! Status: ${response.status}`);
      const data = await response.json();
      setBatches(data.data || []);
    } catch (error) {
      console.error("Error fetching batches:", error);
    }
  };

  const handleCourseChange = (value: number) => {
    setSelectedCourse(value);
    setSelectedBatch(null);
    const filtered = batches.filter(batch => batch.course_id === value);
    setFilteredBatches(filtered);
  };

  const openModal = (student: Student) => {
    setSelectedStudent(student);
    setModalVisible(true);
    setSelectedCourse(null);
    setSelectedBatch(null);
    setFilteredBatches([]);
  };

  const handleAssignCourse = async () => {
    if (!selectedStudent || !selectedCourse || !selectedBatch) {
      message.error("Please select a course and batch.");
      return;
    }

    setAssignLoading(true);
    const payload = {
      studentId: selectedStudent.student_id,
      courseId: selectedCourse,
      batchId: selectedBatch
    };

    try {
      await axios.post(
        "http://localhost:3001/api/student/assignStudentToCourse",
        payload,
        { headers: { token: token || "" } }
      );
      message.success("Course assigned successfully!");
      setModalVisible(false);
      window.location.reload();
    } catch (error) {
      message.error("Error assigning course.");
      console.error("Error:", error);
    } finally {
      setAssignLoading(false);
    }
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
          College
        </span>
      ),
      dataIndex: "college_name",
      key: "collegeName",
      render: (college: string) => college || "-",
    },
    {
      title: (
        <span style={{ fontWeight: 600, color: '#1f2937' }}>
          Actions
        </span>
      ),
      key: "assignCourse",
      render: (_: unknown, record: Student) => (
        <Button 
          type="primary" 
          onClick={() => openModal(record)}
          style={{ 
            background: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)',
            border: 'none',
            height: '32px',
            padding: '0 12px',
            fontSize: '12px'
          }}
        >
          Assign Course
        </Button>
      ),
    },
  ];

  return (
    <LayoutWrapper pageTitle="BORIGAM / Unassigned Students">
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
            Unassigned Students
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
              <Col xs={24} sm={24} md={6}>
                <Statistic
                  title="Unassigned Students"
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

          {/* Assign Course Modal */}
          <Modal
            title={<span style={{ color: '#8b5eab', fontWeight: 600 }}>Assign Course to Student</span>}
            open={modalVisible}
            onCancel={() => setModalVisible(false)}
            onOk={handleAssignCourse}
            confirmLoading={assignLoading}
            footer={[
              <Button key="back" onClick={() => setModalVisible(false)} style={{ height: '40px', borderRadius: '8px' }}>
                Cancel
              </Button>,
              <Button
                key="submit"
                type="primary"
                loading={assignLoading}
                onClick={handleAssignCourse}
                style={{ 
                  background: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)',
                  border: 'none',
                  height: '40px',
                  borderRadius: '8px'
                }}
                disabled={!selectedCourse || !selectedBatch}
              >
                Assign
              </Button>,
            ]}
            centered
            destroyOnClose
            bodyStyle={{ padding: '24px' }}
          >
            {selectedStudent && (
              <div style={{ marginBottom: '16px' }}>
                <Text strong>Student:</Text>{' '}
                <Text>{`${selectedStudent.firstname} ${selectedStudent.lastname}`}</Text>
              </div>
            )}
            
            <Select
              placeholder="Select Course"
              style={{ width: "100%", marginBottom: 16, height: '40px' }}
              onChange={handleCourseChange}
              value={selectedCourse}
              showSearch
              optionFilterProp="children"
              filterOption={(input, option) =>
                (option?.children as unknown as string)?.toLowerCase().indexOf(input.toLowerCase()) >= 0
              }
            >
              {courses.map((course) => (
                <Option key={course.id} value={course.id}>
                  {course.name}
                </Option>
              ))}
            </Select>
            
            <Select
              placeholder={selectedCourse ? "Select Batch" : "Please select a course first"}
              style={{ width: "100%", marginBottom: 16, height: '40px' }}
              onChange={(value) => setSelectedBatch(value)}
              value={selectedBatch}
              disabled={!selectedCourse}
              showSearch
              optionFilterProp="children"
              filterOption={(input, option) =>
                (option?.children as unknown as string)?.toLowerCase().indexOf(input.toLowerCase()) >= 0
              }
            >
              {filteredBatches.map((batch) => (
                <Option key={batch.batch_id} value={batch.batch_id}>
                  {batch.name}
                </Option>
              ))}
            </Select>
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

export default UnassignedStudents;