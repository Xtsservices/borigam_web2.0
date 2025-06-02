import { useEffect, useState } from "react";
import { 
  Table, 
  Spin, 
  Input, 
  Select, 
  Row, 
  Col, 
  Button, 
  Card, 
  Typography,
  Statistic,
  Tag,
  Modal,
  Collapse,
  Space,
  Divider,
  Alert,
  message,
} from "antd";
import { 
  SearchOutlined,
  FilterOutlined,
  ClearOutlined,
  FileTextOutlined,
  BookOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  EyeOutlined,
  QuestionCircleOutlined,
  TrophyOutlined
} from "@ant-design/icons";
import LayoutWrapper from "../../components/adminlayout/layoutWrapper";

const { Option } = Select;
const { Title, Text } = Typography;
const { Panel } = Collapse;

interface TestResult {
  user_id: number;
  firstname: string;
  lastname: string;
  test_id: number;
  test_name: string;
  course_id: number;
  course_name: string;
  batch_id: number;
  batch_name: string;
  total_questions: number;
  attempted: number;
  unattempted: number;
  correct: number;
  wrong: number;
  final_score: string;
  final_result: string;
  marks_awarded: string;
  marks_deducted: string;
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

interface QuestionOption {
  option_id: number;
  is_correct: boolean;
  option_text: string;
}

interface QuestionDetail {
  question_id: number;
  question_text: string;
  question_explanation: string;
  question_type: string;
  submitted_option_ids: number[];
  is_correct: boolean | null;
  marks_awarded: number | null;
  marks_deducted: number | null;
  submission_status: string;
  options: QuestionOption[];
}

interface DetailedTestResult {
  total_questions: number;
  attempted: number;
  unattempted: number;
  correct: number;
  wrong: number;
  final_score: string;
  final_result: string;
  marks_awarded: string;
  marks_deducted: string;
}

interface TestResultDetails {
  message: string;
  result: DetailedTestResult;
  answers: QuestionDetail[];
}

const CompletedTest = () => {
  const [loading, setLoading] = useState<boolean>(true);
  const [filterLoading, setFilterLoading] = useState<boolean>(false);
  const [detailLoading, setDetailLoading] = useState<boolean>(false);
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [filteredResults, setFilteredResults] = useState<TestResult[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [allBatches, setAllBatches] = useState<Batch[]>([]);
  const [filteredBatches, setFilteredBatches] = useState<Batch[]>([]);
  const [filters, setFilters] = useState({
    search: "",
    courseId: null as number | null,
    batchId: null as number | null,
  });
  const [selectedTestDetails, setSelectedTestDetails] = useState<TestResultDetails | null>(null);
  const [detailModalVisible, setDetailModalVisible] = useState<boolean>(false);
  const token = localStorage.getItem("token");

  useEffect(() => {
    fetchTestResults();
    fetchCourses();
    fetchAllBatches();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [filters, testResults]);

  const fetchTestResults = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        "http://13.233.33.133:3001/api/student/getAllTestResultsForAllTests",
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            token: token || "",
          },
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const data = await response.json();
      setTestResults(data.results || []);
    } catch (error) {
      console.error("Error fetching test results:", error);
      message.error("Failed to fetch test results");
    } finally {
      setLoading(false);
    }
  };

  const fetchCourses = async () => {
    try {
      setFilterLoading(true);
      const response = await fetch(
        "http://13.233.33.133:3001/api/course/getCourses",
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            token: token || "",
          },
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const data = await response.json();
      setCourses(data || []);
    } catch (error) {
      console.error("Error fetching courses:", error);
      message.error("Failed to fetch courses");
    } finally {
      setFilterLoading(false);
    }
  };

  const fetchAllBatches = async () => {
    try {
      const response = await fetch(
        "http://13.233.33.133:3001/api/course/viewAllBatches",
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            token: token || "",
          },
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const data = await response.json();
      setAllBatches(data.data || []);
    } catch (error) {
      console.error("Error fetching batches:", error);
      message.error("Failed to fetch batches");
    }
  };

  const fetchTestResultDetails = async (testId: number, userId: number) => {
    try {
      setDetailLoading(true);
      const response = await fetch(
        `http://13.233.33.133:3001/api/testsubmission/getTestResultById?test_id=${testId}&user_id=${userId}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            token: token || "",
          },
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const data: TestResultDetails = await response.json();
      setSelectedTestDetails(data);
      setDetailModalVisible(true);
    } catch (error) {
      console.error("Error fetching test result details:", error);
      message.error("Failed to fetch test result details");
    } finally {
      setDetailLoading(false);
    }
  };

  const applyFilters = () => {
    let results = [...testResults];

    // Apply search filter
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      results = results.filter(
        (item) =>
          item.firstname.toLowerCase().includes(searchTerm) ||
          item.lastname.toLowerCase().includes(searchTerm) ||
          item.test_name.toLowerCase().includes(searchTerm) ||
          item.course_name.toLowerCase().includes(searchTerm) ||
          item.batch_name.toLowerCase().includes(searchTerm)
      );
    }

    // Apply course filter by ID
    if (filters.courseId !== null) {
      results = results.filter((item) => item.course_id === filters.courseId);
    }

    // Apply batch filter by ID
    if (filters.batchId !== null) {
      results = results.filter((item) => item.batch_id === filters.batchId);
    }

    setFilteredResults(results);
  };

  const handleSearch = (value: string) => {
    setFilters({ ...filters, search: value });
  };

  const handleCourseChange = (value: number) => {
    // Filter batches based on selected course
    const filtered = allBatches.filter(batch => batch.course_id === value);
    setFilteredBatches(filtered);
    
    // Update filters and reset batch selection
    setFilters({ 
      ...filters, 
      courseId: value,
      batchId: null // Reset batch when course changes
    });
  };

  const handleBatchChange = (value: number | null) => {
    setFilters({ ...filters, batchId: value });
  };

  const clearFilters = () => {
    setFilters({
      search: "",
      courseId: null,
      batchId: null,
    });
    setFilteredBatches([]);
  };

  const handleViewDetails = (record: TestResult) => {
    fetchTestResultDetails(record.test_id, record.user_id);
  };

  const renderQuestionDetails = (question: QuestionDetail, index: number) => {
    const submittedOptions = question.options.filter(opt => 
      question.submitted_option_ids.includes(opt.option_id)
    );
    const correctOptions = question.options.filter(opt => opt.is_correct);

    return (
      <Panel 
        header={
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>
              <QuestionCircleOutlined style={{ marginRight: 8 }} />
              Question {index + 1}: {question.question_text.length > 100 
                ? `${question.question_text.substring(0, 100)}...` 
                : question.question_text}
            </span>
            <Space>
              {question.submission_status === 'answered' ? (
                question.is_correct ? (
                  <Tag color="green" icon={<CheckCircleOutlined />}>Correct</Tag>
                ) : (
                  <Tag color="red" icon={<CloseCircleOutlined />}>Wrong</Tag>
                )
              ) : (
                <Tag color="orange">Unanswered</Tag>
              )}
            </Space>
          </div>
        }
        key={question.question_id}
      >
        <div style={{ padding: '16px 0' }}>
          <Text strong>Question: </Text>
          <Text>{question.question_text}</Text>
          
          <Divider />
          
          <Row gutter={[16, 16]}>
            <Col span={12}>
              <Text strong style={{ color: '#52c41a' }}>Correct Answer(s):</Text>
              {correctOptions.map(option => (
                <div key={option.option_id} style={{ marginTop: 8 }}>
                  <Tag color="green">{option.option_text}</Tag>
                </div>
              ))}
            </Col>
            
            <Col span={12}>
              <Text strong style={{ color: question.is_correct ? '#52c41a' : '#ff4d4f' }}>
                Your Answer:
              </Text>
              {question.submission_status === 'answered' ? (
                submittedOptions.map(option => (
                  <div key={option.option_id} style={{ marginTop: 8 }}>
                    <Tag color={question.is_correct ? 'green' : 'red'}>
                      {option.option_text}
                    </Tag>
                  </div>
                ))
              ) : (
                <div style={{ marginTop: 8 }}>
                  <Tag color="orange">Not Answered</Tag>
                </div>
              )}
            </Col>
          </Row>

          {question.question_explanation && (
            <>
              <Divider />
              <div>
                <Text strong>Explanation: </Text>
                <Text>{question.question_explanation}</Text>
              </div>
            </>
          )}

          <Divider />
          
          <Row gutter={[16, 16]}>
            <Col span={8}>
              <Statistic 
                title="Marks Awarded" 
                value={question.marks_awarded || 0} 
                valueStyle={{ color: '#52c41a' }}
              />
            </Col>
            <Col span={8}>
              <Statistic 
                title="Marks Deducted" 
                value={question.marks_deducted || 0} 
                valueStyle={{ color: '#ff4d4f' }}
              />
            </Col>
            <Col span={8}>
              <Statistic 
                title="Status" 
                value={question.submission_status}
                valueStyle={{ 
                  color: question.submission_status === 'answered' ? '#1890ff' : '#faad14' 
                }}
              />
            </Col>
          </Row>
        </div>
      </Panel>
    );
  };

  const columns = [
    {
      title: (
        <span style={{ fontWeight: 600, color: '#1f2937' }}>
          <FileTextOutlined style={{ marginRight: 8, color: '#6366f1' }} />
          Student Name
        </span>
      ),
      key: "student_name",
      render: (record: TestResult) => (
        <Text strong>{`${record.firstname} ${record.lastname}`}</Text>
      ),
      sorter: (a: TestResult, b: TestResult) => 
        `${a.firstname} ${a.lastname}`.localeCompare(`${b.firstname} ${b.lastname}`),
    },
    {
      title: (
        <span style={{ fontWeight: 600, color: '#1f2937' }}>
          <BookOutlined style={{ marginRight: 8, color: '#6366f1' }} />
          Test Name
        </span>
      ),
      dataIndex: "test_name",
      key: "test_name",
      render: (text: string) => <Text>{text}</Text>,
      sorter: (a: TestResult, b: TestResult) => a.test_name.localeCompare(b.test_name),
    },
    {
      title: (
        <span style={{ fontWeight: 600, color: '#1f2937' }}>
          Course Name
        </span>
      ),
      dataIndex: "course_name",
      key: "course_name",
      render: (text: string) => <Text>{text}</Text>,
      sorter: (a: TestResult, b: TestResult) => a.course_name.localeCompare(b.course_name),
    },
    {
      title: (
        <span style={{ fontWeight: 600, color: '#1f2937' }}>
          Batch Name
        </span>
      ),
      dataIndex: "batch_name",
      key: "batch_name",
      render: (text: string) => <Text>{text}</Text>,
      sorter: (a: TestResult, b: TestResult) => a.batch_name.localeCompare(b.batch_name),
    },
    {
      title: (
        <span style={{ fontWeight: 600, color: '#1f2937' }}>
          Total Questions
        </span>
      ),
      dataIndex: "total_questions",
      key: "total_questions",
      render: (text: number) => <Text>{text}</Text>,
      sorter: (a: TestResult, b: TestResult) => a.total_questions - b.total_questions,
    },
    {
      title: (
        <span style={{ fontWeight: 600, color: '#1f2937' }}>
          Attempted
        </span>
      ),
      dataIndex: "attempted",
      key: "attempted",
      render: (text: number) => <Text>{text}</Text>,
      sorter: (a: TestResult, b: TestResult) => a.attempted - b.attempted,
    },
    {
      title: (
        <span style={{ fontWeight: 600, color: '#1f2937' }}>
          Correct
        </span>
      ),
      dataIndex: "correct",
      key: "correct",
      render: (text: number) => <Tag color="green">{text}</Tag>,
      sorter: (a: TestResult, b: TestResult) => a.correct - b.correct,
    },
    {
      title: (
        <span style={{ fontWeight: 600, color: '#1f2937' }}>
          Wrong
        </span>
      ),
      dataIndex: "wrong",
      key: "wrong",
      render: (text: number) => <Tag color="red">{text}</Tag>,
      sorter: (a: TestResult, b: TestResult) => a.wrong - b.wrong,
    },
    {
      title: (
        <span style={{ fontWeight: 600, color: '#1f2937' }}>
          Score
        </span>
      ),
      key: "final_score",
      render: (record: TestResult) => (
        <Text strong style={{ 
          color: parseFloat(record.final_score) >= 50 ? '#52c41a' : '#ff4d4f' 
        }}>
          {`${record.final_score}%`}
        </Text>
      ),
      sorter: (a: TestResult, b: TestResult) => 
        parseFloat(a.final_score) - parseFloat(b.final_score),
    },
    {
      title: (
        <span style={{ fontWeight: 600, color: '#1f2937' }}>
          Result
        </span>
      ),
      dataIndex: "final_result",
      key: "final_result",
      render: (text: string) => (
        <Tag 
          color={text === "Pass" ? "green" : "red"} 
          icon={text === "Pass" ? <CheckCircleOutlined /> : <CloseCircleOutlined />}
        >
          {text}
        </Tag>
      ),
      filters: [
        { text: 'Pass', value: 'Pass' },
        { text: 'Fail', value: 'Fail' },
      ],
      onFilter: (value: string | number | boolean, record: TestResult) => record.final_result === value,
    },
    {
      title: (
        <span style={{ fontWeight: 600, color: '#1f2937' }}>
          Actions
        </span>
      ),
      key: "actions",
      render: (record: TestResult) => (
        <Button
          type="primary"
          icon={<EyeOutlined />}
          onClick={() => handleViewDetails(record)}
          loading={detailLoading}
          style={{
            background: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)',
            border: 'none',
            borderRadius: '6px'
          }}
        >
          View Details
        </Button>
      ),
    },
  ];

  // Calculate summary statistics
  const totalStudents = filteredResults.length;
  const passedStudents = filteredResults.filter(result => result.final_result === 'Pass').length;
  const failedStudents = totalStudents - passedStudents;
  const averageScore = totalStudents > 0 
    ? (filteredResults.reduce((sum, result) => sum + parseFloat(result.final_score), 0) / totalStudents).toFixed(2)
    : '0';

  return (
    <LayoutWrapper pageTitle={"BORIGAM / Completed Tests"}>
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
            Test Results Dashboard
          </Title>

          {/* Summary Statistics */}
          <Card
            style={{ 
              marginBottom: 24, 
              borderRadius: '16px',
              border: '1px solid #e5e7eb',
              boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)'
            }}
            bodyStyle={{ padding: '24px' }}
          >
            <Row gutter={[16, 16]}>
              <Col xs={12} sm={6}>
                <Statistic
                  title="Total Results"
                  value={totalStudents}
                  valueStyle={{ color: '#1890ff' }}
                  prefix={<FileTextOutlined />}
                />
              </Col>
              <Col xs={12} sm={6}>
                <Statistic
                  title="Passed"
                  value={passedStudents}
                  valueStyle={{ color: '#52c41a' }}
                  prefix={<CheckCircleOutlined />}
                />
              </Col>
              <Col xs={12} sm={6}>
                <Statistic
                  title="Failed"
                  value={failedStudents}
                  valueStyle={{ color: '#ff4d4f' }}
                  prefix={<CloseCircleOutlined />}
                />
              </Col>
              <Col xs={12} sm={6}>
                <Statistic
                  title="Average Score"
                  value={`${averageScore}%`}
                  valueStyle={{ color: '#722ed1' }}
                  prefix={<TrophyOutlined />}
                />
              </Col>
            </Row>
          </Card>
          
          {/* Filters */}
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
                <Input.Search
                  placeholder="Search by student, test, course, or batch name"
                  allowClear
                  size="large"
                  onSearch={handleSearch}
                  onChange={(e) => handleSearch(e.target.value)}
                  value={filters.search}
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
                />
              </Col>
              <Col xs={24} sm={12} md={6}>
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
                  Clear Filters
                </Button>
              </Col>
              <Col xs={24} sm={12} md={5}>
                <Select
                  style={{ width: '100%', height: '40px' }}
                  placeholder="Filter by course"
                  allowClear
                  value={filters.courseId}
                  onChange={handleCourseChange}
                  suffixIcon={<FilterOutlined style={{ color: '#6366f1' }} />}
                  loading={filterLoading}
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
              </Col>
              <Col xs={24} sm={12} md={5}>
                <Select
                  style={{ width: '100%', height: '40px' }}
                  placeholder={filters.courseId ? "Filter by batch" : "Select course first"}
                  allowClear
                  value={filters.batchId}
                  onChange={handleBatchChange}
                  suffixIcon={<FilterOutlined style={{ color: '#6366f1' }} />}
                  loading={filterLoading}
                  disabled={!filters.courseId}
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
              </Col>
            </Row>
          </Card>

          <Spin spinning={loading} tip="Loading test results...">
            <Table
              columns={columns}
              dataSource={filteredResults}
              rowKey={(record) => `${record.user_id}-${record.test_id}`}
              pagination={{ 
                pageSize: 10,
                showSizeChanger: true,
                pageSizeOptions: ['10', '20', '50', '100'],
                showQuickJumper: true,
                showTotal: (total, range) => 
                  `${range[0]}-${range[1]} of ${total} results`,
                style: { padding: '16px 24px' }
              }}
              bordered={false}
              style={{ 
                background: 'white',
                borderRadius: '16px',
                border: '1px solid #e5e7eb',
                overflow: 'hidden'
              }}
              scroll={{ x: 1200 }}
            />
          </Spin>
        </div>

        {/* Detailed Results Modal */}
        <Modal
          title={
            <div style={{ 
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              fontSize: '24px',
              fontWeight: 700
            }}>
              Detailed Test Results
            </div>
          }
          open={detailModalVisible}
          onCancel={() => {
            setDetailModalVisible(false);
            setSelectedTestDetails(null);
          }}
          footer={null}
          width={1200}
          style={{ top: 20 }}
          bodyStyle={{ maxHeight: '80vh', overflowY: 'auto' }}
        >
          {selectedTestDetails && (
            <div>
              {/* Summary Statistics */}
              <Card style={{ marginBottom: 24, borderRadius: '12px' }}>
                <Row gutter={[16, 16]}>
                  <Col span={6}>
                    <Statistic
                      title="Total Questions"
                      value={selectedTestDetails.result.total_questions}
                      valueStyle={{ color: '#1890ff' }}
                    />
                  </Col>
                  <Col span={6}>
                    <Statistic
                      title="Attempted"
                      value={selectedTestDetails.result.attempted}
                      valueStyle={{ color: '#722ed1' }}
                    />
                  </Col>
                  <Col span={6}>
                    <Statistic
                      title="Correct"
                      value={selectedTestDetails.result.correct}
                      valueStyle={{ color: '#52c41a' }}
                    />
                  </Col>
                  <Col span={6}>
                    <Statistic
                      title="Wrong"
                      value={selectedTestDetails.result.wrong}
                      valueStyle={{ color: '#ff4d4f' }}
                    />
                  </Col>
                </Row>
                
                <Divider />
                
                <Row gutter={[16, 16]}>
                  <Col span={8}>
                    <Statistic
                      title="Final Score"
                      value={`${selectedTestDetails.result.final_score}%`}
                      valueStyle={{ 
                        color: parseFloat(selectedTestDetails.result.final_score) >= 50 ? '#52c41a' : '#ff4d4f',
                        fontSize: '24px'
                      }}
                    />
                  </Col>
                  <Col span={8}>
                    <Statistic
                      title="Marks Awarded"
                      value={selectedTestDetails.result.marks_awarded}
                      valueStyle={{ color: '#52c41a' }}
                    />
                  </Col>
                  <Col span={8}>
                    <div style={{ textAlign: 'center' }}>
                      <Text strong>Result: </Text>
                      <Tag 
                        color={selectedTestDetails.result.final_result === "Pass" ? "green" : "red"}
                        style={{ fontSize: '16px', padding: '8px 16px' }}
                        icon={selectedTestDetails.result.final_result === "Pass" ? <CheckCircleOutlined /> : <CloseCircleOutlined />}
                      >
                        {selectedTestDetails.result.final_result}
                      </Tag>
                    </div>
                  </Col>
                </Row>
              </Card>

              {/* Question Analysis */}
              <Card style={{ borderRadius: '12px' }}>
                <Title level={4} style={{ marginBottom: 16 }}>
                  <QuestionCircleOutlined style={{ marginRight: 8 }} />
                  Question-wise Analysis
                </Title>
                
                {selectedTestDetails.answers.length > 0 ? (
                  <Collapse ghost>
                    {selectedTestDetails.answers.map((question, index) => 
                      renderQuestionDetails(question, index)
                    )}
                  </Collapse>
                ) : (
                  <Alert
                    message="No question details available"
                    type="info"
                    showIcon
                  />
                )}
              </Card>
            </div>
          )}
        </Modal>
        
        <style>{`
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
          .ant-collapse-header {
            background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%) !important;
            border-radius: 8px !important;
            margin-bottom: 8px !important;
          }
          .ant-collapse-content {
            background: #fafafa !important;
            border-radius: 8px !important;
          }
        `}</style>
      </div>
    </LayoutWrapper>
  );
};

export default CompletedTest;