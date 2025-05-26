import React, { Key, useEffect, useState } from "react";
import {
  Table,
  Button,
  Card,
  Row,
  Col,
  Spin,
  Alert,
  Typography,
  Tag,
  Space,
  message,
  Tooltip,
} from "antd";
import StudentLayoutWrapper from "../../components/studentlayout/studentlayoutWrapper";
import { useNavigate } from "react-router-dom";
import Title from "antd/es/typography/Title";

const { Text } = Typography;

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
  name: string;
  id: number;
  course_id: number;
  course_name: string;
}

const StudentDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [studentData, setStudentData] = useState<StudentData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [startingTest, setStartingTest] = useState<boolean>(false);
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [courseTests, setCourseTests] = useState<Test[]>([]);
  const [loadingTests, setLoadingTests] = useState<boolean>(false);
  const [loadingCourses, setLoadingCourses] = useState<boolean>(false);
  const token = localStorage.getItem("token");

  useEffect(() => {
    fetchStudentData();
    fetchCourses();
  }, []);

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
      setLoadingCourses(true);
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
      console.log("Fetched courses:", data);
      setCourses(data);
    } catch (error) {
      console.error("Error fetching courses:", error);
    } finally {
      setLoadingCourses(false);
    }
  };

  const fetchTestsByCourse = async (courseId: number) => {
    setLoadingTests(true);
    try {
      // Filter tests from studentData based on course_id
      const filteredTests = studentData?.tests?.openTests?.filter(
        (test: Test) => test.course_id === courseId
      ) || [];
      setCourseTests(filteredTests);
    } catch (error) {
      console.error("Error filtering tests:", error);
      setCourseTests([]);
    } finally {
      setLoadingTests(false);
    }
  };

  const handleCourseClick = async (course: Course) => {
    setSelectedCourse(course);
    await fetchTestsByCourse(course.id);
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
      localStorage.setItem("testId", testId.toString());
      
      if (!response.ok) {
        throw new Error("Failed to start test");
      }
      const data = await response.json();
      if (!data.type) {
        throw new Error(data.message || "Failed to start test");
      }
      message.success("Test started successfully");
      navigate(`/student/TestScreen/${testId}`);
    } catch (err) {
      message.error(
        err instanceof Error ? err.message : "Failed to start test"
      );
    } finally {
      setStartingTest(false);
    }
  };

  const columns = [
    {
      title: "Name",
      key: "name",
      render: () => `${studentData?.firstname} ${studentData?.lastname}`,
    },
    { 
      title: "Email", 
      key: "email",
      render: () => studentData?.email || "N/A"
    },
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
    const currentTime = Date.now() / 1000;
    const startTime = parseInt(test.start_date);
    const endTime = parseInt(test.end_date);
    return currentTime >= startTime && currentTime <= endTime;
  }

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

        {/* Student Details */}
        <Card
          title="Student Details"
          bordered={false}
          headStyle={{ backgroundColor: "#FFD700", fontWeight: "bold" }}
          style={{ marginBottom: "20px" }}
        >
          <Table
            dataSource={dataSource}
            columns={columns}
            pagination={false}
            style={{ overflowX: "auto" }}
            rowKey="student_id"
          />
        </Card>

        {/* On Going Tests Section */}
        <Card
          title="On Going Tests"
          bordered={false}
          headStyle={{ backgroundColor: "#FFD700", fontWeight: "bold" }}
          style={{ marginBottom: "20px" }}
        >
          <div style={{ marginBottom: "20px" }}>
            <Title level={4} style={{ marginBottom: "16px" }}>All Tests</Title>
            {loadingCourses ? (
              <Spin size="small" />
            ) : (
              <Space wrap>
                {courses.map((course) => (
                  <Button
                    key={course.id}
                    type={selectedCourse?.id === course.id ? "primary" : "default"}
                    style={{
                      backgroundColor: selectedCourse?.id === course.id ? "#FFD700" : "#FFD700",
                      borderColor: "#FFD700",
                      color: "#000",
                      fontWeight: "bold",
                      borderRadius: "4px",
                      padding: "4px 16px",
                    }}
                    onClick={() => handleCourseClick(course)}
                  >
                    {course.name}
                  </Button>
                ))}
              </Space>
            )}
          </div>

          {/* Display Tests for Selected Course */}
          {selectedCourse && (
            <div style={{ marginTop: "20px" }}>
              {loadingTests ? (
                <Spin
                  size="large"
                  style={{
                    display: "flex",
                    justifyContent: "center",
                    margin: "40px 0",
                  }}
                />
              ) : courseTests.length > 0 ? (
                <div>
                  {courseTests.map((test: Test) => (
                    <div
                      key={test.test_id}
                      style={{
                        marginBottom: "20px",
                        padding: "16px",
                        backgroundColor: "#f9f9f9",
                        borderRadius: "8px",
                      }}
                    >
                      <div style={{ marginBottom: "16px" }}>
                        <Title level={4} style={{ margin: 0, marginBottom: "8px" }}>
                          {test.test_name}
                        </Title>
                        <Text>Test ID: {test.test_id}</Text>
                      </div>
                      
                      <Row gutter={[16, 8]} style={{ marginBottom: "16px" }}>
                        <Col span={8}>
                          <Text>Duration: {test.duration} minutes</Text>
                        </Col>
                        <Col span={8}>
                          <Text>Questions: {test.total_questions || "N/A"}</Text>
                        </Col>
                        <Col span={8}>
                          <Text>Course: {selectedCourse.name}</Text>
                        </Col>
                      </Row>
                      
                      <div style={{ marginBottom: "16px" }}>
                        <Text>
                          Available from: {formatDateTime(test.start_date)} to{" "}
                          {formatDateTime(test.end_date)}
                        </Text>
                      </div>

                      <div style={{ marginBottom: "16px" }}>
                        {!isTestActive(test) && (
                          <Tag color="red" style={{ marginRight: 8 }}>
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
                      </div>

                      <div style={{ textAlign: "right" }}>
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
                            style={{
                              backgroundColor: "#FFD700",
                              borderColor: "#FFD700",
                              color: "#000",
                              fontWeight: "bold",
                              fontSize: "14px",
                              height: "40px",
                              padding: "0 24px",
                            }}
                          >
                            Start Test
                          </Button>
                        </Tooltip>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <Alert
                  message="No Tests Available"
                  description={`There are currently no tests available for ${selectedCourse.name}.`}
                  type="info"
                  showIcon
                />
              )}
            </div>
          )}
        </Card>

        {/* Completed Tests Button */}
        <Card style={{ textAlign: "center" }}>
          <Button
            type="primary"
            size="large"
            onClick={() => navigate("/student/CompletedTest")}
            style={{
              backgroundColor: "#FFD700",
              borderColor: "#FFD700",
              color: "#000",
              fontWeight: "bold",
            }}
          >
            View Completed Tests
          </Button>
        </Card>
      </div>
    </StudentLayoutWrapper>
  );
};

export default StudentDashboard;