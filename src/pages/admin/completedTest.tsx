import { useEffect, useState } from "react";
import { Table, Spin } from "antd";
// import { useNavigate } from "react-router-dom";
import LayoutWrapper from "../../components/adminlayout/layoutWrapper";

interface TestResult {
  user_id: number;
  firstname: string;
  lastname: string;
  test_id: number;
  test_name: string;
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

const CompletedTest = () => {
  const [loading, setLoading] = useState<boolean>(true);
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  // const navigate = useNavigate();
  const token = localStorage.getItem("token");

  useEffect(() => {
    fetchTestResults();
  }, []);

  const fetchTestResults = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        "http://localhost:3001/api/student/getAllTestResultsForAllTests",
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
    // {
    //   title: "Action",
    //   key: "action",
    //   render: (record: TestResult) => (
    //     <Button
    //       type="primary"
    //       onClick={() => navigate(`/test-result/${record.test_id}`)}
    //     >
    //       View Details
    //     </Button>
    //   ),
    // },
  ];

  return (
    <LayoutWrapper pageTitle={"BORIGAM / Completed Tests"}>
      <div className="completed-test" style={{ padding: "20px" }}>
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
            dataSource={testResults}
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
