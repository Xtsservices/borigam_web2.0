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
} from "antd";
import CollegeLayoutWrapper from "../../components/collegeLayout/collegeLayoutWrapper";
import { useNavigate, useParams } from "react-router-dom";
const { Option } = Select;

interface Course {
  id: number;
  name: string;
  status: string;
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
  batches?: { batch_id: number; batch_name: string }[];
}

const StudentDashboard = () => {
  const navigate = useNavigate();
  const { collegeId } = useParams();
  const [courses, setCourses] = useState<Course[]>([]);
  const [batches, setBatches] = useState<Batch[]>([]);
  const [filteredBatches, setFilteredBatches] = useState<Batch[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [assignModalVisible, setAssignModalVisible] = useState(false);
  const [currentStudent, setCurrentStudent] = useState<Student | null>(null);
  const [courseModalVisible, setCourseModalVisible] = useState(false);
  const [batchModalVisible, setBatchModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [courseForm] = Form.useForm();
  const [batchForm] = Form.useForm();

  useEffect(() => {
    fetchCourses();
    fetchBatches();
    fetchStudents(collegeId ? parseInt(collegeId) : undefined);
  }, [collegeId]);

  const fetchCourses = async () => {
    const token = localStorage.getItem("token");
    try {
      const response = await fetch(
        "http://localhost:3001/api/course/getCourses",
        {
          headers: { "Content-Type": "application/json", token: token || "" },
        }
      );
      const data = await response.json();
      setCourses(data);
    } catch (error) {
      message.error("Failed to fetch courses");
    }
  };

  const fetchBatches = async () => {
    const token = localStorage.getItem("token");
    try {
      const response = await fetch(
        "http://localhost:3001/api/course/viewAllBatches",
        {
          headers: { "Content-Type": "application/json", token: token || "" },
        }
      );
      const result = await response.json();
      setBatches(result.data || []);
    } catch (error) {
      message.error("Failed to fetch batches");
    }
  };

  const fetchStudents = async (collegeId?: number) => {
    const token = localStorage.getItem("token");
    try {
      const url = collegeId
        ? `http://localhost:3001/api/student/getAllStudents?collegeId=${collegeId}`
        : "http://localhost:3001/api/student/getAllStudents";

      const response = await fetch(url, {
        headers: { "Content-Type": "application/json", token: token || "" },
      });
      const result = await response.json();
      setStudents(result.data || []);
    } catch (error) {
      message.error("Failed to fetch students");
    }
  };

  const handleCreateCourse = async () => {
    setCourseModalVisible(true);
  };

  const handleCreateBatch = async () => {
    setBatchModalVisible(true);
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
      const response = await fetch(
        "http://localhost:3001/api/student/assignStudentToCourse",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            token: localStorage.getItem("token") || "",
          },
          body: JSON.stringify({
            studentId: currentStudent?.student_id,
            courseId: values.courseId,
            batchId: values.batchId,
          }),
        }
      );

      if (!response.ok) throw new Error("Assignment failed");

      message.success("Student assigned successfully");
      setAssignModalVisible(false);
      fetchStudents(collegeId ? parseInt(collegeId) : undefined);
    } catch (error) {
      message.error("Failed to assign student");
    }
  };

  const batchColumns = [
    {
      title: "Batch Name",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "Course",
      dataIndex: "course_name",
      key: "course_name",
    },
    {
      title: "Start Date",
      dataIndex: "start_date",
      key: "start_date",
      render: (date: string) =>
        new Date(parseInt(date) * 1000).toLocaleDateString(),
    },
    {
      title: "End Date",
      dataIndex: "end_date",
      key: "end_date",
      render: (date: string) =>
        new Date(parseInt(date) * 1000).toLocaleDateString(),
    },
    {
      title: "Actions",
      key: "actions",
      render: (_: any) => <Button type="link">✓</Button>,
    },
  ];

  const studentColumns = [
    {
      title: "Name",
      dataIndex: "firstname",
      key: "name",
      render: (_: any, record: Student) =>
        `${record.firstname} ${record.lastname}`,
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
    },
    {
      title: "Mobile",
      key: "mobile",
      render: (_: any, record: Student) =>
        `${record.countrycode} ${record.mobileno}`,
    },
    {
      title: "Courses",
      key: "courses",
      render: (_: any, record: Student) =>
        record.courses && record.courses.length > 0
          ? record.courses.map((course: any) => course.course_name).join(", ")
          : "Not assigned",
    },
    {
      title: "Batches",
      key: "batches",
      render: (_: any, record: Student) =>
        record.batches && record.batches.length > 0
          ? record.batches.map((batch: any) => batch.batch_name).join(", ")
          : "Not assigned",
    },
    {
      title: "Assign",
      key: "assign",
      render: (_: any, record: Student) => {
        const hasCourseAssignment = record.courses && record.courses.length > 0;
        return !hasCourseAssignment ? (
          <Button
            type="link"
            onClick={() => {
              setCurrentStudent(record);
              setFilteredBatches([]);
              form.resetFields();
              setAssignModalVisible(true);
            }}
          >
            Assign
          </Button>
        ) : null;
      },
    },
  ];

  return (
    <CollegeLayoutWrapper
      pageTitle={collegeId ? "College Students" : "All Students"}
    >
      {/* Courses Section */}
      <Card
        title={
          <Space>
            <span>Courses</span>
            <Button type="primary" onClick={handleCreateCourse}>
              Add Course +
            </Button>
          </Space>
        }
        style={{ marginBottom: 16 }}
      >
        {courses.map((course) => (
          <div key={course.id} style={{ marginBottom: 8 }}>
            {course.name}
          </div>
        ))}
      </Card>

      {/* Batches Section */}
      <Card
        title={
          <Space>
            <span>Batches</span>
            <Button type="primary" onClick={handleCreateBatch}>
              Add Batch +
            </Button>
          </Space>
        }
        style={{ marginBottom: 16 }}
      >
        <Table
          columns={batchColumns}
          dataSource={batches}
          rowKey="batch_id"
          pagination={false}
        />
      </Card>

      {/* Students Section */}
      <Card
        title="Students"
        extra={
          <Button
            type="primary"
            onClick={() => navigate("/dashboard/create-student")}
          >
            Create Student
          </Button>
        }
      >
        <Table
          columns={studentColumns}
          dataSource={students}
          rowKey="student_id"
          pagination={{ pageSize: 10 }}
        />
      </Card>

      {/* Test Results Section */}
      <Card title="Test Results" style={{ marginTop: 16 }}>
        <Button
          type="primary"
          onClick={() => navigate("/dashboard/test-results")}
        >
          View Test Results
        </Button>
      </Card>

      {/* Assign Student Modal */}
      <Modal
        title={`Assign Student: ${currentStudent?.firstname} ${currentStudent?.lastname}`}
        open={assignModalVisible}
        onCancel={() => setAssignModalVisible(false)}
        onOk={() => form.submit()}
        okText="Assign"
      >
        <Form form={form} onFinish={handleAssignStudent} layout="vertical">
          <Form.Item
            name="courseId"
            label="Assign Course"
            rules={[{ required: true, message: "Please select a course" }]}
          >
            <Select placeholder="Select course" onChange={handleCourseChange}>
              {courses.map((course) => (
                <Option key={course.id} value={course.id}>
                  {course.name}
                </Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item
            name="batchId"
            label="Assign Batch"
            rules={[{ required: true, message: "Please select a batch" }]}
          >
            <Select
              placeholder="Select batch"
              disabled={!form.getFieldValue("courseId")}
            >
              {filteredBatches.map((batch) => (
                <Option key={batch.batch_id} value={batch.batch_id}>
                  {batch.name} ({batch.course_name})
                </Option>
              ))}
            </Select>
          </Form.Item>
        </Form>
      </Modal>

      {/* Add Course Modal */}
      <Modal
        title="Add Course"
        open={courseModalVisible}
        onCancel={() => setCourseModalVisible(false)}
        footer={null}
      >
        <Form form={courseForm} layout="vertical">
          <Form.Item
            name="name"
            label="Course Name"
            rules={[{ required: true, message: "Please enter course name" }]}
          >
            <Input />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit">
              Add Course
            </Button>
          </Form.Item>
        </Form>
      </Modal>

      {/* Add Batch Modal */}
      <Modal
        title="Add Batch"
        open={batchModalVisible}
        onCancel={() => setBatchModalVisible(false)}
        footer={null}
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
            name="courseId"
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
          <Form.Item>
            <Button type="primary" htmlType="submit">
              Add Batch
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </CollegeLayoutWrapper>
  );
};

export default StudentDashboard;
