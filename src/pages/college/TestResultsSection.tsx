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
  Divider,
  Badge,
  Statistic,
  Tag,
  Alert
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
  FileTextOutlined
} from "@ant-design/icons";

import CollegeLayoutWrapper from "../../components/collegeLayout/collegeLayoutWrapper";

const { Title, Text } = Typography;
const { Search } = Input;
const { Option } = Select;

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

interface FilterOption {
  id: number;
  name: string;
}

interface FilterOptions {
  courses: FilterOption[];
  batches: FilterOption[];
}

interface TestResultsSectionProps {
  collegeId?: string;
}

const TestResultsSection = ({ collegeId }: TestResultsSectionProps) => {
  const [loading, setLoading] = useState<boolean>(true);
  const [filterLoading, setFilterLoading] = useState<boolean>(false);
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [filteredResults, setFilteredResults] = useState<TestResult[]>([]);
  const [filterOptions, setFilterOptions] = useState<FilterOptions>({
    courses: [],
    batches: [],
  });
  const [filters, setFilters] = useState({
    search: "",
    courseId: null as number | null,
    batchId: null as number | null,
  });
  const [error, setError] = useState<string | null>(null);
  const token = localStorage.getItem("token");

  useEffect(() => {
    fetchTestResults();
  }, [collegeId]);

  useEffect(() => {
    if (testResults.length > 0) {
      extractFilterOptions();
    }
  }, [testResults]);

  useEffect(() => {
    applyFilters();
  }, [filters, testResults]);

  const fetchTestResults = async () => {
    try {
      setLoading(true);
      setError(null);
      const url = collegeId
        ? `http://localhost:3001/api/student/getAllTestResultsForAllTests?collegeId=${collegeId}`
        : "http://localhost:3001/api/student/getAllTestResultsForAllTests";

      const response = await fetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          token: token || "",
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const data = await response.json();
      setTestResults(data.results || []);
    } catch (error: any) {
      console.error("Error fetching test results:", error);
      setError(error.message || "Failed to load test results");
    } finally {
      setLoading(false);
    }
  };

  const extractFilterOptions = () => {
    setFilterLoading(true);

    // Extract unique courses with ids
    const courseMap = new Map<number, string>();
    testResults.forEach((item) => {
      if (item.course_id && item.course_name) {
        courseMap.set(item.course_id, item.course_name);
      }
    });
    const courses = Array.from(courseMap, ([id, name]) => ({ id, name }));

    // Extract unique batches with ids
    const batchMap = new Map<number, string>();
    testResults.forEach((item) => {
      if (item.batch_id && item.batch_name) {
        batchMap.set(item.batch_id, item.batch_name);
      }
    });
    const batches = Array.from(batchMap, ([id, name]) => ({ id, name }));

    setFilterOptions({
      courses,
      batches,
    });
    setFilterLoading(false);
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
          item.test_name.toLowerCase().includes(searchTerm)
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

  const handleCourseChange = (value: number | null) => {
    setFilters({ ...filters, courseId: value });
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
      ),
    },
    {
      title: (
        <span style={{ fontWeight: 600, color: '#1f2937' }}>
          Batch
        </span>
      ),
      dataIndex: "batch_name",
      key: "batch_name",
      render: (text: string) => (
        <Tag color="green" style={{ fontSize: '12px', padding: '4px 12px' }}>
          {text}
        </Tag>
      ),
    },
    {
      title: (
        <span style={{ fontWeight: 600, color: '#1f2937' }}>
          <CheckCircleOutlined style={{ marginRight: 8, color: '#10b981' }} />
          Correct
        </span>
      ),
      dataIndex: "correct",
      key: "correct",
      render: (text: number) => <Text strong style={{ color: '#10b981' }}>{text}</Text>,
    },
    {
      title: (
        <span style={{ fontWeight: 600, color: '#1f2937' }}>
          <CloseCircleOutlined style={{ marginRight: 8, color: '#ef4444' }} />
          Wrong
        </span>
      ),
      dataIndex: "wrong",
      key: "wrong",
      render: (text: number) => <Text strong style={{ color: '#ef4444' }}>{text}</Text>,
    },
    {
      title: (
        <span style={{ fontWeight: 600, color: '#1f2937' }}>
          <TrophyOutlined style={{ marginRight: 8, color: '#6366f1' }} />
          Score
        </span>
      ),
      key: "final_score",
      render: (record: TestResult) => (
        <Badge
          count={`${record.final_score}%`}
          style={{
            backgroundColor: parseFloat(record.final_score) >= 60 ? '#52c41a' : '#ff4d4f',
            fontSize: '13px',
            fontWeight: 600
          }}
        />
      ),
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
          color={text === "Pass" ? "success" : "error"}
          style={{
            fontSize: '14px',
            fontWeight: 600,
            padding: '4px 12px',
            borderRadius: '12px'
          }}
        >
          {text}
        </Tag>
      ),
    },
  ];

  return (
    <CollegeLayoutWrapper
      pageTitle={collegeId ? "College Students" : "All Students"}
    >
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
            Test Results
          </Title>
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
                  placeholder="Search by student or test name"
                  allowClear
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
                  onSearch={handleSearch}
                  onChange={(e) => handleSearch(e.target.value)}
                  value={filters.search}
                  style={{ width: '100%' }}
                />
              </Col>
              <Col xs={24} sm={12} md={6}>
                <Select
                  style={{ width: '100%', height: '40px' }}
                  placeholder="Filter by course"
                  allowClear
                  value={filters.courseId}
                  onChange={handleCourseChange}
                  suffixIcon={<FilterOutlined style={{ color: '#6366f1' }} />}
                  loading={filterLoading}
                >
                  {filterOptions.courses.map((course) => (
                    <Option key={course.id} value={course.id}>
                      {course.name}
                    </Option>
                  ))}
                </Select>
              </Col>
              <Col xs={24} sm={12} md={4}>
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
            </Row>
          </Card>

          <Spin spinning={loading} tip="Loading test results...">
            <Table
              dataSource={filteredResults}
              columns={columns}
              rowKey={(record) => `${record.user_id}-${record.test_id}`}
              bordered={false}
              pagination={{
                pageSize: 5,
                showSizeChanger: true,
                showQuickJumper: true,
                style: { padding: '16px 24px' }
              }}
              style={{
                background: 'white',
                borderRadius: '16px',
                border: '1px solid #e5e7eb',
                overflow: 'hidden'
              }}
              onRow={(record) => ({
                style: {
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                },
                onMouseEnter: (e) => {
                  e.currentTarget.style.backgroundColor = '#f8fafc';
                },
                onMouseLeave: (e) => {
                  e.currentTarget.style.backgroundColor = 'white';
                }
              })}
            />
          </Spin>
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
      </div>
    </CollegeLayoutWrapper>
  );
};

export default TestResultsSection;