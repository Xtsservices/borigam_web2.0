import React, { useEffect, useState } from "react";
import {
  Table,
  Card,
  Typography,
  Spin,
  Alert,
  Tag,
  Space,
  message,
  Descriptions,
  Input,
  Button,
  Select,
  Row,
  Col,
  Divider,
  Badge,
  Statistic,
} from "antd";
import {
  SearchOutlined,
  FilterOutlined,
  ClearOutlined,
  TrophyOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  ClockCircleOutlined,
  BookOutlined,
  FileTextOutlined,
} from "@ant-design/icons";
import StudentLayoutWrapper from "../../components/studentlayout/studentlayoutWrapper";

const { Title, Text } = Typography;
const { Search } = Input;
const { Option } = Select;

interface CompletedTest {
  course_id: number;
  test_id: number;
  test_name: string;
  duration: number;
  total_questions: number;
  attempted: number;
  correct: number;
  wrong: number;
  final_score: string;
  final_result: string;
  subject_name: string;
  course_name?: string;
  batch_name?: string;
  start_time?: number;
  created_at?: number;
  end_time?: number;
}

interface Option {
  option_id: number;
  option_text: string;
  is_correct: boolean;
}

interface Answer {
  question_id: number;
  question_text: string;
  question_type: string;
  marks_awarded: number;
  marks_deducted: number;
  submitted_option_ids: number[];
  is_correct: boolean | null;
  submission_status: string;
  options: Option[];
}

interface TestResult {
  total_questions: number;
  attempted: number;
  unattempted: number;
  correct: number;
  wrong: number;
  final_score: string;
  final_result: string;
  marks_awarded: number;
  marks_deducted: number;
  total_marks_awarded: number;
}

interface Course {
  id: number;
  name: string;
}

const StudentCompletedTest = () => {
  const [loading, setLoading] = useState<boolean>(true);
  const [tests, setTests] = useState<CompletedTest[]>([]);
  const [filteredTests, setFilteredTests] = useState<CompletedTest[]>([]);
  const [selectedResult, setSelectedResult] = useState<TestResult | null>(null);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [searchText, setSearchText] = useState<string>("");
  const [selectedCourse, setSelectedCourse] = useState<number | null>(null);
  const [courses, setCourses] = useState<Course[]>([]);
  const token = localStorage.getItem("token");

  useEffect(() => {
    fetchCompletedTests();
    fetchCourses();
  }, []);

  useEffect(() => {
    filterTests();
  }, [searchText, selectedCourse, tests]);

  const fetchCompletedTests = async () => {
    try {
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

      if (!response.ok) throw new Error("Failed to fetch completed tests");

      const data = await response.json();
      const completed = data?.data?.tests?.completdTests || [];
      const batches = data?.data?.batches || [];
      
      const enrichedTests = completed.map((test: any, index: number) => {
        const batch = batches[index] || {};
        return {
          ...test,
          batch_id: batch.batch_id,
          batch_name: batch.batch_name,
        };
      });

      setTests(enrichedTests);
      setFilteredTests(enrichedTests);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const filterTests = () => {
    let filtered = tests;

    // Filter by search text
    if (searchText.trim()) {
      filtered = filtered.filter((test) =>
        test.test_name.toLowerCase().includes(searchText.toLowerCase()) ||
        test.course_name?.toLowerCase().includes(searchText.toLowerCase())
      );
    }

    // Filter by course
    if (selectedCourse) {
      filtered = filtered.filter((test) => test.course_id === selectedCourse);
    }

    setFilteredTests(filtered);
  };

  const fetchCourses = async () => {
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
      setCourses(data);
    } catch (error) {
      console.error("Error fetching courses:", error);
    }
  };

  const clearFilters = () => {
    setSearchText("");
    setSelectedCourse(null);
    setFilteredTests(tests);
  };

  const fetchTestResultById = async (test_id: number) => {
    try {
      setLoading(true);
      setSelectedResult(null);
      setAnswers([]);

      const response = await fetch(
        `http://localhost:3001/api/testsubmission/submitFinalResult?test_id=${test_id}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            token: token || "",
          },
        }
      );

      if (!response.ok) throw new Error("Failed to fetch test result");

      const data = await response.json();
      setSelectedResult(data.result);
      setAnswers(data.answers);
    } catch (err) {
      message.error(
        err instanceof Error ? err.message : "Failed to load test result"
      );
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (timestamp: string | number) => {
    const date = new Date(parseInt(timestamp.toString()) * 1000);
    return date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const testColumns = [
    {
      title: (
        <span style={{ fontWeight: 600, color: '#1f2937' }}>
          <ClockCircleOutlined style={{ marginRight: 8, color: '#6366f1' }} />
          Date
        </span>
      ),
      dataIndex: "created_at",
      key: "date",
      render: (text: string) => (
        <Text style={{ fontSize: '14px', fontWeight: 500 }}>
          {formatDate(text)}
        </Text>
      ),
      width: "15%",
    },
    {
      title: (
        <span style={{ fontWeight: 600, color: '#1f2937' }}>
          <FileTextOutlined style={{ marginRight: 8, color: '#6366f1' }} />
          Test Name
        </span>
      ),
      dataIndex: "test_name",
      key: "test_name",
      render: (text: string) => (
        <Text strong style={{ fontSize: '14px', color: '#1f2937' }}>
          {text}
        </Text>
      ),
      width: "25%",
    },
    {
      title: (
        <span style={{ fontWeight: 600, color: '#1f2937' }}>
          <BookOutlined style={{ marginRight: 8, color: '#6366f1' }} />
          Course
        </span>
      ),
      dataIndex: "course_name",
      key: "course_name",
      render: (text: string) => (
        <Tag color="blue" style={{ fontSize: '12px', padding: '4px 12px' }}>
          {text}
        </Tag>
      ),
      width: "20%",
    },
    
   
  ];

  const questionColumns = [
    {
      title: (
        <span style={{ fontWeight: 600, color: '#1f2937', fontSize: '16px' }}>
          <FileTextOutlined style={{ marginRight: 8, color: '#6366f1' }} />
          Question
        </span>
      ),
      dataIndex: "question_text",
      key: "question_text",
      render: (text: string, record: Answer, index: number) => (
        <div style={{ padding: '12px 0' }}>
          <Text strong style={{ fontSize: '15px', lineHeight: '1.6', color: '#1f2937' }}>
            {index + 1}. {text}
          </Text>
          <div style={{ marginTop: '8px', display: 'flex', gap: '12px', alignItems: 'center' }}>
            <Tag 
              color={record.question_type === "radio" ? "processing" : "warning"}
              style={{ fontSize: '11px', padding: '2px 8px', borderRadius: '6px' }}
            >
              {record.question_type === "radio" ? "Single Answer" : "Multiple Answers"}
            </Tag>
            <Text type="secondary" style={{ fontSize: '13px', fontWeight: 500 }}>
              Marks: {record.marks_awarded}
            </Text>
          </div>
        </div>
      ),
      width: "40%",
    },
    {
      title: (
        <span style={{ fontWeight: 600, color: '#1f2937', fontSize: '16px' }}>
          Options
        </span>
      ),
      key: "options",
      render: (record: Answer) => (
        <Space direction="vertical" size="small" style={{ width: '100%' }}>
          {record.options.map((option) => {
            const isSubmitted = record.submitted_option_ids.includes(option.option_id);
            const isCorrectOption = option.is_correct;
            
            let color = "default";
            let style: React.CSSProperties = { 
              fontSize: '13px',
              padding: '6px 12px',
              borderRadius: '8px',
              border: '1px solid #e5e7eb'
            };
            
            if (isSubmitted) {
              color = record.is_correct ? "success" : "error";
              style = { 
                ...style, 
                fontWeight: 600,
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
              };
            } else if (isCorrectOption) {
              color = "processing";
              style = { 
                ...style, 
                backgroundColor: '#e0f2ff',
                borderColor: '#1890ff'
              };
            }

            return (
              <Tag color={color} style={style} key={option.option_id}>
                {option.option_text}
                {isSubmitted && (
                  <Text style={{ fontSize: '11px', marginLeft: '8px', fontWeight: 500 }}>
                    (Your Answer)
                  </Text>
                )}
                {isCorrectOption && !isSubmitted && (
                  <Text style={{ fontSize: '11px', marginLeft: '8px', color: '#1890ff' }}>
                    (Correct Answer)
                  </Text>
                )}
              </Tag>
            );
          })}
        </Space>
      ),
      width: "50%",
    },
    {
      title: (
        <span style={{ fontWeight: 600, color: '#1f2937', fontSize: '16px' }}>
          Result
        </span>
      ),
      key: "result",
      align: "center" as const,
      render: (record: Answer) => {
        if (record.submission_status === "unanswered") {
          return (
            <Tag 
              color="warning" 
              style={{ fontSize: '13px', fontWeight: 600, padding: '6px 16px' }}
            >
              Unanswered
            </Tag>
          );
        }
        return (
          <Tag 
            color={record.is_correct ? "success" : "error"}
            style={{ fontSize: '13px', fontWeight: 600, padding: '6px 16px' }}
          >
            {record.is_correct ? "Correct" : "Incorrect"}
          </Tag>
        );
      },
    },
  ];

  return (
    <StudentLayoutWrapper pageTitle="BORIGAM / Completed Tests">
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
            <TrophyOutlined style={{ marginRight: '12px', color: '#6366f1' }} />
            Completed Tests
          </Title>
          <Text style={{ fontSize: '16px', color: '#6b7280', marginBottom: '32px', display: 'block' }}>
            Review your test performance and detailed results
          </Text>

          {/* {error && (
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
          )} */}

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
                <Search
                  placeholder="Search by Test Name or Course"
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  onSearch={filterTests}
                  style={{ width: '100%' }}
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
                  size="large"
                />
              </Col>
              <Col xs={24} sm={12} md={6}>
                <Select
                  style={{ width: '100%', height: '40px' }}
                  placeholder="Filter by course"
                  allowClear
                  value={selectedCourse}
                  onChange={(value) => setSelectedCourse(value)}
                  suffixIcon={<FilterOutlined style={{ color: '#6366f1' }} />}
                >
                  {courses.map((course) => (
                    <Option key={course.id} value={course.id}>
                      {course.name}
                    </Option>
                  ))}
                </Select>
              </Col>
              <Col xs={24} sm={24} md={6}>
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
                  Clear All Filters
                </Button>
              </Col>
              <Col xs={24} sm={24} md={4}>
                <Statistic
                  title="Total Tests"
                  value={filteredTests.length}
                  valueStyle={{ 
                    color: '#6366f1', 
                    fontSize: '24px', 
                    fontWeight: 700 
                  }}
                />
              </Col>
            </Row>
          </Card>

          {loading ? (
            <div style={{ 
              display: "flex", 
              justifyContent: "center", 
              alignItems: "center",
              minHeight: "200px",
              background: 'white',
              borderRadius: '16px'
            }}>
              <Spin 
                size="large" 
                style={{ 
                  fontSize: '18px',
                  color: '#6366f1'
                }}
              />
            </div>
          ) : (
            <>
              <Card
                style={{ 
                  marginBottom: 32,
                  borderRadius: '16px',
                  border: '1px solid #e5e7eb',
                  overflow: 'hidden'
                }}
                bodyStyle={{ padding: 0 }}
              >
                <Table
                  dataSource={filteredTests}
                  columns={testColumns}
                  rowKey="test_id"
                  bordered={false}
                  onRow={(record) => ({
                    onClick: () => fetchTestResultById(record.test_id),
                    style: { 
                      cursor: 'pointer',
                      transition: 'all 0.2s ease'
                    },
                    onMouseEnter: (e) => {
                      e.currentTarget.style.backgroundColor = '#f8fafc';
                      e.currentTarget.style.transform = 'translateY(-1px)';
                    },
                    onMouseLeave: (e) => {
                      e.currentTarget.style.backgroundColor = 'white';
                      e.currentTarget.style.transform = 'translateY(0)';
                    }
                  })}
                  pagination={{
                    pageSize: 10,
                    showSizeChanger: false,
                    showQuickJumper: true,
                    style: { padding: '16px 24px' }
                  }}
                  style={{ fontSize: 14 }}
                />
              </Card>

              {selectedResult && (
                <>
                  <Card 
                    title={
                      <span style={{ fontSize: '20px', fontWeight: 700, color: '#1f2937' }}>
                        <TrophyOutlined style={{ marginRight: '12px', color: '#6366f1' }} />
                        Test Summary
                      </span>
                    }
                    style={{ 
                      marginBottom: 32,
                      borderRadius: '16px',
                      border: '1px solid #e5e7eb'
                    }}
                    bodyStyle={{ padding: '32px' }}
                  >
                    <Row gutter={[24, 24]}>
                      <Col xs={24} sm={12} md={8}>
                        <Statistic
                          title="Total Questions"
                          value={selectedResult.total_questions}
                          valueStyle={{ color: '#6366f1', fontSize: '28px', fontWeight: 700 }}
                          prefix={<FileTextOutlined />}
                        />
                      </Col>
                      <Col xs={24} sm={12} md={8}>
                        <Statistic
                          title="Attempted"
                          value={selectedResult.attempted}
                          valueStyle={{ color: '#059669', fontSize: '28px', fontWeight: 700 }}
                          prefix={<CheckCircleOutlined />}
                        />
                      </Col>
                      <Col xs={24} sm={12} md={8}>
                        <Statistic
                          title="Unattempted"
                          value={selectedResult.unattempted}
                          valueStyle={{ color: '#d97706', fontSize: '28px', fontWeight: 700 }}
                          prefix={<ClockCircleOutlined />}
                        />
                      </Col>
                    </Row>
                    
                    <Divider style={{ margin: '32px 0' }} />
                    
                    <Descriptions bordered column={2} size="middle">
                      <Descriptions.Item label="Correct Answers">
                        <Tag 
                          color="success" 
                          style={{ fontSize: '16px', padding: '8px 16px', fontWeight: 600 }}
                        >
                          {selectedResult.correct}
                        </Tag>
                      </Descriptions.Item>
                      <Descriptions.Item label="Wrong Answers">
                        <Tag 
                          color="error" 
                          style={{ fontSize: '16px', padding: '8px 16px', fontWeight: 600 }}
                        >
                          {selectedResult.wrong}
                        </Tag>
                      </Descriptions.Item>
                      <Descriptions.Item label="Final Score">
                        <Text 
                          strong 
                          style={{ 
                            fontSize: '18px', 
                            color: parseInt(selectedResult.final_score) >= 60 ? '#059669' : '#dc2626'
                          }}
                        >
                          {selectedResult.final_score}%
                        </Text>
                      </Descriptions.Item>
                      <Descriptions.Item label="Total Marks Awarded">
                        <Text strong style={{ fontSize: '18px', color: '#6366f1' }}>
                          {selectedResult.total_marks_awarded}
                        </Text>
                      </Descriptions.Item>
                      <Descriptions.Item label="Final Result" span={2}>
                        <Tag
                          color={selectedResult.final_result === "Pass" ? "success" : "error"}
                          style={{ 
                            fontSize: '18px', 
                            padding: '12px 24px', 
                            fontWeight: 700,
                            borderRadius: '12px'
                          }}
                        >
                          {selectedResult.final_result}
                        </Tag>
                      </Descriptions.Item>
                    </Descriptions>
                  </Card>

                  <Card 
                    title={
                      <span style={{ fontSize: '20px', fontWeight: 700, color: '#1f2937' }}>
                        <FileTextOutlined style={{ marginRight: '12px', color: '#6366f1' }} />
                        Question Details
                      </span>
                    }
                    style={{ 
                      borderRadius: '16px',
                      border: '1px solid #e5e7eb'
                    }}
                    bodyStyle={{ padding: '24px' }}
                  >
                    <Table
                      dataSource={answers}
                      columns={questionColumns}
                      rowKey="question_id"
                      pagination={{
                        pageSize: 5,
                        showSizeChanger: true,
                        showQuickJumper: true,
                        pageSizeOptions: ['5', '10', '20']
                      }}
                      bordered={false}
                      style={{ 
                        fontSize: 14,
                        background: 'white',
                        borderRadius: '12px'
                      }}
                      rowClassName={(record, index) => 
                        index % 2 === 0 ? 'table-row-light' : 'table-row-dark'
                      }
                    />
                  </Card>
                </>
              )}
            </>
          )}
        </div>
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
    </StudentLayoutWrapper>
  );
};

export default StudentCompletedTest;