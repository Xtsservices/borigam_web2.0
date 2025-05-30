import { useEffect, useState } from "react";
import {
  Card,
  Button,
  Table,
  Modal,
  Form,
  Select,
  message,
  Space,
  Input,
  Popconfirm,
  DatePicker,
  Row,
  Col,
  Image,
  Spin,
  Alert,
  Typography,
  Tag
} from "antd";
import { EditOutlined, DeleteOutlined, BookOutlined, FileTextOutlined } from "@ant-design/icons";
import CollegeLayoutWrapper from "../../components/collegeLayout/collegeLayoutWrapper";
import { useParams, useNavigate } from "react-router-dom";
import moment from "moment";
import add_dashboard from "../../assets/add_dashboard.png";


const { Option } = Select;
const { Title, Text } = Typography;

interface Course {
  id: number;
  name: string;
  status: string;
}

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

interface Batch {
  batch_id: number;
  name: string;
  course_id: number;
  course_name: string;
  start_date: string;
  end_date: string;
  status: string;
}

interface EditData {
  id: number;
  name: string;
  start_date?: string;
  end_date?: string;
  startMoment?: moment.Moment | null;
  endMoment?: moment.Moment | null;
}

const StudentDashboard = () => {
  const { collegeId } = useParams();
  const navigate = useNavigate();
  const [courses, setCourses] = useState<Course[]>([]);
  const [batches, setBatches] = useState<Batch[]>([]);
  const [filteredBatches, setFilteredBatches] = useState<Batch[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [assignModalVisible, setAssignModalVisible] = useState(false);
  const [currentStudent, setCurrentStudent] = useState<Student | null>(null);
  const [courseModalVisible, setCourseModalVisible] = useState(false);
  const [batchModalVisible, setBatchModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [courseForm] = Form.useForm();
  const [batchForm] = Form.useForm();
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [editType, setEditType] = useState<"course" | "batch" | null>(null);
  const [editData, setEditData] = useState<EditData>({
    id: 0,
    name: "",
    startMoment: null,
    endMoment: null,
  });
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAllData = async () => {
      setLoading(true);
      setError(null);
      try {
        await Promise.all([
          fetchCourses(),
          fetchBatches(),
          fetchStudents(collegeId ? parseInt(collegeId) : undefined),
        ]);
      } catch (error) {
        console.error("Error fetching data:", error);
        // setError("Failed to load data. Please try again.");
        message.error("Failed to load data");
      } finally {
        setLoading(false);
      }
    };

    fetchAllData();
  }, [collegeId]);

  const fetchCourses = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      setError("Authentication token missing. Please login again.");
      return;
    }

    try {
      const response = await fetch(
        "http://13.233.33.133:3001/api/course/getCourses",
        {
          headers: { "Content-Type": "application/json", token: token || "" },
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const data = await response.json();
      setCourses(data.data || data);
    } catch (error) {
      console.error("Error fetching courses:", error);
      setError("Failed to fetch courses. Please try again.");
      throw error;
    }
  };

  const fetchBatches = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      setError("Authentication token missing. Please login again.");
      return;
    }

    try {
      const response = await fetch(
        "http://13.233.33.133:3001/api/course/viewAllBatches",
        {
          headers: { "Content-Type": "application/json", token: token || "" },
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const result = await response.json();
      setBatches(result.data || []);
    } catch (error) {
      console.error("Error fetching batches:", error);
      // setError("Failed to fetch batches. Please try again.");
      throw error;
    }
  };

  const fetchStudents = async (collegeId?: number) => {
    const token = localStorage.getItem("token");
    if (!token) {
      setError("Authentication token missing. Please login again.");
      return;
    }

    try {
      const url = collegeId
        ? `http://13.233.33.133:3001/api/student/getAllStudents?collegeId=${collegeId}`
        : "http://13.233.33.133:3001/api/student/getAllStudents";

      const response = await fetch(url, {
        headers: { "Content-Type": "application/json", token: token || "" },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const result = await response.json();
      setStudents(result.data || []);
      return result.data || [];
    } catch (error) {
      console.error("Error fetching students:", error);
      // setError("Failed to fetch students. Please try again.");
      throw error;
    }
  };

  const handleCourseChange = (courseId: number) => {
    const batchesForCourse = batches.filter(
      (batch) => batch.course_id === courseId
    );
    setFilteredBatches(batchesForCourse);
    form.setFieldsValue({ batchId: undefined });
  };

  const handleAssignStudent = async (values: any) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("Authentication token missing");
      }

      const response = await fetch(
        "http://13.233.33.133:3001/api/student/assignStudentToCourse",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            token: token,
          },
          body: JSON.stringify({
            studentId: currentStudent?.student_id,
            courseId: values.courseId,
            batchId: values.batchId,
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Assignment failed");
      }

      message.success("Student assigned successfully");
      setAssignModalVisible(false);
      await fetchStudents(collegeId ? parseInt(collegeId) : undefined);
    } catch (error: any) {
      console.error("Error assigning student:", error);
      message.error(error.message || "Failed to assign student");
    }
  };

  const handleDeleteStudent = async (studentId: number) => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("Authentication token missing");
      }

      const response = await fetch(
        "http://13.233.33.133:3001/api/student/deleteStudent",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            token: token,
          },
          body: JSON.stringify({ studentId }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP error! Status: ${response.status}`);
      }

      const result = await response.json();
      if (result.ok) {
        message.success("Student deleted successfully");
        await fetchStudents(collegeId ? parseInt(collegeId) : undefined);
      } else {
        throw new Error(result.message || "Failed to delete student");
      }
    } catch (error: any) {
      console.error("Error deleting student:", error);
      message.error(error.message || "Failed to delete student");
    } finally {
      setLoading(false);
    }
  };

  const handleAddCourse = async () => {
    try {
      const values = await courseForm.validateFields();
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("Authentication token missing");
      }

      if (!values.name.trim()) {
        message.warning("Course name cannot be empty");
        return;
      }

      const response = await fetch(
        "http://13.233.33.133:3001/api/course/createCourse",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            token: token,
          },
          body: JSON.stringify({ name: values.name }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to create course");
      }

      message.success("Course added successfully");
      courseForm.resetFields();
      setCourseModalVisible(false);
      await fetchCourses();
    } catch (error: any) {
      console.error("Error creating course:", error);
      message.error(error.message || "Error creating course");
    }
  };

  const handleAddBatch = async () => {
    try {
      const values = await batchForm.validateFields();
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("Authentication token missing");
      }

      if (
        !values.name ||
        !values.course_id ||
        !values.start_date ||
        !values.end_date
      ) {
        message.warning("Please fill all fields");
        return;
      }

      const response = await fetch(
        "http://13.233.33.133:3001/api/course/createBatch",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            token: token,
          },
          body: JSON.stringify({
            name: values.name,
            course_id: values.course_id,
            start_date: values.start_date.format("DD-MM-YYYY"),
            end_date: values.end_date.format("DD-MM-YYYY"),
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to create batch");
      }

      message.success("Batch added successfully");
      batchForm.resetFields();
      setBatchModalVisible(false);
      await fetchBatches();
    } catch (error: any) {
      console.error("Error creating batch:", error);
      message.error(error.message || "Error creating batch");
    }
  };

  const handleEditClick = (
    type: "course" | "batch",
    id: number,
    name: string,
    start_date?: string,
    end_date?: string
  ) => {
    setEditType(type);

    if (type === "batch") {
      const startMoment =
        start_date && moment(start_date, "DD-MM-YYYY", true).isValid()
          ? moment(start_date, "DD-MM-YYYY")
          : null;
      const endMoment =
        end_date && moment(end_date, "DD-MM-YYYY", true).isValid()
          ? moment(end_date, "DD-MM-YYYY")
          : null;

      setEditData({
        id,
        name,
        start_date: startMoment?.format("DD-MM-YYYY") || "",
        end_date: endMoment?.format("DD-MM-YYYY") || "",
        startMoment,
        endMoment,
      });
    } else {
      setEditData({
        id,
        name,
        startMoment: null,
        endMoment: null,
      });
    }

    setIsEditModalVisible(true);
  };

  const handleEditSubmit = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      message.error("Authentication required");
      return;
    }

    try {
      let url = "";
      let body: any = {
        id: editData.id,
        name: editData.name,
      };

      if (editType === "batch") {
        if (
          editData.start_date &&
          !/^\d{2}-\d{2}-\d{4}$/.test(editData.start_date)
        ) {
          throw new Error("Invalid start_date format. Use DD-MM-YYYY.");
        }
        if (
          editData.end_date &&
          !/^\d{2}-\d{2}-\d{4}$/.test(editData.end_date)
        ) {
          throw new Error("Invalid end_date format. Use DD-MM-YYYY.");
        }

        url = `http://13.233.33.133:3001/api/course/updateBatch`;
        body = {
          ...body,
          start_date: editData.start_date,
          end_date: editData.end_date,
        };
      } else {
        url = `http://13.233.33.133:3001/api/course/updateCourse`;
      }

      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          token,
        },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to update");
      }

      const result = await response.json();
      message.success(result.message || `${editType} updated successfully`);
      setIsEditModalVisible(false);

      if (editType === "course") {
        await fetchCourses();
      } else {
        await fetchBatches();
      }
    } catch (error: any) {
      console.error(`Error updating ${editType}:`, error);
      message.error(error.message || `Error updating ${editType}`);
    }
  };

  const handleDelete = async (type: "course" | "batch", id: number) => {
    const token = localStorage.getItem("token");
    if (!token) {
      message.error("Authentication required");
      return;
    }

    try {
      const url =
        type === "course"
          ? `http://13.233.33.133:3001/api/course/deleteCourse?id=${id}`
          : `http://13.233.33.133:3001/api/course/deleteBatch?id=${id}`;

      const response = await fetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          token,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to delete");
      }

      const result = await response.json();
      message.success(result.message || `${type} deleted successfully`);

      if (type === "course") {
        await fetchCourses();
      } else {
        await fetchBatches();
      }
    } catch (error: any) {
      console.error(`Error deleting ${type}:`, error);
      message.error(error.message || `Error deleting ${type}`);
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

  const courseColumns = [
    {
      title: (
        <span style={{ fontWeight: 600, color: '#1f2937' }}>
          <BookOutlined style={{ marginRight: 8, color: '#6366f1' }} />
          Course Name
        </span>
      ),
      dataIndex: "name",
      key: "name",
      render: (text: string) => (
        <Text strong style={{ fontSize: '14px', color: '#1f2937' }}>
          {text}
        </Text>
      )
    },
    {
      title: (
        <span style={{ fontWeight: 600, color: '#1f2937' }}>
          Status
        </span>
      ),
      dataIndex: "status",
      key: "status",
      render: (text: string) => (
        <Tag color={text === "active" ? "success" : "error"}>
          {text}
        </Tag>
      )
    },
    {
      title: (
        <span style={{ fontWeight: 600, color: '#1f2937' }}>
          Actions
        </span>
      ),
      key: "actions",
      render: (_text: string, record: Course) => (
        <Space size="middle">
          <Popconfirm
            title="Are you sure to delete this course?"
            onConfirm={() => handleDelete("course", record.id)}
            okText="Yes"
            cancelText="No"
          >
            <Button
              type="text"
              icon={<DeleteOutlined />}
              style={{ color: "#ff4d4f" }}
            />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const batchColumns = [
    {
      title: (
        <span style={{ fontWeight: 600, color: '#1f2937' }}>
          <FileTextOutlined style={{ marginRight: 8, color: '#6366f1' }} />
          Batch Name
        </span>
      ),
      dataIndex: "name",
      key: "name",
      render: (text: string) => (
        <Text strong style={{ fontSize: '14px', color: '#1f2937' }}>
          {text}
        </Text>
      )
    },
    {
      title: (
        <span style={{ fontWeight: 600, color: '#1f2937' }}>
          Course
        </span>
      ),
      dataIndex: "course_name",
      key: "course_name",
      render: (text: string) => (
        <Tag color="blue" style={{ fontSize: '12px', padding: '4px 12px' }}>
          {text}
        </Tag>
      )
    },
    {
      title: (
        <span style={{ fontWeight: 600, color: '#1f2937' }}>
          Start Date
        </span>
      ),
      dataIndex: "start_date",
      key: "start_date",
      render: (date: string | number) => formatDateToDDMMYYYY(date),
    },
    {
      title: (
        <span style={{ fontWeight: 600, color: '#1f2937' }}>
          End Date
        </span>
      ),
      dataIndex: "end_date",
      key: "end_date",
      render: (date: string | number) => formatDateToDDMMYYYY(date),
    },
    {
      title: (
        <span style={{ fontWeight: 600, color: '#1f2937' }}>
          Status
        </span>
      ),
      dataIndex: "status",
      key: "status",
      render: (text: string) => (
        <Tag color={text === "active" ? "success" : "error"}>
          {text}
        </Tag>
      )
    },
    {
      title: (
        <span style={{ fontWeight: 600, color: '#1f2937' }}>
          Actions
        </span>
      ),
      key: "actions",
      render: (_text: string, record: Batch) => (
        <Space size="middle">
          <Button
            type="text"
            icon={<EditOutlined />}
            onClick={() =>
              handleEditClick(
                "batch",
                record.batch_id,
                record.name,
                record.start_date,
                record.end_date
              )
            }
            style={{ color: "#8B5EAB" }}
          />
          <Popconfirm
            title="Are you sure to delete this batch?"
            onConfirm={() => handleDelete("batch", record.batch_id)}
            okText="Yes"
            cancelText="No"
          >
            <Button
              type="text"
              icon={<DeleteOutlined />}
              style={{ color: "#ff4d4f" }}
            />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <CollegeLayoutWrapper
      pageTitle={collegeId ? "College Students" : "All Students"}
    >

      <div style={{
        background: 'white',
        borderRadius: '16px',
        padding: '32px',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
      }}>


        {error && (
          <Alert
            message="Error"
            description={error}
            type="error"
            showIcon
            style={{
              marginBottom: 32,
              borderRadius: '12px',
              border: '1px solid #fecaca'
            }}
          />
        )}

        <Spin spinning={loading}>
          <Card
            style={{
              marginBottom: 32,
              borderRadius: '16px',

              border: '1px solid #e5e7eb',
              boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)'
            }}
            bodyStyle={{ padding: '24px' }}
          >
            <Row gutter={[16, 16]}>
              <Col span={12}>
                <Card
                  title={
                    <div style={{
                      padding: '12px 16px',
                      background: 'linear-gradient( #f59e0b, #fbbf24)',
                      borderTopLeftRadius: '8px',
                      borderTopRightRadius: '8px',
                      color: '#fff',
                      fontWeight: 600
                    }}>
                      <BookOutlined style={{ marginRight: 8 }} />
                      Courses
                    </div>
                  }
                  bodyStyle={{ paddingTop: 0 }}
                  style={{ marginBottom: 16, borderRadius: '8px', overflow: 'hidden' }}
                >
                  <Table
                    columns={courseColumns}
                    dataSource={courses}
                    rowKey="id"
                    pagination={{ pageSize: 5 }}
                    loading={loading}
                  />
                </Card>
              </Col>

              <Col span={12}>
                <Card
                  title={
                    <div style={{
                      padding: '12px 16px',
                      background: 'linear-gradient( #f59e0b, #fbbf24)',
                      borderTopLeftRadius: '8px',
                      borderTopRightRadius: '8px',
                      color: '#fff',
                      fontWeight: 600,
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}>
                      <span>
                        <FileTextOutlined style={{ marginRight: 8 }} />
                        Batches
                      </span>
                      <Button
                        type="primary"
                        onClick={() => setBatchModalVisible(true)}
                        style={{
                          background: 'white',
                          color: '#f59e0b',
                          border: 'none',
                          fontWeight: 600
                        }}
                      >
                        Add Batch +
                      </Button>
                    </div>
                  }
                  bodyStyle={{ paddingTop: 0 }}
                  style={{ marginBottom: 16, borderRadius: '8px', overflow: 'hidden' }}
                >
                  <Table
                    columns={batchColumns}
                    dataSource={batches}
                    rowKey="batch_id"
                    pagination={{ pageSize: 5 }}
                    loading={loading}
                  />
                </Card>
              </Col>
            </Row>

          </Card>

          <Card
            style={{
              width: "100%",
              textAlign: "center",
              borderRadius: "16px",
              borderColor: "#e5e7eb",
              boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
              padding: "24px",
              marginBottom: 32,
              background: 'white'
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
                  background: 'linear-gradient( #f59e0b, #fbbf24)',
                  border: 'none',
                  fontWeight: "bold",
                  width: "200px",
                  height: '48px',
                  fontSize: '16px',
                  borderRadius: '12px'
                }}
                onClick={() => navigate("/college/addtestcollege")}
              >
                Add Test +
              </Button>

              <Button
                type="primary"
                style={{
                  background: 'linear-gradient( #f59e0b, #fbbf24)',
                  border: 'none',
                  fontWeight: "bold",
                  width: "200px",
                  height: '48px',
                  fontSize: '16px',
                  borderRadius: '12px'
                }}
                onClick={() => navigate("/college/addquestionscollege")}
              >
                Add Questions +
              </Button>
            </div>
          </Card>
        </Spin>

        {/* Assign Student Modal */}
        <Modal
          title="Assign Student to Course"
          open={assignModalVisible}
          onCancel={() => setAssignModalVisible(false)}
          onOk={() => form.submit()}
          okText="Assign"
          okButtonProps={{
            style: {
              background: 'linear-gradient(135deg, #8b5eab 0%, #6b46c1 100%)',
              border: 'none',
              height: '40px',
              borderRadius: '8px'
            }
          }}
          cancelButtonProps={{
            style: {
              height: '40px',
              borderRadius: '8px'
            }
          }}
          bodyStyle={{
            padding: '24px'
          }}
        >
          <Form form={form} layout="vertical" onFinish={handleAssignStudent}>
            <Form.Item
              name="courseId"
              label="Course"
              rules={[{ required: true, message: "Please select course" }]}
            >
              <Select
                placeholder="Select course"
                onChange={handleCourseChange}
              >
                {courses.map((course) => (
                  <Option key={course.id} value={course.id}>
                    {course.name}
                  </Option>
                ))}
              </Select>
            </Form.Item>
            <Form.Item
              name="batchId"
              label="Batch"
              rules={[{ required: true, message: "Please select batch" }]}
            >
              <Select placeholder="Select batch">
                {filteredBatches.map((batch) => (
                  <Option key={batch.batch_id} value={batch.batch_id}>
                    {batch.name}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Form>
        </Modal>

        {/* Add Batch Modal */}
        <Modal
          title="Add Batch"
          open={batchModalVisible}
          onCancel={() => setBatchModalVisible(false)}
          onOk={handleAddBatch}
          okText="Add Batch"
          okButtonProps={{
            style: {
              background: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)',
              border: 'none',
              height: '40px',
              borderRadius: '8px'
            }
          }}
          cancelButtonProps={{
            style: {
              height: '40px',
              borderRadius: '8px'
            }
          }}
          bodyStyle={{
            padding: '24px'
          }}
        >
          <Form form={batchForm} layout="vertical">
            <Form.Item
              name="name"
              label="Batch Name"
              rules={[{ required: true, message: "Please enter batch name" }]}
            >
              <Input />
            </Form.Item>
            <Form.Item
              name="course_id"
              label="Course"
              rules={[{ required: true, message: "Please select course" }]}
            >
              <Select placeholder="Select course">
                {courses.map((course) => (
                  <Option key={course.id} value={course.id}>
                    {course.name}
                  </Option>
                ))}
              </Select>
            </Form.Item>
            <Form.Item
              name="start_date"
              label="Start Date"
              rules={[{ required: true, message: "Please select start date" }]}
            >
              <DatePicker format="DD-MM-YYYY" style={{ width: "100%" }} />
            </Form.Item>
            <Form.Item
              name="end_date"
              label="End Date"
              rules={[{ required: true, message: "Please select end date" }]}
            >
              <DatePicker format="DD-MM-YYYY" style={{ width: "100%" }} />
            </Form.Item>
          </Form>
        </Modal>

        {/* Edit Course/Batch Modal */}
        <Modal
          title={`Edit ${editType}`}
          open={isEditModalVisible}
          onCancel={() => setIsEditModalVisible(false)}
          onOk={handleEditSubmit}
          okText="Save Changes"
          cancelText="Cancel"
          width={600}
          okButtonProps={{
            style: {
              background: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)',
              border: 'none',
              height: '40px',
              borderRadius: '8px'
            }
          }}
          cancelButtonProps={{
            style: {
              height: '40px',
              borderRadius: '8px'
            }
          }}
          bodyStyle={{
            padding: '24px'
          }}
        >
          <Form layout="vertical">
            <Form.Item
              label={`${editType === "course" ? "Course" : "Batch"} Name`}
              rules={[{ required: true, message: "This field is required" }]}
            >
              <Input
                value={editData.name}
                onChange={(e) =>
                  setEditData({ ...editData, name: e.target.value })
                }
                placeholder={`Enter ${editType} name`}
              />
            </Form.Item>

            {editType === "batch" && (
              <>
                <Form.Item
                  label="Start Date"
                  rules={[
                    { required: true, message: "Start date is required" },
                    {
                      validator: (_, value) => {
                        if (!moment(value, "DD-MM-YYYY", true).isValid()) {
                          return Promise.reject(
                            new Error("Use DD-MM-YYYY format")
                          );
                        }
                        return Promise.resolve();
                      },
                    },
                  ]}
                >
                  <DatePicker
                    format="DD-MM-YYYY"
                    value={editData.startMoment}
                    onChange={(
                      date: moment.Moment | null,
                      dateString: string | string[]
                    ) => {
                      const formattedDate = Array.isArray(dateString)
                        ? dateString[0]
                        : dateString;
                      setEditData({
                        ...editData,
                        start_date: formattedDate,
                        startMoment: date,
                      });
                    }}
                    style={{ width: "100%" }}
                  />
                </Form.Item>
                <Form.Item
                  label="End Date"
                  rules={[
                    { required: true, message: "End date is required" },
                    {
                      validator: (_, value) => {
                        if (!moment(value, "DD-MM-YYYY", true).isValid()) {
                          return Promise.reject(
                            new Error("Use DD-MM-YYYY format")
                          );
                        }
                        return Promise.resolve();
                      },
                    },
                  ]}
                >
                  <DatePicker
                    format="DD-MM-YYYY"
                    value={editData.endMoment}
                    onChange={(
                      date: moment.Moment | null,
                      dateString: string | string[]
                    ) => {
                      const formattedDate = Array.isArray(dateString)
                        ? dateString[0]
                        : dateString;
                      setEditData({
                        ...editData,
                        end_date: formattedDate,
                        endMoment: date,
                      });
                    }}
                    style={{ width: "100%" }}
                  />
                </Form.Item>
              </>
            )}
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
    </CollegeLayoutWrapper>
  );
};

export default StudentDashboard;