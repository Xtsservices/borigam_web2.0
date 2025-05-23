import React, { Key, useEffect, useState } from "react";
import {
  Table,
  Button,
  Card,
  Row,
  Col,
  Spin,
  Alert,
  Modal,
  Typography,
  Tag,
  Space,
  List,
  message,
  Tooltip,
  Input,
  Select,
} from "antd";
import StudentLayoutWrapper from "../../components/studentlayout/studentlayoutWrapper";
import { useNavigate } from "react-router-dom";
import Title from "antd/es/typography/Title";

const { Text } = Typography;
const { Option } = Select;

interface StudentData {
  student_id: number;
  firstname: string;
  lastname: string;
  email: string;
  countrycode: string;
  mobileno: string;
  status: number;
  college_id: number | null;
  college_name: string | null;
  courses: Array<{
    course_id: number;
    course_name: string;
  }>;
  batches: Array<{
    batch_id: number;
    end_date: number;
    batch_name: string;
    start_date: number;
  }>;
  tests: {
    assignedTests: any[];
    completdTests: any[];
    openTests: any[];
  };
}

interface Test {
  test_id: number;
  test_name: string;
  duration: number;
  created_at: string;
  start_date: string;
  end_date: string;
  course_id: number | null;
  course_name: string | null;
  result_id: number | null;
  total_questions: number | null;
  attempted: number | null;
  correct: number | null;
  wrong: number | null;
  final_score: string | null;
  final_result: string | null;
}

interface Course {
  name: any;
  id: Key | null | undefined;
  course_id: number;
  course_name: string;
}

const StudentDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [studentData, setStudentData] = useState<StudentData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [showTestModal, setShowTestModal] = useState<boolean>(false);
  const [startingTest, setStartingTest] = useState<boolean>(false);
  const [courses, setCourses] = useState<Course[]>([]);
  const [searchText, setSearchText] = useState<string>("");
  const [selectedCourse, setSelectedCourse] = useState<number | null>(null);
  const token = localStorage.getItem("token");

  useEffect(() => {
    fetchStudentData();
    if (showTestModal) {
      fetchCourses();
    }
  }, [showTestModal]);

  const fetchStudentData = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(
        "http://13.233.33.133:3001/api/studentdashbaord/getStudentTestStatus",
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            token: token || "",
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch student data");
      }

      const data = await response.json();
      if (!data.type) {
        throw new Error(data.message || "Failed to fetch student data");
      }

      setStudentData(data.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

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
      if (!response.ok)
        throw new Error(`HTTP error! Status: ${response.status}`);
      const data = await response.json();
      console.log("Fetched courses:", data[0].name);
      setCourses(data);
    } catch (error) {
      console.error("Error fetching courses:", error);
    }
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleDateString();
  };

  const formatDateTime = (timestamp: string) => {
    return new Date(parseInt(timestamp) * 1000).toLocaleString();
  };

  const handleStartTest = async (testId: number, duration: number) => {
    try {
      setStartingTest(true);
      const response = await fetch(
        `http://13.233.33.133:3001/api/testsubmission/startTest`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            token: token || "",
          },
          body: JSON.stringify({ test_id: testId }),
        }
      );
      localStorage.setItem("testDuration", duration?.toString());
      navigate(`/student/TestScreen/${testId}`);
      if (!response.ok) {
        throw new Error("Failed to start test");
      }
      const data = await response.json();
      if (!data.type) {
        throw new Error(data.message || "Failed to start test");
      }
      message.success("Test started successfully");
      localStorage.setItem("testId", testId.toString());
    } catch (err) {
      message.error(
        err instanceof Error ? err.message : "Failed to start test"
      );
    } finally {
      setStartingTest(false);
      setShowTestModal(false);
    }
  };

  const columns = [
    {
      title: "Name",
      key: "name",
      render: () => `${studentData?.firstname} ${studentData?.lastname}`,
    },
    { title: "Email", dataIndex: "email", key: "email" },
    {
      title: "Phone",
      key: "phone",
      render: () => `${studentData?.countrycode} ${studentData?.mobileno}`,
    },
    {
      title: "Enrolled Courses",
      key: "courses",
      render: () =>
        studentData?.courses.map((c) => c.course_name).join(", ") || "N/A",
    },
    {
      title: "Batch",
      key: "batch",
      render: () =>
        studentData?.batches.map((b) => b.batch_name).join(", ") || "N/A",
    },
    {
      title: "Batch Start Date",
      key: "startDate",
      render: () =>
        studentData?.batches[0]
          ? formatDate(studentData.batches[0].start_date)
          : "N/A",
    },
    {
      title: "Batch End Date",
      key: "endDate",
      render: () =>
        studentData?.batches[0]
          ? formatDate(studentData.batches[0].end_date)
          : "N/A",
    },
  ];

  const dataSource = studentData ? [studentData] : [];

  function isTestActive(test: Test) {
    const currentTime = Date.now() / 1000; // Current time in seconds
    const startTime = parseInt(test.start_date);
    const endTime = parseInt(test.end_date);
    return currentTime >= startTime && currentTime <= endTime;
  }

  const filteredTests = studentData?.tests?.openTests?.filter((test) => {
    // Filter by search text
    const matchesSearch = test.test_name
      .toLowerCase()
      .includes(searchText.toLowerCase());

    // Filter by course
    const matchesCourse = selectedCourse
      ? test.course_id === selectedCourse
      : true;

    return matchesSearch && matchesCourse;
  });

  if (loading) {
    return (
      <StudentLayoutWrapper pageTitle={"BORIGAM / Student"}>
        <Spin
          size="large"
          style={{
            display: "flex",
            justifyContent: "center",
            marginTop: "40px",
          }}
        />
      </StudentLayoutWrapper>
    );
  }

  if (error) {
    return (
      <StudentLayoutWrapper pageTitle={"BORIGAM / Student"}>
        <Alert message="Error" description={error} type="error" showIcon />
      </StudentLayoutWrapper>
    );
  }

  return (
    <StudentLayoutWrapper pageTitle={"BORIGAM / Student"}>
      <div style={{ marginBottom: "20px" }}>
        {/* Welcome Card */}
        <Card
          style={{
            backgroundColor: "#FFD700",
            textAlign: "center",
            marginBottom: "20px",
          }}
        >
          <h2 style={{ fontWeight: "bold", fontSize: "20px" }}>
            WELCOME {studentData?.firstname} {studentData?.lastname}
          </h2>
        </Card>

        <Row gutter={16}>
          <Col span={16}>
            <Card
              title="Student Details"
              bordered={false}
              headStyle={{ backgroundColor: "#FFD700", fontWeight: "bold" }}
            >
              <Table
                dataSource={dataSource}
                columns={columns}
                pagination={false}
                style={{ overflowX: "auto" }}
                rowKey="student_id"
              />
            </Card>
          </Col>

          <Col span={8}>
            <Card
              title="Student Tests"
              bordered={false}
              headStyle={{ backgroundColor: "#FFD700", fontWeight: "bold" }}
            >
              <Row gutter={[16, 16]}>
                <Col span={12}>
                  <Button
                    type="primary"
                    block
                    style={{ marginBottom: "10px" }}
                    onClick={() => navigate("/student/CompletedTest")}
                  >
                    Completed Tests
                  </Button>
                </Col>
                <Col span={12}>
                  <Button
                    type="primary"
                    block
                    style={{ marginBottom: "10px" }}
                    onClick={() => setShowTestModal(true)}
                    disabled={!studentData?.tests?.openTests?.length}
                  >
                    New Test
                  </Button>
                </Col>
              </Row>
            </Card>
          </Col>
        </Row>

        {/* Test Selection Modal */}
        <Modal
          title="Available Tests"
          visible={showTestModal}
          onCancel={() => {
            setShowTestModal(false);
            setSearchText("");
            setSelectedCourse(null);
          }}
          footer={null}
          width={800}
        >
          <div style={{ marginBottom: 20 }}>
            <Row gutter={24}>
              <Col span={12}>
                <Input
                  placeholder="🔍 Search tests by name"
                  allowClear
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  style={{
                    width: "100%",
                    borderRadius: 8,
                    fontSize: 12,
                    height: 40,
                    background: "#fafafa",
                    border: "1px solid #d9d9d9",
                    paddingLeft: 14,
                    display: "flex",
                    alignItems: "center",
                  }}
                  prefix={
                    <span
                      style={{
                        color: "#bfbfbf",
                        marginRight: 8,
                        fontSize: 12,
                        display: "flex",
                        alignItems: "center",
                      }}
                    >
                      <i className="anticon anticon-search" />
                    </span>
                  }
                />
              </Col>
              <Col span={12}>
                <Select
                  style={{
                    width: "100%",
                    borderRadius: 8,
                    fontSize: 16,
                    height: 40,
                    background: "#fafafa",
                    border: "1px solid #d9d9d9",
                    display: "flex",
                    alignItems: "center",
                  }}
                  placeholder="Filter by course"
                  allowClear
                  value={selectedCourse}
                  onChange={(value) => setSelectedCourse(value)}
                  dropdownStyle={{ fontSize: 16 }}
                >
                  {courses.map(
                    (course) => (
                      console.log("Course:", course.name),
                      (
                        <Option key={course.id} value={course.id}>
                          {course.name}
                        </Option>
                      )
                    )
                  )}
                </Select>
              </Col>
            </Row>
          </div>

          {filteredTests?.length ? (
            <div>
              <Title level={4} style={{ marginBottom: 20 }}>
                You have {filteredTests.length} test(s) available
              </Title>
              <List
                itemLayout="horizontal"
                dataSource={filteredTests}
                renderItem={(test: Test) => (
                  <List.Item
                    style={{ padding: "16px 0" }}
                    actions={[
                      <Tooltip
                        title={
                          !isTestActive(test)
                            ? "This test is no longer available"
                            : ""
                        }
                      >
                        <Button
                          type="primary"
                          loading={startingTest}
                          onClick={() =>
                            handleStartTest(test.test_id, test.duration)
                          }
                          disabled={!isTestActive(test)}
                        >
                          Start Test
                        </Button>
                      </Tooltip>,
                    ]}
                  >
                    <List.Item.Meta
                      title={<Text strong>{test.test_name}</Text>}
                      description={
                        <Space direction="vertical" size={4}>
                          <Row gutter={16}>
                            <Col span={12}>
                              <Text>Test ID: {test.test_id}</Text>
                            </Col>
                            <Col span={12}>
                              <Text>
                                Course: {test.course_name || "General"}
                              </Text>
                            </Col>
                          </Row>
                          <Row gutter={16}>
                            <Col span={12}>
                              <Text>Duration: {test.duration} minutes</Text>
                            </Col>
                            <Col span={12}>
                              <Text>
                                Questions: {test.total_questions || "N/A"}
                              </Text>
                            </Col>
                          </Row>
                          <Row gutter={16}>
                            <Col span={24}>
                              <Text>
                                Available from:{" "}
                                {formatDateTime(test.start_date)} to{" "}
                                {formatDateTime(test.end_date)}
                              </Text>
                            </Col>
                          </Row>
                          {!isTestActive(test) && (
                            <Tag color="red" style={{ marginTop: 8 }}>
                              Expired
                            </Tag>
                          )}
                          {test.final_result && (
                            <Tag
                              color={
                                test.final_result === "Pass" ? "green" : "red"
                              }
                            >
                              Previous Result: {test.final_result}
                            </Tag>
                          )}
                        </Space>
                      }
                    />
                  </List.Item>
                )}
              />
            </div>
          ) : (
            <Alert
              message="No Tests Available"
              description="There are currently no tests matching your criteria."
              type="info"
              showIcon
            />
          )}
        </Modal>
      </div>
    </StudentLayoutWrapper>
  );
};

export default StudentDashboard;
