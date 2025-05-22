import { useEffect, useState } from "react";
import {
  Card,
  Checkbox,
  Button,
  Select,
  message,
  Modal,
  DatePicker,
  Form,
  Tag,
  Popconfirm,
  Space,
  Spin,
} from "antd";
import { Dayjs } from "dayjs";
import LayoutWrapper from "../../../components/adminlayout/layoutWrapper";
import { useNavigate } from "react-router-dom";
import { DeleteOutlined } from "@ant-design/icons";

const { Option } = Select;

interface OptionType {
  option_id: number;
  option_text: string;
  is_correct?: boolean;
}

interface Question {
  image: any;
  id: number;
  name: string;
  start_date: string;
  options: OptionType[];
  subject_id: number;
}

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
  college_id: number;
  college_name: string;
  start_date: string;
  end_date: string;
  status: string;
}

const AddTest = () => {
  const [, setAllQuestions] = useState<Question[]>([]);
  const [filteredQuestions, setFilteredQuestions] = useState<Question[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [batches, setBatches] = useState<Batch[]>([]);
  const [selectedQuestions, setSelectedQuestions] = useState<number[]>([]);
  const [testType, setTestType] = useState<string>("");
  const [testName, setTestName] = useState<string>("");
  const [selectedCourse, setSelectedCourse] = useState<number | null>(null);
  const [selectedBatches, setSelectedBatches] = useState<number[]>([]);
  const [startDateTime, setStartDateTime] = useState<Dayjs | null>(null);
  const [endDateTime, setEndDateTime] = useState<Dayjs | null>(null);

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchCourses();
    fetchBatches();
  }, []);

  const fetchQuestions = async (courseId: number | null) => {
    if (!courseId) {
      setFilteredQuestions([]);
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(
        `http://13.233.33.133:3001/api/question/getQuestionsByCourseId?id=${courseId}`,
        {
          headers: {
            "Content-Type": "application/json",
            token: localStorage.getItem("token") || "",
          },
        }
      );

      if (!response.ok) throw new Error("Failed to fetch questions");

      const data = await response.json();
      setAllQuestions(data.data);
      setFilteredQuestions(data.data);
    } catch (error) {
      console.error("Error fetching questions:", error);
      message.error("Failed to fetch questions");
    } finally {
      setLoading(false);
    }
  };

  const fetchCourses = async () => {
    try {
      const response = await fetch(
        "http://13.233.33.133:3001/api/course/getCourses",
        {
          headers: {
            "Content-Type": "application/json",
            token: localStorage.getItem("token") || "",
          },
        }
      );

      if (!response.ok) throw new Error("Failed to fetch courses");

      const data = await response.json();
      setCourses(data);
    } catch (error) {
      console.error("Error fetching courses:", error);
    }
  };

  const fetchBatches = async () => {
    try {
      const response = await fetch(
        "http://13.233.33.133:3001/api/course/viewAllBatches",
        {
          headers: {
            "Content-Type": "application/json",
            token: localStorage.getItem("token") || "",
          },
        }
      );

      if (!response.ok) throw new Error("Failed to fetch batches");

      const data = await response.json();
      setBatches(data.data);
    } catch (error) {
      console.error("Error fetching batches:", error);
    }
  };

  const handleCheckboxChange = (questionId: number, checked: boolean) => {
    setSelectedQuestions((prev) =>
      checked ? [...prev, questionId] : prev.filter((id) => id !== questionId)
    );
  };

  const handleBatchChange = (selectedBatchIds: number[]) => {
    setSelectedBatches(selectedBatchIds);
  };

  const handleCourseChange = (value: number) => {
    setSelectedCourse(value);
    fetchQuestions(value);
    setSelectedQuestions([]);
  };

  const handleSubmit = async () => {
    if (!testType) {
      message.error("Please select a test type");
      return;
    }
    if (!selectedCourse) {
      message.error("Please select a course");
      return;
    }
    if (selectedBatches.length === 0) {
      message.error("Please select at least one batch");
      return;
    }
    if (!startDateTime || !endDateTime) {
      message.error("Please select both start and end datetime");
      return;
    }
    if (selectedQuestions.length === 0) {
      message.error("Please select at least one question");
      return;
    }
    const formattedStartDateTime = startDateTime.format("DD-MM-YYYY HH:mm:ss");
    const formattedEndDateTime = endDateTime.format("DD-MM-YYYY HH:mm:ss");

    const duration = testType === "Regular Test" ? 30 : 60;

    const payload = {
      name: testName,
      duration,
      course_id: selectedCourse,
      questions: selectedQuestions,
      batch_ids: selectedBatches,
      start_date: formattedStartDateTime,
      end_date: formattedEndDateTime,
    };

    try {
      const response = await fetch(
        "http://13.233.33.133:3001/api/question/createTest",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            token: localStorage.getItem("token") || "",
          },
          body: JSON.stringify(payload),
        }
      );

      if (!response.ok) throw new Error("Failed to create test");

      setIsModalVisible(true);
    } catch (error) {
      console.error("Error creating test:", error);
      message.error("Failed to create test");
    }
  };

  const handleDeleteQuestion = async (questionId: number) => {
    try {
      setLoading(true);
      const response = await fetch(
        `http://13.233.33.133:3001/api/question/deleteQuestion?id=${questionId}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            token: localStorage.getItem("token") || "",
          },
        }
      );

      if (!response.ok) throw new Error("Failed to delete question");

      message.success("Question deleted successfully");
      await fetchQuestions(selectedCourse);
      setSelectedQuestions((prev) => prev.filter((id) => id !== questionId));
    } catch (error) {
      console.error("Error deleting question:", error);
      message.error("Failed to delete question");
    } finally {
      setLoading(false);
    }
  };

  const handleModalOk = () => {
    setIsModalVisible(false);
    navigate("/dashboard");
  };

  return (
    <LayoutWrapper pageTitle="BORIGAM / Add Test">
      <Card
        className="w-3/4 mx-auto p-6"
        style={{ backgroundColor: "#f7f7f7" }}
      >
        <h2 className="text-2xl font-bold mb-4">Add Test</h2>

        <Form layout="vertical">
          <Form.Item label="Enter Test Name:" required>
            <input
              type="text"
              className="ant-input"
              placeholder="Enter Test Name"
              style={{ width: "100%", marginBottom: "20px" }}
              value={testName}
              onChange={(e) => setTestName(e.target.value)}
            />
          </Form.Item>
          <Form.Item label="Select Test Timings:" required>
            <Select
              placeholder="Select Test Type"
              onChange={setTestType}
              value={testType}
              style={{ width: "100%", marginBottom: "20px" }}
            >
              <Option value="30">30 mins</Option>
              <Option value="45">45 mins</Option>
              <Option value="60">60 mins</Option>
              <Option value="120">120 mins</Option>
              <Option value="180">180 mins</Option>
            </Select>
          </Form.Item>

          <Form.Item label="Select Course:" required>
            <Select
              placeholder="Select Course"
              onChange={handleCourseChange}
              value={selectedCourse}
              style={{ width: "100%", marginBottom: "20px" }}
            >
              {Array.isArray(courses) &&
                courses.map((course) => (
                  <Option key={course.id} value={course.id}>
                    {course.name}
                  </Option>
                ))}
            </Select>
          </Form.Item>

          <Form.Item label="Select Batch(es):" required>
            <Select
              mode="multiple"
              placeholder="Select Batches"
              onChange={handleBatchChange}
              value={selectedBatches}
              style={{ width: "100%", marginBottom: "20px" }}
              tagRender={({ label, value, closable, onClose }) => {
                const batch = batches.find((b) => b.batch_id === value);
                return (
                  <Tag
                    closable={closable}
                    onClose={onClose}
                    style={{ marginRight: 3 }}
                  >
                    {batch ? `${batch.name} (${batch.course_name})` : label}
                  </Tag>
                );
              }}
            >
              {Array.isArray(batches) &&
                batches.map((batch) => (
                  <Option key={batch.batch_id} value={batch.batch_id}>
                    {batch.name} ({batch.course_name})
                  </Option>
                ))}
            </Select>
          </Form.Item>

          <Form.Item label="Start Date and Time:" required>
            <DatePicker
              showTime
              style={{ width: "100%", marginBottom: "20px" }}
              format="DD-MM-YYYY HH:mm:ss"
              onChange={(value) => setStartDateTime(value)}
            />
          </Form.Item>

          <Form.Item label="End Date and Time:" required>
            <DatePicker
              showTime
              style={{ width: "100%", marginBottom: "20px" }}
              format="DD-MM-YYYY HH:mm:ss"
              onChange={(value) => setEndDateTime(value)}
            />
          </Form.Item>

          <h3 className="text-lg font-semibold mb-2">Select Questions:</h3>
          {loading ? (
            <div style={{ textAlign: "center", padding: "20px" }}>
              <Spin size="large" />
            </div>
          ) : filteredQuestions.length === 0 ? (
            <p>No questions available for selected course</p>
          ) : (
            filteredQuestions.map((question) => (
              <Card
                key={question.id}
                className="mb-4"
                style={{
                  marginBottom: "10px",
                  borderColor: "gold",
                  borderWidth: "1px",
                }}
              >
                <Space align="start" style={{ width: "100%" }}>
                  <Checkbox
                    onChange={(e) =>
                      handleCheckboxChange(question.id, e.target.checked)
                    }
                    checked={selectedQuestions.includes(question.id)}
                  />
                  <div style={{ flex: 1 }}>
                    <div style={{ marginLeft: "20px", fontSize: "20px" }}>
                      {question.name}
                    </div>

                    {question.image && (
                      <img
                        src={question.image}
                        alt="Question"
                        style={{
                          width: "200px",
                          height: "200px",
                          objectFit: "cover",
                          marginLeft: "20px",
                          marginTop: "10px",
                          borderRadius: "10px",
                          border: "1px solid #ccc",
                        }}
                      />
                    )}

                    {Array.isArray(question.options) &&
                      question.options.map((option) => (
                        <p
                          style={{
                            marginLeft: "20px",
                            fontSize: "15px",
                            fontWeight: option.is_correct ? "bold" : "normal",
                            color: option.is_correct ? "#52c41a" : "inherit",
                            display: "flex",
                            alignItems: "center",
                          }}
                          key={option.option_id}
                        >
                          {option.option_text}
                          {option.is_correct && (
                            <Tag color="success" style={{ marginLeft: 8 }}>
                              Correct
                            </Tag>
                          )}
                        </p>
                      ))}
                  </div>
                  <div
                    style={{
                      minWidth: "220px",
                      maxWidth: "250px",
                      background: "#fffbe6",
                      borderLeft: "4px solid #faad14",
                      padding: "10px 16px",
                      borderRadius: "8px",
                      fontSize: "14px",
                      boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "flex-start",
                      marginLeft: "16px",
                    }}
                  >
                    <div>
                      <strong>Total Marks:</strong>{" "}
                      {"total_marks" in question ? (question as any).total_marks : "N/A"}
                    </div>
                    <div>
                      <strong>Negative Marks:</strong>{" "}
                      {"negative_marks" in question ? (question as any).negative_marks : "N/A"}
                    </div>
                  </div>
                  <Popconfirm
                    title="Are you sure you want to delete this question?"
                    onConfirm={() => handleDeleteQuestion(question.id)}
                    okText="Yes"
                    cancelText="No"
                  >
                    <Button
                      type="text"
                      danger
                      icon={<DeleteOutlined />}
                      loading={loading}
                    />
                  </Popconfirm>
                </Space>
              </Card>
            ))
          )}

          <Button
            style={{ marginTop: "20px" }}
            type="primary"
            onClick={handleSubmit}
            className="mt-4"
            loading={loading}
          >
            Add Questions to Test
          </Button>
        </Form>
      </Card>

      <Modal
        title="Success"
        open={isModalVisible}
        onOk={handleModalOk}
        onCancel={handleModalOk}
      >
        <p>Test created successfully!</p>
      </Modal>
    </LayoutWrapper>
  );
};

export default AddTest;
