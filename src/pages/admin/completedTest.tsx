import { useEffect, useState } from "react";
import { Table, Spin, Input, Select, Row, Col, Button } from "antd";
import LayoutWrapper from "../../components/adminlayout/layoutWrapper";

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

const CompletedTest = () => {
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
  const token = localStorage.getItem("token");

  useEffect(() => {
    fetchTestResults();
  }, []);

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
      setLoading(false);
    } catch (error) {
      console.error("Error fetching test results:", error);
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
      title: "Student Name",
      key: "student_name",
      render: (record: TestResult) => `${record.firstname} ${record.lastname}`,
    },
    {
      title: "Test Name",
      dataIndex: "test_name",
      key: "test_name",
    },
    {
      title: "Course Name",
      dataIndex: "course_name",
      key: "course_name",
    },
    {
      title: "Batch Name",
      dataIndex: "batch_name",
      key: "batch_name",
    },
    {
      title: "Total Questions",
      dataIndex: "total_questions",
      key: "total_questions",
    },
    {
      title: "Attempted",
      dataIndex: "attempted",
      key: "attempted",
    },
    {
      title: "Unattempted",
      dataIndex: "unattempted",
      key: "unattempted",
    },
    {
      title: "Correct",
      dataIndex: "correct",
      key: "correct",
    },
    {
      title: "Wrong",
      dataIndex: "wrong",
      key: "wrong",
    },
    {
      title: "Score",
      key: "final_score",
      render: (record: TestResult) => `${record.final_score}%`,
    },
    {
      title: "Marks Awarded",
      dataIndex: "marks_awarded",
      key: "marks_awarded",
    },
    {
      title: "Marks Deducted",
      dataIndex: "marks_deducted",
      key: "marks_deducted",
    },
    {
      title: "Result",
      dataIndex: "final_result",
      key: "final_result",
      render: (text: string) => (
        <span style={{ color: text === "Pass" ? "green" : "red" }}>{text}</span>
      ),
    },
  ];

  return (
    <LayoutWrapper pageTitle={"BORIGAM / Completed Tests"}>
      <div className="completed-test" style={{ padding: "20px" }}>
        <Row
          gutter={[16, 16]}
          style={{ marginBottom: "20px", paddingBottom: "20px" }}
        >
          <Col xs={24} sm={24} md={10} lg={8}>
            <Search
              placeholder="Search by student or test name"
              allowClear
              enterButton="Search"
              size="large"
              onSearch={handleSearch}
              onChange={(e) => handleSearch(e.target.value)}
              value={filters.search}
              style={{ width: "100%" }}
            />
          </Col>
          <Col xs={24} sm={12} md={7} lg={5}>
            <Select
              style={{ width: "100%" }}
              placeholder="Course"
              onChange={handleCourseChange}
              value={filters.courseId}
              loading={filterLoading}
              allowClear
              size="large"
              optionFilterProp="children"
              showSearch
              filterOption={(input, option) =>
                typeof option?.children === "string"
                  ? (option.children as string)
                      .toLowerCase()
                      .includes(input.toLowerCase())
                  : false
              }
            >
              {filterOptions.courses.map((course) => (
                <Option key={course.id} value={course.id}>
                  {course.name}
                </Option>
              ))}
            </Select>
          </Col>
          <Col xs={24} sm={12} md={7} lg={5}>
            <Select
              style={{ width: "100%" }}
              placeholder="Batch"
              onChange={handleBatchChange}
              value={filters.batchId}
              loading={filterLoading}
              allowClear
              size="large"
              optionFilterProp="children"
              showSearch
              filterOption={(input, option) =>
                typeof option?.children === "string"
                  ? (option.children as string)
                      .toLowerCase()
                      .includes(input.toLowerCase())
                  : false
              }
            >
              {filterOptions.batches.map((batch) => (
                <Option key={batch.id} value={batch.id}>
                  {batch.name}
                </Option>
              ))}
            </Select>
          </Col>
          <Col
            xs={24}
            sm={24}
            md={24}
            lg={6}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "flex-end",
            }}
          >
            <Button
              onClick={clearFilters}
              style={{ width: "100%", height: "40px" }}
              type="primary"
              danger
              size="large"
            >
              Clear All Filters
            </Button>
          </Col>
        </Row>

        {loading ? (
          <Spin
            size="large"
            style={{
              display: "flex",
              justifyContent: "center",
              marginTop: "20px",
            }}
          />
        ) : (
          <Table
            dataSource={filteredResults}
            columns={columns}
            rowKey={(record) => `${record.user_id}-${record.test_id}`}
            bordered
            pagination={{ pageSize: 10 }}
            style={{ marginTop: "20px" }}
          />
        )}
      </div>
    </LayoutWrapper>
  );
};

export default CompletedTest;
