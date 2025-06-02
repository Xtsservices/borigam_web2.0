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
import CollegeSidebar from "../../components/collegeLayout/collegeSidebar";

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

interface Announcement {
  id: number;
  start_date: string;
  end_date: string;
  text: string;
  created_date: string | null;
  updated_date: string | null;
  status: string;
  created_by_id: number;
  updated_by_id: number;
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
  const [selectedCourse, setSelectedCourse] = useState<string | null>(null);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [announcementsLoading, setAnnouncementsLoading] = useState<boolean>(false);
  const token = localStorage.getItem("token");

  // Dynamic course tags from API
  const getDynamicCourseTags = () => {
    const allTestsTag = { key: "All Tests", label: "All Tests", color: "#f59e0b" };
    const dynamicTags = courses.map((course) => ({
      key: course.name || course.course_name,
      label: course.name || course.course_name,
      color: "#f59e0b"
    }));
    return [allTestsTag, ...dynamicTags];
  };

  useEffect(() => {
    fetchStudentData();
    fetchCourses();
    fetchAnnouncements();
  }, []);

  const fetchStudentData = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(
        "http://localhost:3001/api/studentdashbaord/getStudentTestStatus",
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
      const data = await response.json();
      console.log("Fetched courses:", data[0]?.name);
      setCourses(data);
    } catch (error) {
      console.error("Error fetching courses:", error);
    }
  };

  const fetchAnnouncements = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      console.error("No token found, authentication required");
      return;
    }
    
    try {
      setAnnouncementsLoading(true);
      const response = await fetch(
        "http://localhost:3001/api/announcements/getAnnouncements",
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            token: token,
          },
        }
      );
      
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.type && data.data) {
        // Filter active announcements that are currently valid
        const currentTime = Date.now() / 1000;
        const activeAnnouncements = data.data.filter((announcement: Announcement) => {
          const startTime = parseInt(announcement.start_date);
          const endTime = parseInt(announcement.end_date);
          return (
            announcement.status === "active" &&
            currentTime >= startTime &&
            currentTime <= endTime
          );
        });
        
        setAnnouncements(activeAnnouncements);
      } else {
        console.error("Invalid announcements data structure:", data);
      }
    } catch (error) {
      console.error("Error fetching announcements:", error);
    } finally {
      setAnnouncementsLoading(false);
    }
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleDateString();
  };

  const formatDateTime = (timestamp: string) => {
    return new Date(parseInt(timestamp) * 1000).toLocaleString();
  };

  const formatAnnouncementDate = (timestamp: string | null) => {
    if (!timestamp) return "N/A";
    return new Date(parseInt(timestamp) * 1000).toLocaleDateString();
  };

  const handleStartTest = async (testId: number, duration: number) => {
    try {
      setStartingTest(true);
      const response = await fetch(
        `http://localhost:3001/api/testsubmission/startTest`,
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
    const currentTime = Date.now() / 1000;
    const startTime = parseInt(test.start_date);
    const endTime = parseInt(test.end_date);
    return currentTime >= startTime && currentTime <= endTime;
  }

  const filteredTests = studentData?.tests?.openTests?.filter((test) => {
    const matchesSearch = test.test_name
      .toLowerCase()
      .includes(searchText.toLowerCase());

    const matchesCourse = selectedCourse && selectedCourse !== "All Tests"
      ? test.course_name?.toLowerCase().includes(selectedCourse.toLowerCase())
      : true;

    return matchesSearch && matchesCourse;
  });

  if (loading) {
    return (
      <StudentLayoutWrapper pageTitle={"BORIGAM / Student"}>
        <div className="loading-container">
          <Spin
            size="large"
            style={{
              display: "flex",
              justifyContent: "center",
              marginTop: "40px",
            }}
          />
        </div>
      </StudentLayoutWrapper>
    );
  }

  if (error) {
    return (
      <StudentLayoutWrapper pageTitle={"BORIGAM / Student"}>
        <div className="error-container">
          <Alert message="Error" description={error} type="error" showIcon />
        </div>
      </StudentLayoutWrapper>
    );
  }

  return (
    <>
    
    <StudentLayoutWrapper pageTitle={"BORIGAM / Student"}>
      
      
      {/* Main Dashboard Container */}
      <div className="student-dashboard-container">
        {/* Welcome Card */}
        <Card
          className="welcome-card"
          style={{
            background: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)',
            textAlign: "center",
            marginBottom: "24px",
            
            border: 'none',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
          }}
        >
          <h2 className="welcome-text">
            WELCOME {studentData?.firstname} {studentData?.lastname}
          </h2>
        </Card>

        <Row gutter={[24, 24]}>
          <Col xs={24} md={16}>
            <Card
              title="Student Details"
              bordered={false}
              className="student-details-card"
              headStyle={{ 
                background: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)',
                fontWeight: "bold",
                color: '#fff',
                border: 'none'
              }}
              bodyStyle={{ padding: '16px' }}
            >
              <Table
                dataSource={dataSource}
                columns={columns}
                pagination={false}
                style={{ overflowX: "auto" }}
                rowKey="student_id"
                bordered
                className="student-details-table"
              />
            </Card>
          </Col>

          <Col xs={24} md={8}>
            <Card
              title="Announcements"
              bordered={false}
              className="announcements-card"
              headStyle={{ 
                background: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)',
                fontWeight: "bold",
                color: '#fff',
                border: 'none'
              }}
              bodyStyle={{ minHeight: '300px', maxHeight: '400px', overflowY: 'auto' }}
            >
              <div className="announcements-content">
                {announcementsLoading ? (
                  <div style={{ textAlign: 'center', padding: '20px' }}>
                    <Spin size="default" />
                    <div style={{ marginTop: '10px' }}>
                      <Text type="secondary">Loading announcements...</Text>
                    </div>
                  </div>
                ) : announcements.length > 0 ? (
                  <List
                    dataSource={announcements}
                    renderItem={(announcement) => (
                      <List.Item className="announcement-item">
                        <div className="announcement-content">
                          <div className="announcement-text">
                            {announcement.text}
                          </div>
                          <div className="announcement-meta">
                            <Text type="secondary" className="announcement-date">
                              Valid until: {formatAnnouncementDate(announcement.end_date)}
                            </Text>
                          </div>
                        </div>
                      </List.Item>
                    )}
                  />
                ) : (
                  <Text type="secondary">No announcements at this time.</Text>
                )}
              </div>
            </Card>
          </Col>
        </Row>

        {/* On Going Tests Section */}
        <Row style={{ marginTop: "24px" }}>
          <Col span={24}>
            <Card
              bordered={false}
              className="ongoing-tests-card"
              bodyStyle={{ padding: '24px' }}
            >
              {/* On Going Tests Header */}
              <div className="ongoing-tests-header">
                On Going Tests
              </div>

              {/* Dynamic Course Filter Tags */}
              <div className="course-filter-tags">
                <Space wrap>
                  {getDynamicCourseTags().map((courseTag) => (
                    <Tag
                      key={courseTag.key}
                      className={`course-tag ${selectedCourse === courseTag.key ? 'active' : ''}`}
                      onClick={() => {
                        setSelectedCourse(selectedCourse === courseTag.key ? null : courseTag.key);
                      }}
                    >
                      {courseTag.label}
                    </Tag>
                  ))}
                </Space>
              </div>

              {/* Available Tests Display */}
              {filteredTests && filteredTests.length > 0 ? (
                <div className="test-list-container">
                  {filteredTests.map((test: Test) => (
                    <Card
                      key={test.test_id}
                      size="small"
                      className="test-card"
                      bodyStyle={{ padding: "16px" }}
                    >
                      <Row justify="space-between" align="middle">
                        <Col xs={24} md={18}>
                          <div className="test-info">
                            <Text strong className="test-name">Mock Test</Text>
                            <div className="test-details">
                              <div className="test-detail-item">
                                <span className="detail-label">Test ID:</span>
                                <span className="detail-value">{test.test_id}</span>
                              </div>
                              <div className="test-detail-item">
                                <span className="detail-label">Duration:</span>
                                <span className="detail-value">{test.duration} minutes</span>
                              </div>
                              <div className="test-detail-item">
                                <span className="detail-label">Course:</span>
                                <span className="detail-value">{test.course_name || "N/A"}</span>
                              </div>
                              <div className="test-detail-item">
                                <span className="detail-label">Questions:</span>
                                <span className="detail-value">{test.total_questions || "N/A"}</span>
                              </div>
                              <div className="test-detail-item">
                                <span className="detail-label">Available:</span>
                                <span className="detail-value">
                                  {formatDateTime(test.start_date)} to {formatDateTime(test.end_date)}
                                </span>
                              </div>
                            </div>
                          </div>
                        </Col>
                        <Col xs={24} md={6} className="test-action-col">
                          <Tooltip
                            title={
                              !isTestActive(test)
                                ? "This test is no longer available"
                                : ""
                            }
                          >
                            <Button
                              type="primary"
                              size="large"
                              loading={startingTest}
                              onClick={() =>
                                handleStartTest(test.test_id, test.duration)
                              }
                              disabled={!isTestActive(test)}
                              className="start-test-button"
                            >
                              Start Test
                            </Button>
                          </Tooltip>
                          {!isTestActive(test) && (
                            <div className="expired-tag-container">
                              <Tag color="red" className="expired-tag">
                                Expired
                              </Tag>
                            </div>
                          )}
                        </Col>
                      </Row>
                    </Card>
                  ))}
                </div>
              ) : (
                <Alert
                  message="No Tests Available"
                  description="There are currently no tests available."
                  type="info"
                  showIcon
                  className="no-tests-alert"
                />
              )}
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
          }}
          footer={null}
          width={800}
          className="test-selection-modal"
        >
          {/* Search Input */}
          <div className="modal-search-container">
            <Input
              placeholder="🔍 Search tests by name"
              allowClear
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              className="modal-search-input"
            />
          </div>

          {studentData?.tests?.openTests?.length ? (
            <div className="modal-test-list-container">
              <Title level={4} className="modal-test-list-title">
                You have {studentData.tests.openTests.length} test(s) available
              </Title>
              <List
                itemLayout="horizontal"
                dataSource={studentData.tests.openTests.filter((test) =>
                  test.test_name.toLowerCase().includes(searchText.toLowerCase())
                )}
                renderItem={(test: Test) => (
                  <List.Item
                    className="modal-test-item"
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
                          className="modal-start-test-button"
                        >
                          Start Test
                        </Button>
                      </Tooltip>,
                    ]}
                  >
                    <List.Item.Meta
                      title={<Text strong className="modal-test-name">{test.test_name}</Text>}
                      description={
                        <Space direction="vertical" size={4} className="modal-test-details">
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
                            <Tag color="red" className="modal-expired-tag">
                              Expired
                            </Tag>
                          )}
                          {test.final_result && (
                            <Tag
                              color={
                                test.final_result === "Pass" ? "green" : "red"
                              }
                              className="modal-result-tag"
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
              description="There are currently no tests available."
              type="info"
              showIcon
              className="modal-no-tests-alert"
            />
          )}
        </Modal>
      </div>

      {/* CSS Styles */}
      <style>{`
        .student-dashboard-container {
          padding: 0 16px;
        }
        
        .welcome-card {
          border-radius: 8px;
        }
        
        .welcome-text {
          font-weight: bold;
          font-size: 20px;
          color: #fff;
          margin: 0;
        }
        
        .student-details-card,
        .announcements-card,
        .ongoing-tests-card {
          border-radius: 8px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }
        
        .announcements-content {
          padding: 0;
        }
        
        .announcement-item {
          padding: 12px 0;
          border-bottom: 1px solid #f0f0f0;
        }
        
        .announcement-item:last-child {
          border-bottom: none;
        }
        
        .announcement-content {
          width: 100%;
        }
        
        .announcement-text {
          font-size: 14px;
          color: #333;
          margin-bottom: 8px;
          line-height: 1.5;
        }
        
        .announcement-meta {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        
        .announcement-date {
          font-size: 12px;
        }
        
        .ongoing-tests-header {
          background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%);
          padding: 12px 24px;
          margin-bottom: 16px;
          font-weight: bold;
          font-size: 16px;
          color: #fff;
          border-radius: 8px 8px 0 0;
          margin-left: -24px;
          margin-right: -24px;
          margin-top: -24px;
        }
        
        .course-filter-tags {
          margin-bottom: 20px;
        }
        
        .course-tag {
          cursor: pointer;
          padding: 4px 12px;
          font-size: 12px;
          font-weight: normal;
          border: 1px solid #d9d9d9;
          transition: all 0.3s ease;
        }
        
        .course-tag.active {
          background-color: #1890ff;
          color: #fff;
          border-color: #1890ff;
          font-weight: bold;
        }
        
        .test-list-container {
          margin-top: 16px;
        }
        
        .test-card {
          margin-bottom: 16px;
          border-radius: 8px;
          border: 1px solid #f0f0f0;
          transition: box-shadow 0.3s ease;
        }
        
        .test-card:hover {
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }
        
        .test-info {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        
        .test-name {
          font-size: 16px;
          margin-bottom: 8px;
          display: block;
        }
        
        .test-details {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }
        
        .test-detail-item {
          display: flex;
          gap: 8px;
        }
        
        .detail-label {
          font-weight: 500;
          color: #666;
        }
        
        .detail-value {
          color: #333;
        }
        
        .test-action-col {
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          gap: 8px;
        }
        
        .start-test-button {
          background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%);
          border-color: #f59e0b;
          color: #000;
          font-weight: 500;
          min-width: 120px;
        }
        
        .expired-tag-container {
          margin-top: 8px;
        }
        
        .expired-tag {
          font-weight: 500;
        }
        
        .action-buttons-row {
          margin-top: 24px;
        }
        
        .completed-tests-button {
          background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%);
          border-color: #f59e0b;
          color: #000;
          font-weight: 500;
          height: 40px;
        }
        
        .no-tests-alert {
          margin-top: 16px;
        }
        
        /* Modal Styles */
        .test-selection-modal .ant-modal-header {
          background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%);
          color: #fff;
        }
        
        .test-selection-modal .ant-modal-title {
          color: #fff;
        }
        
        .modal-search-container {
          margin-bottom: 20px;
        }
        
        .modal-search-input {
          width: 100%;
          border-radius: 8px;
          font-size: 15px;
          height: 40px;
          background: #fafafa;
          border: 1px solid #d9d9d9;
          padding-left: 14px;
        }
        
        .modal-test-list-container {
          margin-top: 16px;
        }
        
        .modal-test-list-title {
          margin-bottom: 20px;
          color: #333;
        }
        
        .modal-test-item {
          padding: 16px 0;
          border-bottom: 1px solid #f0f0f0;
        }
        
        .modal-test-name {
          font-size: 16px;
          color: #333;
        }
        
        .modal-test-details {
          font-size: 14px;
          color: #666;
        }
        
        .modal-start-test-button {
          background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%);
          border-color: #f59e0b;
          color: #000;
          font-weight: 500;
        }
        
        .modal-expired-tag,
        .modal-result-tag {
          margin-top: 8px;
          font-weight: 500;
        }
        
        .modal-no-tests-alert {
          margin-top: 16px;
        }
        
        @media (max-width: 768px) {
          .test-card {
            padding: 12px;
          }
          
          .test-action-col {
            align-items: flex-start;
            margin-top: 12px;
          }
          
          .ongoing-tests-header {
            font-size: 14px;
            padding: 8px 16px;
          }
        }
      `}</style>
    </StudentLayoutWrapper>
    </>
  );
};

export default StudentDashboard;