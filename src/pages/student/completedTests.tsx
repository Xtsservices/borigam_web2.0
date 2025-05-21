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
} from "antd";
import StudentLayoutWrapper from "../../components/studentlayout/studentlayoutWrapper";

const { Title, Text } = Typography;

interface CompletedTest {
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

const StudentCompletedTest = () => {
  const [loading, setLoading] = useState<boolean>(true);
  const [tests, setTests] = useState<CompletedTest[]>([]);
  const [selectedResult, setSelectedResult] = useState<TestResult | null>(null);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [error, setError] = useState<string | null>(null);
  const token = localStorage.getItem("token");

  useEffect(() => {
    fetchCompletedTests();
  }, []);

  const fetchCompletedTests = async () => {
    try {
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
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const fetchTestResultById = async (test_id: number) => {
    try {
      setLoading(true);
      setSelectedResult(null);
      setAnswers([]);

      const response = await fetch(
        `http://13.233.33.133:3001/api/testsubmission/submitFinalResult?test_id=${test_id}`,
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

  const testColumns = [
    {
      title: "Test Name",
      dataIndex: "test_name",
      key: "test_name",
    },
    {
      title: "Course",
      dataIndex: "course_name",
      key: "course_name",
    },
    {
      title: "Batch",
      dataIndex: "batch_name",
      key: "batch_name",
    },
    {
      title: "Score",
      dataIndex: "final_score",
      key: "final_score",
      render: (text: string) => `${text}%`,
    },
    {
      title: "Result",
      dataIndex: "final_result",
      key: "final_result",
      render: (text: string) => (
        <Tag color={text === "Pass" ? "green" : "red"}>{text}</Tag>
      ),
    },
  ];

  const questionColumns = [
    {
      title: "Question",
      dataIndex: "question_text",
      key: "question_text",
      render: (text: string, record: Answer, index: number) => (
        <div>
          <Text strong>
            {index + 1}. {text}
          </Text>
          <div>
            <Tag color={record.question_type === "radio" ? "blue" : "orange"}>
              {record.question_type === "radio" ? "Single Answer" : "Multiple Answers"}
            </Tag>
            <Text type="secondary">Marks: {record.marks_awarded}</Text>
          </div>
        </div>
      ),
      width: "40%",
    },
    {
      title: "Options",
      key: "options",
      render: (record: Answer) => (
        <Space direction="vertical">
          {record.options.map((option) => {
            // Check if this option was submitted by the student
            const isSubmitted = record.submitted_option_ids.includes(option.option_id);
            // Check if this option is correct
            const isCorrectOption = option.is_correct;
            
            let color = "default";
            let style: React.CSSProperties = {};
            
            if (isSubmitted) {
              // Student's answer - show in green if correct, red if wrong
              color = record.is_correct ? "green" : "red";
              style = { fontWeight: "bold" };
            } else if (isCorrectOption) {
              // Correct answer (not selected by student) - show in blue
              color = "blue";
            }
  
            return (
              <Tag color={color} style={style} key={option.option_id}>
                {option.option_text}
                {isSubmitted && " (Your Answer)"}
                {isCorrectOption && !isSubmitted && " (Correct Answer)"}
              </Tag>
            );
          })}
        </Space>
      ),
      width: "50%",
    },
    {
      title: "Result",
      key: "result",
      align: "center" as const,
      render: (record: Answer) => {
        if (record.submission_status === "unanswered") {
          return <Tag color="orange">Unanswered</Tag>;
        }
        return (
          <Tag color={record.is_correct ? "green" : "red"}>
            {record.is_correct ? "Correct" : "Incorrect"}
          </Tag>
        );
      },
    },
  ];

  return (
    <StudentLayoutWrapper pageTitle="BORIGAM / Completed Tests">
      <div style={{ padding: "24px" }}>
        <Title level={2}>Completed Tests</Title>

        {error && (
          <Alert
            message="Error"
            description={error}
            type="error"
            showIcon
            style={{ marginBottom: 24 }}
          />
        )}

        {loading ? (
          <Spin
            size="large"
            style={{ display: "flex", justifyContent: "center", marginTop: 40 }}
          />
        ) : (
          <>
            <Card title="Test List" style={{ marginBottom: 24 }}>
              <Table
                dataSource={tests}
                columns={testColumns}
                rowKey="test_id"
                bordered
                onRow={(record) => ({
                  onClick: () => fetchTestResultById(record.test_id),
                })}
                pagination={false}
                style={{ fontSize: 14, width: "100%", cursor: "pointer" }}
              />
            </Card>

            {selectedResult && (
              <>
                <Card title="Test Summary" style={{ marginBottom: 24 }}>
                  <Descriptions bordered column={3}>
                    <Descriptions.Item label="Total Questions">
                      {selectedResult.total_questions}
                    </Descriptions.Item>
                    <Descriptions.Item label="Attempted">
                      {selectedResult.attempted}
                    </Descriptions.Item>
                    <Descriptions.Item label="Unattempted">
                      {selectedResult.unattempted}
                    </Descriptions.Item>
                    <Descriptions.Item label="Correct Answers">
                      <Tag color="green">{selectedResult.correct}</Tag>
                    </Descriptions.Item>
                    <Descriptions.Item label="Wrong Answers">
                      <Tag color="red">{selectedResult.wrong}</Tag>
                    </Descriptions.Item>
                    <Descriptions.Item label="Final Score">
                      <Text strong>{selectedResult.final_score}%</Text>
                    </Descriptions.Item>
                    <Descriptions.Item label="Total Marks Awarded">
                      <Text strong>{selectedResult.total_marks_awarded}</Text>
                    </Descriptions.Item>
                    <Descriptions.Item label="Final Result">
                      <Tag
                        color={
                          selectedResult.final_result === "Pass"
                            ? "green"
                            : "red"
                        }
                      >
                        {selectedResult.final_result}
                      </Tag>
                    </Descriptions.Item>
                  </Descriptions>
                </Card>

                <Card title="Question Details">
                  <Table
                    dataSource={answers}
                    columns={questionColumns}
                    rowKey="question_id"
                    pagination={false}
                    bordered
                  />
                </Card>
              </>
            )}
          </>
        )}
      </div>
    </StudentLayoutWrapper>
  );
};

export default StudentCompletedTest;