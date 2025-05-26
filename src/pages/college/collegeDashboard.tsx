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
} from "antd";
import { EditOutlined, DeleteOutlined } from "@ant-design/icons";
import CollegeLayoutWrapper from "../../components/collegeLayout/collegeLayoutWrapper";
import { useParams } from "react-router-dom";
import moment from "moment";
import TestResultsSection from "./TestResultsSection";
import StudentComponent from "./StudentComponent";

const { Option } = Select;

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

  useEffect(() => {
    const fetchAllData = async () => {
      setLoading(true);
      try {
        await Promise.all([
          fetchCourses(),
          fetchBatches(),
          fetchStudents(collegeId ? parseInt(collegeId) : undefined),
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

  const fetchCourses = async () => {
    const token = localStorage.getItem("token");
    try {
      const response = await fetch(
        "http://13.233.33.133:3001/api/course/getCourses",
        {
          headers: { "Content-Type": "application/json", token: token || "" },
        }
      );
      const data = await response.json();
      setCourses(data.data || data);
    } catch (error) {
      console.error("Error fetching courses:", error);
      throw error;
    }
  };

  const fetchBatches = async () => {
    const token = localStorage.getItem("token");
    try {
      const response = await fetch(
        "http://13.233.33.133:3001/api/course/viewAllBatches",
        {
          headers: { "Content-Type": "application/json", token: token || "" },
        }
      );
      const result = await response.json();
      setBatches(result.data || []);
    } catch (error) {
      console.error("Error fetching batches:", error);
      throw error;
    }
  };

  const fetchStudents = async (collegeId?: number) => {
    const token = localStorage.getItem("token");
    try {
      const url = collegeId
        ? `http://13.233.33.133:3001/api/student/getAllStudents?collegeId=${collegeId}`
        : "http://13.233.33.133:3001/api/student/getAllStudents";

      const response = await fetch(url, {
        headers: { "Content-Type": "application/json", token: token || "" },
      });
      const result = await response.json();
      setStudents(result.data || []);
      return result.data || []; // Return the fetched students

    } catch (error) {
      console.error("Error fetching students:", error);
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
      const response = await fetch(
        "http://13.233.33.133:3001/api/student/assignStudentToCourse",
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
      await fetchStudents(collegeId ? parseInt(collegeId) : undefined);
    } catch (error) {
      console.error("Error assigning student:", error);
      message.error("Failed to assign student");
    }
  };

  const handleDeleteStudent = async (studentId: number) => {
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

      if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);

      const result = await response.json();
      if (result.ok) {
        message.success("Student deleted successfully");
        await fetchStudents(collegeId ? parseInt(collegeId) : undefined);
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

  const handleAddCourse = async () => {
    try {
      const values = await courseForm.validateFields();
      const token = localStorage.getItem("token");
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
            token: token || "",
          },
          body: JSON.stringify({ name: values.name }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to create course");
      }

      message.success("Course added successfully");
      courseForm.resetFields();
      setCourseModalVisible(false);
      await fetchCourses();
    } catch (error) {
      console.error("Error creating course:", error);
      message.error("Error creating course");
    }
  };

  const handleAddBatch = async () => {
    try {
      const values = await batchForm.validateFields();
      const token = localStorage.getItem("token");
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
            token: token || "",
          },
          body: JSON.stringify({
            name: values.name,
            course_id: values.course_id,
            start_date: values.start_date.format("DD-MM-YYYY"),
            end_date: values.end_date.format("DD-MM-YYYY"),
          }),
        }
      );

      if (!response.ok) throw new Error("Failed to create batch");

      message.success("Batch added successfully");
      batchForm.resetFields();
      setBatchModalVisible(false);
      await fetchBatches();
    } catch (error) {
      console.error("Error creating batch:", error);
      message.error("Error creating batch");
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

      if (!response.ok) throw new Error("Failed to delete");

      const result = await response.json();
      message.success(result.message || `${type} deleted successfully`);

      if (type === "course") {
        await fetchCourses();
      } else {
        await fetchBatches();
      }
    } catch (error) {
      console.error(`Error deleting ${type}:`, error);
      message.error(`Error deleting ${type}`);
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
      title: "Course Name",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
    },
    {
      title: "Actions",
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
      render: (date: string | number) => formatDateToDDMMYYYY(date),
    },
    {
      title: "End Date",
      dataIndex: "end_date",
      key: "end_date",
      render: (date: string | number) => formatDateToDDMMYYYY(date),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
    },
    {
      title: "Actions",
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
      {/* Courses and Batches Section - Side by Side */}
      <Row gutter={16}>
        <Col span={12}>
          <Card
            title={
              <Space>
                <span>Courses</span>
                
              </Space>
            }
            style={{ marginBottom: 16 }}
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
              <Space style={{ width: "100%", justifyContent: "space-between", display: "flex" }}>
                <span>Batches</span>
                <Button 
                  type="primary" 
                  onClick={() => setBatchModalVisible(true)}
                  style={{ background: "linear-gradient(45deg, #FFA500, #FF6347)", border: "none" }}
                >
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
              pagination={{ pageSize: 5 }}
              loading={loading}
            />
          </Card>
        </Col>
      </Row>

      {/* Students Section */}
      <Card title="Students">
        <StudentComponent
          students={students}
          loading={loading}
          collegeId={collegeId}
          onAssignStudent={(student) => {
            setCurrentStudent(student);
            setFilteredBatches([]);
            form.resetFields();
            setAssignModalVisible(true);
          }}
          onDeleteStudent={handleDeleteStudent}
          onRefresh={() => fetchStudents(collegeId ? parseInt(collegeId) : undefined)}
        />
      </Card>

      {/* Test Results Section */}
      <Card title="Test Results" style={{ marginTop: 16 }}>
        <TestResultsSection collegeId={collegeId} />
      </Card>


      {/* Add Batch Modal */}
      <Modal
        title="Add Batch"
        open={batchModalVisible}
        onCancel={() => setBatchModalVisible(false)}
        onOk={handleAddBatch}
        okText="Add Batch"
        okButtonProps={{ style: { background: "linear-gradient(45deg, #FFA500, #FF6347)", border: "none" } }}
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
        okButtonProps={{ style: { background: "linear-gradient(45deg, #FFA500, #FF6347)", border: "none" } }}
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
    </CollegeLayoutWrapper>
  );
};

export default StudentDashboard;