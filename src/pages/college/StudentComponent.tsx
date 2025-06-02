import { useEffect, useState } from "react";
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
  Select,
  message,
  Card,
  Typography,
  Row,
  Col,
  Alert,
  Divider,
  Badge,
  Statistic
} from "antd";
import { 
  EditOutlined, 
  DeleteOutlined, 
  PlusOutlined, 
  SearchOutlined,
  FilterOutlined,
  ClearOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  ClockCircleOutlined,
  BookOutlined,
  FileTextOutlined,
  TrophyOutlined
} from "@ant-design/icons";
import moment from "moment";
import axios from "axios";
import { useParams } from "react-router-dom";
import CollegeLayoutWrapper from "../../components/collegeLayout/collegeLayoutWrapper";


const { Title, Text } = Typography;
const { Option } = Select;

interface Student {
  student_id: number;
  firstname: string;
  lastname: string;
  email: string;
  countrycode: string;
  mobileno: string;
  status: number;
  college_name?: string;
  courses?: { course_id: number; course_name: string }[];
  batches?: {
    batch_id: number;
    batch_name: string;
    start_date: number;
    end_date: number;
  }[];
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

const StudentComponent = () => {
  const { collegeId } = useParams();
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isCreateModalVisible, setIsCreateModalVisible] = useState(false);
  const [isAssignModalVisible, setIsAssignModalVisible] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [courses, setCourses] = useState<Course[]>([]);
  const [batches, setBatches] = useState<Batch[]>([]);
  const [filteredBatches, setFilteredBatches] = useState<Batch[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<number | null>(null);
  const [selectedBatch, setSelectedBatch] = useState<number | null>(null);
  const [form] = Form.useForm();
  const [createForm] = Form.useForm();
  const [assignForm] = Form.useForm();
  const [createLoading, setCreateLoading] = useState(false);
  const [updateLoading, setUpdateLoading] = useState(false);
  const [assignLoading, setAssignLoading] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [filteredStudents, setFilteredStudents] = useState<Student[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [filterLoading, setFilterLoading] = useState<boolean>(false);
  const [filters, setFilters] = useState({
    search: "",
    courseId: null as number | null,
  });

  useEffect(() => {
    const fetchAllData = async () => {
      setLoading(true);
      try {
        await Promise.all([
          fetchStudents(),
          fetchCourses(),
          fetchBatches()
        ]);
      } catch (error) {
        console.error("Error fetching data:", error);
        message.error("Failed to load data");
      } finally {
        setLoading(false);
      }
    };

    fetchAllData();
  }, [collegeId]);

  useEffect(() => {
    applyFilters();
  }, [students, filters]);

  const fetchStudents = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      const errorMsg = "Authentication token missing. Please login again.";
      setError(errorMsg);
      message.error(errorMsg);
      return;
    }

    try {
      const url = collegeId
        ? `http://localhost:3001/api/student/getAllStudents?collegeId=${collegeId}`
        : "http://localhost:3001/api/student/getAllStudents";

      const response = await fetch(url, {
        headers: { 
          "Content-Type": "application/json", 
          token: token 
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const result = await response.json();
      setStudents(result.data || []);
      setError(null);
    } catch (error: any) {
      console.error("Error fetching students:", error);
      const errorMsg = error.message || "Failed to fetch students";
      setError(errorMsg);
      message.error(errorMsg);
    }
  };

  const applyFilters = () => {
    let filteredData = [...students];

    // Apply search filter
    if (filters.search) {
      const searchText = filters.search.trim().toLowerCase();
      filteredData = filteredData.filter((student) => {
        const studentFields = `${student.firstname} ${
          student.lastname
        } ${student.email} ${student.countrycode} ${
          student.mobileno
        } ${student.student_id} ${
          student.college_name ?? ""
        }`.toLowerCase();
        
        const courseFields =
          student.courses
            ?.map((c) =>
              `${c.course_id} ${c.course_name}`.toLowerCase()
            )
            .join(" ") || "";
        
        const batchFields =
          student.batches
            ?.map((b) =>
              `${b.batch_id} ${b.batch_name} ${b.start_date} ${b.end_date}`.toLowerCase()
            )
            .join(" ") || "";
        
        return (
          studentFields.includes(searchText) ||
          courseFields.includes(searchText) ||
          batchFields.includes(searchText)
        );
      });
    }

    // Apply course filter
    if (filters.courseId !== null) {
      filteredData = filteredData.filter(student => 
        student.courses?.some(course => course.course_id === filters.courseId)
      );
    }

    setFilteredStudents(filteredData);
  };

  const fetchCourses = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      const errorMsg = "Authentication token missing. Please login again.";
      setError(errorMsg);
      message.error(errorMsg);
      return;
    }
    try {
      const response = await axios.get(
        "http://localhost:3001/api/course/getCourses",
        {
          headers: {
            "Content-Type": "application/json",
            token: token,
          },
        }
      );
      
      if (response.data && Array.isArray(response.data)) {
        setCourses(response.data);
        setError(null); 
      } else if (response.data.data && Array.isArray(response.data.data)) {
        setCourses(response.data.data);
        setError(null);
      } else {
        console.warn("Unexpected courses response format:", response.data);
        setCourses([]);
        const errorMsg = "Unexpected courses data format received from server";
        setError(errorMsg);
        message.warning(errorMsg);
      }
    } catch (error: any) {
      console.error("Error fetching courses:", error);
      const errorMsg = error.response?.data?.message || error.message || "Failed to fetch courses";
      setError(errorMsg);
      message.error(errorMsg);
    }
  };

  const fetchBatches = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      const errorMsg = "Authentication token missing. Please login again.";
      setError(errorMsg);
      message.error(errorMsg);
      return;
    }
    try {
      const response = await axios.get(
        "http://localhost:3001/api/course/viewAllBatches",
        {
          headers: {
            "Content-Type": "application/json",
            token: token,
          },
        }
      );
      
      if (response.data && response.data.data && Array.isArray(response.data.data)) {
        setBatches(response.data.data);
        setError(null);
      } else {
        console.warn("Unexpected batches response format:", response.data);
        setBatches([]);
        const errorMsg = "Unexpected batches data format received from server";
        setError(errorMsg);
        message.warning(errorMsg);
      }
    } catch (error: any) {
      console.error("Error fetching batches:", error);
      const errorMsg = error.response?.data?.message || error.message || "Failed to fetch batches";
      setError(errorMsg);
      message.error(errorMsg);
    }
  };

  const formatDateToDDMMYYYY = (dateValue: string | number) => {
    if (!dateValue) return "-";

    try {
      if (typeof dateValue === "number" || /^\d+$/.test(dateValue.toString())) {
        const date = moment.unix(Number(dateValue));
        return date.format("DD-MM-YYYY");
      }

      const date = moment(
        dateValue,
        ["DD-MM-YYYY", "YYYY-MM-DD", moment.ISO_8601],
        true
      );

      if (date.isValid()) {
        return date.format("DD-MM-YYYY");
      }

      return dateValue.toString();
    } catch (error) {
      console.error("Error formatting date:", error);
      return dateValue.toString();
    }
  };

  const showEditModal = (student: Student) => {
    setEditingStudent(student);
    form.setFieldsValue({
      firstname: student.firstname,
      lastname: student.lastname,
      email: student.email,
      countrycode: student.countrycode,
      mobileno: student.mobileno,
    });
    setIsModalVisible(true);
  };

  const showAssignModal = (student: Student) => {
    setSelectedStudent(student);
    setSelectedCourse(null);
    setSelectedBatch(null);
    setFilteredBatches([]);
    assignForm.resetFields();
    setIsAssignModalVisible(true);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    setEditingStudent(null);
    form.resetFields();
  };

  const handleCreateCancel = () => {
    setIsCreateModalVisible(false);
    createForm.resetFields();
  };

  const handleAssignCancel = () => {
    setIsAssignModalVisible(false);
    setSelectedStudent(null);
    setSelectedCourse(null);
    setSelectedBatch(null);
    setFilteredBatches([]);
    assignForm.resetFields();
  };

  const handleUpdate = async () => {
    if (!editingStudent) return;
    
    try {
      setUpdateLoading(true);
      setError(null);
      const values = await form.validateFields();

      const response = await axios.post(
        "http://localhost:3001/api/student/updateStudent",
        {
          studentId: editingStudent.student_id,
          ...values,
        },
        {
          headers: {
            "Content-Type": "application/json",
            token: localStorage.getItem("token") || "",
          },
        }
      );

      if (response.data.success) {
        window.location.reload();
        message.success("Student updated successfully");
        
        setIsModalVisible(false);
        setEditingStudent(null);
        form.resetFields();
        await fetchStudents();
      } else {
        throw new Error(response.data.message || "Failed to update student");
      }
    } catch (error: any) {
      console.error("Error updating student:", error);
      const errorMsg = error.response?.data?.message || error.message || "Failed to update student";
      setError(errorMsg);
      message.error(errorMsg);
    } finally {
      setUpdateLoading(false);
    }
  };

  const handleCreateStudent = async () => {
    try {
      setCreateLoading(true);
      setError(null);
      const values = await createForm.validateFields();

      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("Authentication token missing");
      }

      const response = await axios.post(
        "http://localhost:3001/api/student/createStudent",
        values,
        {
          headers: {
            "Content-Type": "application/json",
            token: token,
          },
        }
      );

      window.location.reload();

      if (response.data.success) {
        message.success("Student created successfully!");
        setIsCreateModalVisible(false);
        createForm.resetFields();
        await fetchStudents();
      } else {
        throw new Error(response.data.message || "Failed to create student");
      }
    } catch (error: any) {
      console.error("Error creating student:", error);
      const errorMsg = error.response?.data?.message || error.message || "Failed to create student";
      setError(errorMsg);
      message.error(errorMsg);
    } finally {
      setCreateLoading(false);
    }
  };

  const handleCourseChange = (value: number) => {
    setSelectedCourse(value);
    setSelectedBatch(null);
    const filtered = batches.filter((batch) => batch.course_id === value);
    setFilteredBatches(filtered);
    assignForm.setFieldsValue({ batch: undefined });
  };

  const handleFilterCourseChange = (value: number | null) => {
    setFilters({ ...filters, courseId: value });
  };

  const handleAssignCourse = async () => {
    if (!selectedStudent || !selectedCourse || !selectedBatch) {
      message.error("Please select a course and batch");
      return;
    }

    try {
      setAssignLoading(true);
      setError(null);
      const response = await axios.post(
        "http://localhost:3001/api/student/assignStudentToCourse",
        {
          studentId: selectedStudent.student_id,
          courseId: selectedCourse,
          batchId: selectedBatch,
        },
        {
          headers: {
            "Content-Type": "application/json",
            token: localStorage.getItem("token") || "",
          },
        }
      );

      window.location.reload();

      if (response.data.success) {
        message.success("Student assigned to course successfully");
        setIsAssignModalVisible(false);
        setSelectedCourse(null);
        setSelectedBatch(null);
        setFilteredBatches([]);
        assignForm.resetFields();
        await fetchStudents();
      } else {
        throw new Error(response.data.message || "Failed to assign student");
      }
    } catch (error: any) {
      console.error("Error assigning student:", error);
      const errorMsg = error.response?.data?.message || error.message || "Failed to assign student";
      setError(errorMsg);
      message.error(errorMsg);
    } finally {
      setAssignLoading(false);
    }
  };

  const handleDelete = async (studentId: number) => {
    try {
      setError(null);
      const response = await fetch(
        "http://localhost:3001/api/student/deleteStudent",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            token: localStorage.getItem("token") || "",
          },
          body: JSON.stringify({ studentId }),
        }
      );

      window.location.reload();

      if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);

      const result = await response.json();
      if (result.ok) {
        message.success("Student deleted successfully");
        await fetchStudents();
      } else {
        throw new Error(result.message || "Failed to delete student");
      }
    } catch (error: any) {
      console.error("Error deleting student:", error);
      const errorMsg = error.message || "Failed to delete student";
      setError(errorMsg);
      message.error(errorMsg);
    }
  };

  const handleSearch = (value: string) => {
    setFilters({ ...filters, search: value });
  };

  const clearFilters = () => {
    setFilters({
      search: "",
      courseId: null,
    });
  };

  const studentColumns = [
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
      key: "college_name",
      render: (college: string) => college || "-",
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
          {record.courses && record.courses.length > 0 ? (
            record.courses.map((course) => (
              <Tag 
                color="blue" 
                key={course.course_id}
                style={{ marginBottom: 4, fontSize: '12px', padding: '4px 12px' }}
              >
                {course.course_name}
              </Tag>
            ))
          ) : (
            <Tag color="orange" style={{ fontSize: '12px', padding: '4px 12px' }}>Not assigned</Tag>
          )}
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
          {record.batches && record.batches.length > 0 ? (
            record.batches.map((batch) => (
              <div key={batch.batch_id} style={{ marginBottom: 4 }}>
                <Tag 
                  color="green" 
                  style={{ fontSize: '12px', padding: '4px 12px' }}
                >
                  {batch.batch_name}
                </Tag>
                <div style={{ fontSize: 12, color: '#6b7280' }}>
                  {formatDateToDDMMYYYY(batch.start_date)} to{" "}
                  {formatDateToDDMMYYYY(batch.end_date)}
                </div>
              </div>
            ))
          ) : (
            <Tag color="orange" style={{ fontSize: '12px', padding: '4px 12px' }}>Not assigned</Tag>
          )}
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
          {(!record.courses || record.courses.length === 0) && (
            <Button
              type="primary"
              onClick={() => showAssignModal(record)}
              style={{ 
                background: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)',
                border: 'none',
                fontSize: '12px',
                height: '32px',
                padding: '0 12px'
              }}
            >
              Assign Course
            </Button>
          )}
        </Space>
      ),
    },
  ];

  return (
    <CollegeLayoutWrapper
      pageTitle={collegeId ? "College Students" : "All Students"}
    >
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
          <FileTextOutlined style={{ marginRight: '12px', color: '#6366f1' }} />
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
            <Col xs={24} sm={12} md={8}>
              <Input.Search
                placeholder="Search students..."
                allowClear
                size="large"
                onSearch={handleSearch}
                onChange={(e) => handleSearch(e.target.value)}
                value={filters.search}
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
            <Col xs={24} sm={12} md={6}>
              <Button 
                icon={<ClearOutlined />}
                onClick={clearFilters}
                style={{ 
                  width: '100%',
                  height: '40px',
                  background: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)',
                  border: 'none',
                  color: 'white',
                  fontWeight: 600,
                  borderRadius: '8px'
                }}
              >
                Clear Filters
              </Button>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Select
                style={{ width: '100%', height: '40px' }}
                placeholder="Filter by course"
                allowClear
                value={filters.courseId}
                onChange={handleFilterCourseChange}
                suffixIcon={<FilterOutlined style={{ color: '#6366f1' }} />}
                loading={filterLoading}
              >
                {courses.map((course) => (
                  <Option key={course.id} value={course.id}>
                    {course.name}
                  </Option>
                ))}
              </Select>
            </Col>
            <Col xs={24} sm={24} md={4}>
              <Statistic
                title="Total Students"
                value={filteredStudents.length}
                valueStyle={{ 
                  color: '#6366f1', 
                  fontSize: '24px', 
                  fontWeight: 700 
                }}
              />
            </Col>
            <Col xs={24} sm={24} md={6}>
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => setIsCreateModalVisible(true)}
                style={{ 
                background: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)',
                  border: 'none',
                  height: '40px',
                  width: '100%'
                }}
              >
                Add Student
              </Button>
            </Col>
          </Row>
        </Card>

        <Spin spinning={loading} tip="Loading students...">
          <Table
            columns={studentColumns}
            dataSource={filteredStudents}
            rowKey="student_id"
            pagination={{ 
              pageSize:5,
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
            onRow={(record) => ({
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
          confirmLoading={updateLoading}
          footer={[
            <Button key="back" onClick={handleCancel} style={{ height: '40px', borderRadius: '8px' }}>
              Cancel
            </Button>,
            <Button
              key="submit"
              type="primary"
              loading={updateLoading}
              onClick={handleUpdate}
              style={{ 
                background: 'linear-gradient(135deg, #8b5eab 0%, #6b46c1 100%)',
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

        {/* Create Student Modal */}
        <Modal
          title={<span style={{ color: '#8b5eab', fontWeight: 600 }}>Create New Student</span>}
          open={isCreateModalVisible}
          onOk={handleCreateStudent}
          onCancel={handleCreateCancel}
          confirmLoading={createLoading}
          footer={[
            <Button key="back" onClick={handleCreateCancel} style={{ height: '40px', borderRadius: '8px' }}>
              Cancel
            </Button>,
            <Button
              key="submit"
              type="primary"
              loading={createLoading}
              onClick={handleCreateStudent}
              style={{ 
                background: 'linear-gradient(135deg, #8b5eab 0%, #6b46c1 100%)',
                border: 'none',
                height: '40px',
                borderRadius: '8px'
              }}
            >
              Create
            </Button>,
          ]}
          centered
          width={700}
          destroyOnClose
          bodyStyle={{ padding: '24px' }}
        >
          <Form form={createForm} layout="vertical" preserve={false}>
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
                  initialValue="+91"
                  rules={[{ required: true, message: "Please input country code!" }]}
                >
                  <Input placeholder="+91" size="large" />
                </Form.Item>
              </Col>
              <Col span={16}>
                <Form.Item
                  name="mobileno"
                  label={<Text strong>Mobile Number</Text>}
                  rules={[
                    { required: true, message: "Please input mobile number!" },
                    {
                      pattern: /^[0-9]{10}$/,
                      message: "Please enter a valid 10-digit mobile number!",
                    },
                  ]}
                >
                  <Input placeholder="Enter 10-digit mobile number" maxLength={10} size="large" />
                </Form.Item>
              </Col>
            </Row>
          </Form>
        </Modal>

        {/* Assign Student Modal */}
        <Modal
          title={<span style={{ color: '#8b5eab', fontWeight: 600 }}>Assign Course to Student</span>}
          open={isAssignModalVisible}
          onOk={handleAssignCourse}
          onCancel={handleAssignCancel}
          confirmLoading={assignLoading}
          footer={[
            <Button key="back" onClick={handleAssignCancel} style={{ height: '40px', borderRadius: '8px' }}>
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
          
          <Form form={assignForm} layout="vertical" preserve={false}>
            <Form.Item 
              name="course"
              label={<Text strong>Select Course</Text>} 
              rules={[{ required: true, message: "Please select a course!" }]}
            >
              <Select
                placeholder="Select a course"
                style={{ width: "100%" }}
                onChange={handleCourseChange}
                value={selectedCourse}
                showSearch
                optionFilterProp="children"
                filterOption={(input, option) =>
                  (option?.children as unknown as string)?.toLowerCase().indexOf(input.toLowerCase()) >= 0
                }
                size="large"
              >
                {courses.map((course) => (
                  <Option key={course.id} value={course.id}>
                    {course.name}
                  </Option>
                ))}
              </Select>
            </Form.Item>
            
            <Form.Item 
              name="batch"
              label={<Text strong>Select Batch</Text>} 
              rules={[{ required: true, message: "Please select a batch!" }]}
            >
              <Select
                placeholder={selectedCourse ? "Select a batch" : "Please select a course first"}
                style={{ width: "100%" }}
                onChange={(value) => setSelectedBatch(value)}
                value={selectedBatch}
                disabled={!selectedCourse}
                showSearch
                optionFilterProp="children"
                filterOption={(input, option) =>
                  (option?.children as unknown as string)?.toLowerCase().indexOf(input.toLowerCase()) >= 0
                }
                size="large"
              >
                {filteredBatches.map((batch) => (
                  <Option key={batch.batch_id} value={batch.batch_id}>
                    {batch.name}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Form>
        </Modal>
      </div>
      
      <style>{`
        .table-row-light {
          background-color: #fafafa;
        }
        .table-row-dark {
          background-color: white;
        }
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
    </CollegeLayoutWrapper>
  );
};

export default StudentComponent;