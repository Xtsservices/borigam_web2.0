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
  Alert
} from "antd";
import { EditOutlined, DeleteOutlined, PlusOutlined, SearchOutlined } from "@ant-design/icons";
import moment from "moment";
import axios from "axios";

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

interface StudentComponentProps {
  students: Student[];
  loading: boolean;
  collegeId?: string;
  onAssignStudent: (student: Student) => void;
  onDeleteStudent: (studentId: number) => Promise<void>;
  onRefresh: () => Promise<void>;
}

const StudentComponent = ({
   students,
  loading,
  collegeId,
  onAssignStudent,
  onDeleteStudent,
  onRefresh,
}: StudentComponentProps) => {
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

  useEffect(() => {
    applySearchFilter(students, searchText);
  }, [students, searchText]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        await Promise.all([fetchCourses(), fetchBatches()]);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };
    fetchData();
  }, []);

  const applySearchFilter = (studentsData: Student[], search: string) => {
    if (!search.trim()) {
      setFilteredStudents(studentsData);
      return;
    }
    
    const searchText = search.trim().toLowerCase();
    const filtered = studentsData.filter((student) => {
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
    
    setFilteredStudents(filtered);
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
        "http://13.233.33.133:3001/api/course/getCourses",
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
        "http://13.233.33.133:3001/api/course/viewAllBatches",
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
        "http://13.233.33.133:3001/api/student/updateStudent",
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
        message.success("Student updated successfully");
        setIsModalVisible(false);
        setEditingStudent(null);
        form.resetFields();
        await onRefresh();
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
        "http://13.233.33.133:3001/api/student/createStudent",
        values,
        {
          headers: {
            "Content-Type": "application/json",
            token: token,
          },
        }
      );

      alert("created student successfully" );

      window.location.reload();

      if (response.data.success) {
        message.success("Student created successfully!");
        setIsCreateModalVisible(false);
        createForm.resetFields();
        window.location.reload();
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

  const handleAssignCourse = async () => {
    if (!selectedStudent || !selectedCourse || !selectedBatch) {
      message.error("Please select a course and batch");
      return;
    }

    try {
      setAssignLoading(true);
      setError(null);
      const response = await axios.post(
        "http://13.233.33.133:3001/api/student/assignStudentToCourse",
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

      alert("assigned student successfully");

      window.location.reload();

      if (response.data.success) {
        message.success("Student assigned to course successfully");
        setIsAssignModalVisible(false);
        setSelectedCourse(null);
        setSelectedBatch(null);
        setFilteredBatches([]);
        assignForm.resetFields();
        await onRefresh();
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
      await onDeleteStudent(studentId);
      await onRefresh();
    } catch (error: any) {
      console.error("Error deleting student:", error);
      const errorMsg = error.response?.data?.message || error.message || "Failed to delete student";
      setError(errorMsg);
      message.error(errorMsg);
    }
  };

  const handleSearch = (value: string) => {
    setSearchText(value);
  };

  const studentColumns = [
    {
      title: "Student Name",
      key: "studentName",
      render: (_: unknown, record: Student) => (
        <Text strong>{`${record.firstname} ${record.lastname}`}</Text>
      ),
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
      render: (email: string) => <Text type="secondary">{email}</Text>,
    },
    {
      title: "Phone Number",
      key: "phoneNumber",
      render: (_: unknown, record: Student) => (
        <Text>{`${record.countrycode} ${record.mobileno}`}</Text>
      ),
    },
    {
      title: "College",
      dataIndex: "college_name",
      key: "college_name",
      render: (college: string) => college || "-",
    },
    {
      title: "Courses",
      key: "courses",
      render: (_: unknown, record: Student) => (
        <div>
          {record.courses && record.courses.length > 0 ? (
            record.courses.map((course) => (
              <Tag color="blue" key={course.course_id}>
                {course.course_name}
              </Tag>
            ))
          ) : (
            <Tag color="orange">Not assigned</Tag>
          )}
        </div>
      ),
    },
    {
      title: "Batches",
      key: "batches",
      render: (_: unknown, record: Student) => (
        <div>
          {record.batches && record.batches.length > 0 ? (
            record.batches.map((batch) => (
              <div key={batch.batch_id} style={{ marginBottom: 4 }}>
                <Tag color="green">{batch.batch_name}</Tag>
                <div style={{ fontSize: 12 }}>
                  {formatDateToDDMMYYYY(batch.start_date)} to{" "}
                  {formatDateToDDMMYYYY(batch.end_date)}
                </div>
              </div>
            ))
          ) : (
            <Tag color="orange">Not assigned</Tag>
          )}
        </div>
      ),
    },
    {
      title: "Actions",
      key: "action",
      render: (_: unknown, record: Student) => (
        <Space size="middle">
          <Button
            type="text"
            icon={<EditOutlined />}
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
            <Button type="text" danger icon={<DeleteOutlined />} title="Delete" />
          </Popconfirm>
          {(!record.courses || record.courses.length === 0) && (
            <Button
              type="primary"
              onClick={() => showAssignModal(record)}
              style={{ background: "#8B5EAB", borderColor: "#8B5EAB" }}
            >
              Assign Course
            </Button>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: '24px' }}>
      <Card
        title={<Title level={4} style={{ margin: 0 }}>Students Management</Title>}
        extra={
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => setIsCreateModalVisible(true)}
            style={{background: "linear-gradient(45deg, #FFA500, #FF6347)", borderColor: "#8B5EAB" }}
          >
            Add Student
          </Button>
        }
        style={{ 
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)', 
          borderRadius: '8px',
          border: '1px solid #d9d9d9'
        }}
      >
        {error && (
          <Alert
            description={error}
            type="error"
            closable
            onClose={() => setError(null)}
            style={{ marginBottom: '16px' }}
          />
        )}
        
        <Row gutter={[16, 16]} style={{ marginBottom: '16px' }}>
          <Col xs={24} sm={12} md={8} lg={6}>
            <Input.Search
              placeholder="Search students..."
              allowClear
              size="large"
              onSearch={handleSearch}
              onChange={(e) => handleSearch(e.target.value)}
              value={searchText}
            />
          </Col>
        </Row>

        <Spin spinning={loading} tip="Loading students...">
          <Table
            columns={studentColumns}
            dataSource={filteredStudents}
            rowKey="student_id"
            pagination={{ 
              pageSize: 5,
              showSizeChanger: true,
              pageSizeOptions: ['10', '20', '50', '100']
            }}
            bordered
            scroll={{ x: 'max-content' }}
            style={{ marginTop: '16px' }}
          />
        </Spin>
      </Card>

      {/* Edit Student Modal */}
      <Modal
        title={<span style={{ color: '#8B5EAB' }}>Edit Student Details</span>}
        open={isModalVisible}
        onOk={handleUpdate}
        onCancel={handleCancel}
        confirmLoading={updateLoading}
        footer={[
          <Button key="back" onClick={handleCancel}>
            Cancel
          </Button>,
          <Button
            key="submit"
            type="primary"
            loading={updateLoading}
            onClick={handleUpdate}
            style={{ background: "#8B5EAB", border: "none" }}
          >
            Update
          </Button>,
        ]}
        centered
        width={700}
        destroyOnClose
      >
        <Form form={form} layout="vertical" preserve={false}>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="firstname"
                label="First Name"
                rules={[{ required: true, message: "Please input first name!" }]}
              >
                <Input placeholder="Enter first name" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="lastname"
                label="Last Name"
                rules={[{ required: true, message: "Please input last name!" }]}
              >
                <Input placeholder="Enter last name" />
              </Form.Item>
            </Col>
          </Row>
          
          <Form.Item
            name="email"
            label="Email"
            rules={[
              { required: true, message: "Please input email!" },
              { type: "email", message: "Please enter a valid email!" },
            ]}
          >
            <Input placeholder="Enter email address" />
          </Form.Item>
          
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                name="countrycode"
                label="Country Code"
                rules={[{ required: true, message: "Please input country code!" }]}
              >
                <Input placeholder="+91" />
              </Form.Item>
            </Col>
            <Col span={16}>
              <Form.Item
                name="mobileno"
                label="Mobile Number"
                rules={[{ required: true, message: "Please input mobile number!" }]}
              >
                <Input placeholder="Enter mobile number" />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>

      {/* Create Student Modal */}
      <Modal
        title={<span style={{ color: '#8B5EAB' }}>Create New Student</span>}
        open={isCreateModalVisible}
        onOk={handleCreateStudent}
        onCancel={handleCreateCancel}
        confirmLoading={createLoading}
        footer={[
          <Button key="back" onClick={handleCreateCancel}>
            Cancel
          </Button>,
          <Button
            key="submit"
            type="primary"
            loading={createLoading}
            onClick={handleCreateStudent}
            style={{ background: "#8B5EAB", border: "none" }}
          >
            Create
          </Button>,
        ]}
        centered
        width={700}
        destroyOnClose
      >
        <Form form={createForm} layout="vertical" preserve={false}>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="firstname"
                label="First Name"
                rules={[{ required: true, message: "Please input first name!" }]}
              >
                <Input placeholder="Enter first name" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="lastname"
                label="Last Name"
                rules={[{ required: true, message: "Please input last name!" }]}
              >
                <Input placeholder="Enter last name" />
              </Form.Item>
            </Col>
          </Row>
          
          <Form.Item
            name="email"
            label="Email"
            rules={[
              { required: true, message: "Please input email!" },
              { type: "email", message: "Please enter a valid email!" },
            ]}
          >
            <Input placeholder="Enter email address" />
          </Form.Item>
          
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                name="countrycode"
                label="Country Code"
                initialValue="+91"
                rules={[{ required: true, message: "Please input country code!" }]}
              >
                <Input placeholder="+91" />
              </Form.Item>
            </Col>
            <Col span={16}>
              <Form.Item
                name="mobileno"
                label="Mobile Number"
                rules={[
                  { required: true, message: "Please input mobile number!" },
                  {
                    pattern: /^[0-9]{10}$/,
                    message: "Please enter a valid 10-digit mobile number!",
                  },
                ]}
              >
                <Input placeholder="Enter 10-digit mobile number" maxLength={10} />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>

      {/* Assign Student Modal */}
      <Modal
        title={<span style={{ color: '#8B5EAB' }}>Assign Course to Student</span>}
        open={isAssignModalVisible}
        onOk={handleAssignCourse}
        onCancel={handleAssignCancel}
        confirmLoading={assignLoading}
        footer={[
          <Button key="back" onClick={handleAssignCancel}>
            Cancel
          </Button>,
          <Button
            key="submit"
            type="primary"
            loading={assignLoading}
            onClick={handleAssignCourse}
            style={{ background: "#8B5EAB", border: "none" }}
            disabled={!selectedCourse || !selectedBatch}
          >
            Assign
          </Button>,
        ]}
        centered
        destroyOnClose
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
  );
};

export default StudentComponent;