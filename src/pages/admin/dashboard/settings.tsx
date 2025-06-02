import { useEffect, useState } from "react";
import {
  Card,
  Button,
  // Typography,
  // List,
  // Tabs,
  Modal,
  Input,
  Form,
  message,
  Popconfirm,
  Space,
  DatePicker,
} from "antd";
import { Table } from "antd";
import { EditOutlined, DeleteOutlined } from "@ant-design/icons";
import LayoutWrapper from "../../../components/adminlayout/layoutWrapper";
import moment from "moment";
import { useNavigate } from "react-router-dom";
// const { TabPane } = Tabs;

interface Course {
  id: number;
  name: string;
}

interface Option {
  id: number;
  is_correct: boolean;
  option_text: string;
}

interface Question {
  id: number;
  name: string;
  options: Option[];
}

interface Test {
  test_id: number;
  test_name: string;
  start_date: string;
  questions: Question[];
}

interface Batch {
  batch_id: number;
  name: string;
  course_name: string;
  start_date: string;
  end_date: string;
}

interface EditData {
  id: number;
  name: string;
  start_date?: string;
  end_date?: string;
  startMoment?: moment.Moment | null;
  endMoment?: moment.Moment | null;
}

const Settings: React.FC = () => {
  const navigate = useNavigate();
  const [courses, setCourses] = useState<Course[]>([]);
  const [, setTests] = useState<Test[]>([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [courseName, setCourseName] = useState("");

  useEffect(() => {
    fetchCourses();
    fetchTests();
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
            token,
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

  const [batches, setBatches] = useState<Batch[]>([]);
  const [isBatchModalVisible, setIsBatchModalVisible] = useState(false);
  const [newBatch, setNewBatch] = useState({
    name: "",
    course_id: undefined as number | undefined,
    start_date: "",
    end_date: "",
  });
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [editType, setEditType] = useState<"course" | "batch" | null>(null);
  const [editData, setEditData] = useState<EditData>({
    id: 0,
    name: "",
    startMoment: null,
    endMoment: null,
  });

  const courseColumns = [
    {
      title: "Course Name",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "Actions",
      key: "actions",
      render: (_text: string, record: Course) => (
        <Space size="middle">
          <Button
            type="text"
            icon={<EditOutlined />}
            onClick={() => handleEditClick("course", record.id, record.name)}
            style={{ color: "#8B5EAB" }}
          />
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

  const formatDateToDDMMYYYY = (dateValue: string | number) => {
    if (!dateValue) return "-";

    try {
      // First check if it's a Unix timestamp (number in seconds)
      if (typeof dateValue === "number" || /^\d+$/.test(dateValue.toString())) {
        // Convert Unix timestamp (seconds) to milliseconds
        const date = moment.unix(Number(dateValue));
        return date.format("DD-MM-YYYY");
      }

      // Try parsing as ISO string or other formats
      const date = moment(
        dateValue,
        ["DD-MM-YYYY", "YYYY-MM-DD", moment.ISO_8601],
        true
      );

      if (date.isValid()) {
        return date.format("DD-MM-YYYY");
      }

      // If all parsing fails, return original value
      return dateValue.toString();
    } catch (error) {
      console.error("Error formatting date:", error);
      return dateValue.toString();
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
      render: (date: string | number) => formatDateToDDMMYYYY(date),
    },
    {
      title: "End Date",
      dataIndex: "end_date",
      key: "end_date",
      render: (date: string | number) => formatDateToDDMMYYYY(date),
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
    {
      title: "Actions",
      key: "actions",
      render: (record: Batch) => (
        <Button
          type="link"
          onClick={() => navigate(`/dashboard/batch-students/batchIds=${record.batch_id}`)}
        >
          View Students
        </Button>
      ),
    },
  ];
  const fetchTests = async () => {
    try {
      const response = await fetch(
        "http://localhost:3001/api/question/viewAllTests",
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            token: localStorage.getItem("token") || "",
          },
        }
      );
      if (!response.ok)
        throw new Error(`HTTP error! Status: ${response.status}`);
      const { data }: { data: Test[] } = await response.json();
      setTests(data);
    } catch (error) {
      console.error("Error fetching tests:", error);
    }
  };

  const fetchBatches = async () => {
    try {
      const response = await fetch(
        "http://localhost:3001/api/course/viewAllBatches",
        {
          headers: {
            "Content-Type": "application/json",
            token: localStorage.getItem("token") || "",
          },
        }
      );
      const { data } = await response.json();
      setBatches(data);
    } catch (error) {
      console.error("Error fetching batches:", error);
    }
  };

  const handleAddCourse = async () => {
    const token = localStorage.getItem("token");
    if (!courseName.trim()) {
      message.warning("Course name cannot be empty");
      return;
    }

    try {
      const response = await fetch(
        "http://localhost:3001/api/course/createCourse",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            token: token || "",
          },
          body: JSON.stringify({ name: courseName }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to create course");
      }

      message.success("Course added successfully");
      setCourseName("");
      setIsModalVisible(false);
      fetchCourses();
    } catch (error) {
      console.error("Error creating course:", error);
      message.error("Error creating course");
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
      // Parse dates strictly in DD-MM-YYYY format
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
        // Validate date format before submitting
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

        url = `http://localhost:3001/api/course/updateBatch`;
        body = {
          ...body,
          start_date: editData.start_date,
          end_date: editData.end_date,
        };
      } else {
        url = `http://localhost:3001/api/course/updateCourse`;
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

      // Refresh data
      editType === "course" ? fetchCourses() : fetchBatches();
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
          ? `http://localhost:3001/api/course/deleteCourse?id=${id}`
          : `http://localhost:3001/api/course/deleteBatch?id=${id}`;

      const response = await fetch(url, {
        method: "GET", // Changed from DELETE to GET
        headers: {
          "Content-Type": "application/json",
          token,
        },
      });

      if (!response.ok) throw new Error("Failed to delete");

      const result = await response.json();
      message.success(result.message || `${type} deleted successfully`);

      // Refresh data
      if (type === "course") {
        fetchCourses();
      } else {
        fetchBatches();
      }
    } catch (error) {
      console.error(`Error deleting ${type}:`, error);
      message.error(`Error deleting ${type}`);
    }
  };

  const handleAddBatch = async () => {
    const token = localStorage.getItem("token");
    if (
      !newBatch.name ||
      !newBatch.course_id ||
      !newBatch.start_date ||
      !newBatch.end_date
    ) {
      message.warning("Please fill all fields");
      return;
    }

    try {
      const response = await fetch(
        "http://localhost:3001/api/course/createBatch",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            token: token || "",
          },
          body: JSON.stringify(newBatch),
        }
      );

      if (!response.ok) throw new Error("Failed to create batch");

      message.success("Batch added successfully");
      setNewBatch({
        name: "",
        course_id: undefined,
        start_date: "",
        end_date: "",
      });
      setIsBatchModalVisible(false);
      fetchBatches();
    } catch (error) {
      console.error("Error creating batch:", error);
      message.error("Error creating batch");
    }
  };

  return (
    <LayoutWrapper pageTitle="BORIGAM / Settings">
      <div
        className="settings"
        style={{
          display: "flex",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: "20px",
        }}
      >
        <Card
          style={{
            width: "49%",
            borderRadius: "10px",
            borderColor: "#8B5EAB",
            boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
          }}
        >
          <Button
            type="primary"
            onClick={() => setIsModalVisible(true)}
            style={{
              background: "#8B5EAB",
              borderColor: "#8B5EAB",
              width: "100%",
              fontWeight: "bold",
              marginBottom: "20px",
            }}
          >
            Add Course +
          </Button>

          <Table
            dataSource={courses}
            columns={courseColumns}
            rowKey="id"
            pagination={false}
          />
        </Card>
        <Card
          style={{
            width: "49%",
            borderRadius: "10px",
            borderColor: "#8B5EAB",
            boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
          }}
        >
          <Button
            type="primary"
            onClick={() => setIsBatchModalVisible(true)}
            style={{
              background: "#8B5EAB",
              borderColor: "#8B5EAB",
              width: "100%",
              fontWeight: "bold",
              marginBottom: "20px",
            }}
          >
            Add Batch +
          </Button>

          <Table
            dataSource={batches}
            columns={batchColumns}
            rowKey="batch_id"
            pagination={false}
          />
        </Card>

        {/* <Card
          style={{
            width: "49%",
            borderRadius: "10px",
            borderColor: "#8B5EAB",
            boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
          }}
        >
          <Button
            type="primary"
            style={{
              background: "#8B5EAB",
              borderColor: "#8B5EAB",
              width: "100%",
              fontWeight: "bold",
              marginBottom: "20px",
            }}
          >
            Question & Answers
          </Button>
          <Tabs defaultActiveKey="1">
            <TabPane tab="All Tests" key="1">
              {renderTests(tests)}
            </TabPane>
            <TabPane tab="Mock Test" key="2">
              {renderTests(
                tests.filter((test) => test.test_name === "Mock Test")
              )}
            </TabPane>
            <TabPane tab="Regular Test" key="3">
              {renderTests(
                tests.filter((test) => test.test_name === "Regular Test")
              )}
            </TabPane>
          </Tabs>
        </Card> */}
      </div>

      {/* Course Modal */}
      <Modal
        title="Add New Course"
        visible={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        onOk={handleAddCourse}
        okText="Add Course"
      >
        <Form layout="vertical">
          <Form.Item label="Course Name">
            <Input
              value={courseName}
              onChange={(e) => setCourseName(e.target.value)}
              placeholder="Enter course name"
            />
          </Form.Item>
        </Form>
      </Modal>

      {/* Batch Modal */}
      <Modal
        title={`Edit ${editType}`}
        visible={isEditModalVisible}
        onCancel={() => setIsEditModalVisible(false)}
        onOk={handleEditSubmit}
        okText="Save Changes"
        cancelText="Cancel"
        width={600} // Set a wider width for better date picker display
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
                    // Handle both string and string[] cases
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
      <Modal
        title="Add New Batch"
        visible={isBatchModalVisible}
        onCancel={() => setIsBatchModalVisible(false)}
        onOk={handleAddBatch}
        okText="Add Batch"
      >
        <Form layout="vertical">
          <Form.Item label="Batch Name">
            <Input
              value={newBatch.name}
              onChange={(e) =>
                setNewBatch({ ...newBatch, name: e.target.value })
              }
              placeholder="Enter batch name"
            />
          </Form.Item>
          <Form.Item label="Course">
            <select
              className="ant-input"
              value={newBatch.course_id}
              onChange={(e) =>
                setNewBatch({ ...newBatch, course_id: Number(e.target.value) })
              }
              style={{ backgroundColor: "white", color: "black" }}
            >
              <option value="">Select Course</option>
              {courses.map((course) => (
                <option key={course.id} value={course.id}>
                  {course.name}
                </option>
              ))}
            </select>
          </Form.Item>
          <Form.Item label="Start Date">
            <Input
              type="date"
              onChange={(e) =>
                setNewBatch({
                  ...newBatch,
                  start_date: new Date(e.target.value)
                    .toLocaleDateString("en-GB")
                    .split("/")
                    .join("-"),
                })
              }
            />
          </Form.Item>
          <Form.Item label="End Date">
            <Input
              type="date"
              onChange={(e) =>
                setNewBatch({
                  ...newBatch,
                  end_date: new Date(e.target.value)
                    .toLocaleDateString("en-GB")
                    .split("/")
                    .join("-"),
                })
              }
            />
          </Form.Item>
        </Form>
      </Modal>
    </LayoutWrapper>
  );
};

export default Settings;
