import React, { useState, useEffect } from "react";
import {
  Card,
  Radio,
  Button,
  Typography,
  Modal,
  Table,
  message,
  Row,
  Col,
  Space,
  Spin,
  Divider,
  Checkbox,
} from "antd";
import StudentLayoutWrapper from "../../components/studentlayout/studentlayoutWrapper";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import TextArea from "antd/es/input/TextArea";
import { useParams } from "react-router-dom";

const { Title, Text } = Typography;

interface Option {
  id: number;
  option_text: string;
  option_image: string | null;
  is_correct?: boolean;
}

interface Question {
  id: number;
  name: string;
  type: string;
  image: string | null;
  total_marks: number; // Add this
  negative_marks: number; // Add this
  options: Option[];
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
}

// interface TestResult {
//   totalQuestions: number;
//   attempted: number;
//   correct: number;
//   wrong: number;
//   finalScore: string;
//   finalResult: string;
//   message: string;
// }
interface SelectedAnswer {
  optionIds?: number[]; // For multiple-choice questions
  optionId?: number | null; // For single-select questions
  text?: string | null;
}

const TestScreen: React.FC = () => {
  const [timeLeft, setTimeLeft] = useState(0);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [selectedAnswers, setSelectedAnswers] = useState<{
    [key: number]: SelectedAnswer;
  }>({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [test] = useState<Test | null>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  // const [testResult, setTestResult] = useState<TestResult | null>(null);
  const [timerActive, setTimerActive] = useState(true);
  const [seenQuestions, setSeenQuestions] = useState<number[]>([]);
  const [testStarted, setTestStarted] = useState(false);
  const { testId } = useParams<{ testId: string }>();
  const [isFinalModalVisible, setIsFinalModalVisible] = useState(false);
  const [finalResult, setFinalResult] = useState<any>(null);
  const testDuration = localStorage.getItem("testDuration");

  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const axiosConfig = { headers: { token: token || "" } };

  const STORAGE_KEY = `test_answers_${testId}`;

  // Prevent context menu and tab switching
  useEffect(() => {
    const handleContextMenu = (e: MouseEvent) => e.preventDefault();
    const handleBlur = () => {
      message.warning("Tab switching is not allowed!");
    };

    window.addEventListener("contextmenu", handleContextMenu);
    window.addEventListener("blur", handleBlur);

    return () => {
      window.removeEventListener("contextmenu", handleContextMenu);
      window.removeEventListener("blur", handleBlur);
    };
  }, []);

  // Timer effect with auto-submit
  useEffect(() => {
    let timer: NodeJS.Timeout;

    if (timerActive && timeLeft > 0) {
      timer = setTimeout(() => {
        setTimeLeft((prevTime) => prevTime - 1);
      }, 1000);
    } else if (timerActive && timeLeft === 0 && testStarted) {
      // Time's up, auto-submit the test
      message.warning("Time's up! Submitting your test...");
      submitFinalResult();
    }

    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [timeLeft, timerActive, testStarted]);

  // Load test and questions
  useEffect(() => {
    const loadTest = async () => {
      try {
        setLoading(true);

        if (!testId) {
          throw new Error("Test ID not found");
        }

        const submissionsResponse = await axios.get(
          `http://localhost:3001/api/testsubmission/getTestQuestionSubmissions?test_id=${testId}`,
          axiosConfig
        );

        const submissions = submissionsResponse.data?.submissions || [];
        // Set a default duration if not available from API (e.g., 30 minutes)
        const durationInMinutes = testDuration ? parseInt(testDuration) : 0;
        setTimeLeft(durationInMinutes * 60);

        const questionsData: Question[] = [];

        if (questionsData.length > 0) {
          setSeenQuestions([questionsData[0].id]);
        }
        for (const submission of submissions) {
          const questionResponse = await axios.get(
            `http://localhost:3001/api/testsubmission/setQuestionStatusUnanswered?test_id=${testId}&question_id=${submission.question_id}`,
            axiosConfig
          );
          questionsData.push(questionResponse.data.question);
        }

        setQuestions(questionsData);

        // Try to load answers from localStorage
        const savedAnswers = localStorage.getItem(STORAGE_KEY);
        let initialAnswers: typeof selectedAnswers = {};

        if (savedAnswers) {
          try {
            initialAnswers = JSON.parse(savedAnswers);
          } catch (e) {
            console.error("Failed to parse saved answers", e);
          }
        }

        // Initialize any missing answers
        questionsData.forEach((q: Question) => {
          if (!initialAnswers[q.id]) {
            initialAnswers[q.id] = { optionId: null, text: null };
          }
        });

        setSelectedAnswers(initialAnswers);
        setTestStarted(true);
        setTimerActive(true);
      } catch (error) {
        console.error("Error loading test:", error);
        message.error("Failed to load test");
        navigate("/student/dashboard");
      } finally {
        setLoading(false);
      }
    };

    loadTest();
  }, [testId]);

  useEffect(() => {
    if (Object.keys(selectedAnswers).length > 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(selectedAnswers));
    }
  }, [selectedAnswers]);

const submitFinalResult = async () => {
  if (!testId) return;
  
  try {
    setSubmitting(true);
    // Auto-save the current answer before submitting
    const currentQ = questions[currentQuestionIndex];
    if (currentQ) {
      const answer = selectedAnswers[currentQ.id];
      if (answer?.optionId || answer?.optionIds?.length || answer?.text) {
        await saveAnswerToServer(currentQ.id, answer);
      }
    }
    
    const response = await axios.get(
      `http://localhost:3001/api/testsubmission/submitFinalResult?test_id=${testId}`,
      axiosConfig
    );
    setFinalResult(response.data.result);
    setIsFinalModalVisible(true);
    
    // Clean up localStorage
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem("testDuration");
    
    setTimerActive(false);
  } catch (error) {
    console.error("Failed to submit final result:", error);
    message.error("Failed to submit final result");
  } finally {
    setSubmitting(false);
  }
};

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  const saveAnswerToServer = async (
    questionId: number,
    answer: SelectedAnswer
  ) => {
    if (!testId) return;

    try {
      const question = questions.find((q) => q.id === questionId);
      if (!question) return;

      // Determine the question type
      const isMultipleChoice = question.type === "multiple_choice";
      const isSingleChoice = question.type === "radio";
      const isText = question.type === "text";

      // Prepare the answer payload
      const answerPayload: any = {
        question_id: questionId,
      };

      if (isText) {
        answerPayload.text = answer.text || "";
      } else {
        answerPayload.text = null;
        if (isMultipleChoice) {
          answerPayload.option_id = answer.optionIds || [];
        } else if (isSingleChoice) {
          answerPayload.option_id = answer.optionId || null;
        }
      }

      const payload = {
        test_id: parseInt(testId),
        answers: [answerPayload],
      };

      const response = await axios.post(
        "http://localhost:3001/api/testsubmission/submitTest",
        payload,
        axiosConfig
      );

      // Check if all questions are answered
      if (response.data.pendingsubmission?.unanswered === 1) {
        // Submit final result using GET
        const finalResponse = await axios.get(
          `http://localhost:3001/api/testsubmission/submitFinalResult?test_id=${testId}`,
          axiosConfig
        );
        setFinalResult(finalResponse.data.result);
        setIsFinalModalVisible(true);
      }

      return response.data;
    } catch (error) {
      console.error("Failed to save answer:", error);
      message.error("Failed to save answer");
      throw error;
    }
  };

  const handleNext = async () => {
    const currentQ = questions[currentQuestionIndex];
    const answer = selectedAnswers[currentQ.id];

    // Submit answer if any option is selected or text is entered
    if (answer?.optionId || answer?.optionIds || answer?.text) {
      await saveAnswerToServer(currentQ.id, answer);
    }

    if (!seenQuestions.includes(currentQ.id)) {
      setSeenQuestions([...seenQuestions, currentQ.id]);
    }

    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      // Check if all questions are answered
      const unanswered = questions.filter(
        (q) =>
          !selectedAnswers[q.id]?.optionId &&
          !selectedAnswers[q.id]?.optionIds?.length &&
          !selectedAnswers[q.id]?.text
      ).length;

      if (unanswered === 1) {
        // All questions answered - submit final result using GET
        try {
          setSubmitting(true);
          const response = await axios.get(
            `http://localhost:3001/api/testsubmission/submitFinalResult?test_id=${testId}`,
            axiosConfig
          );
          setFinalResult(response.data.result);
          setIsFinalModalVisible(true);
          localStorage.removeItem(STORAGE_KEY);
        } catch (error) {
          console.error("Failed to submit final result:", error);
          message.error("Failed to submit final result");
        } finally {
          setSubmitting(false);
        }
      } else {
        // Show regular completion modal
        setIsModalVisible(true);
        setTimerActive(false);
        localStorage.removeItem(STORAGE_KEY);
      }
    }
  };

  const handlePrevious = () => {
    const currentQ = questions[currentQuestionIndex];

    // Mark current question as seen
    if (!seenQuestions.includes(currentQ.id)) {
      setSeenQuestions([...seenQuestions, currentQ.id]);
    }

    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const handleQuestionNavigation = (index: number) => {
    const questionId = questions[index].id;
    if (!seenQuestions.includes(questionId)) {
      setSeenQuestions([...seenQuestions, questionId]);
    }
    setCurrentQuestionIndex(index);
  };

  useEffect(() => {
    return () => {
      // Only clear if test is not completed
      if (!isModalVisible) {
        localStorage.removeItem(STORAGE_KEY);
      }
    };
  }, [isModalVisible]);

  const currentQuestion: Question | undefined = questions[currentQuestionIndex];

  if (loading) {
    return (
      <StudentLayoutWrapper pageTitle="Test">
        <div style={{ padding: "20px", textAlign: "center" }}>
          <Spin size="large" />
          <Text>Loading test information...</Text>
        </div>
      </StudentLayoutWrapper>
    );
  }
  if (!testStarted && !loading && (!test || questions.length === 0)) {
    return (
      <StudentLayoutWrapper pageTitle="Test">
        <div
          style={{
            height: "70vh",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            flexDirection: "column",
          }}
        >
          <Card
            style={{
              textAlign: "center",
              padding: "40px",
              border: "2px dashed #FFA500",
              borderRadius: "16px",
              backgroundColor: "#fffbe6",
            }}
          >
            <Title level={2} style={{ color: "#fa8c16" }}>
              No Tests Available
            </Title>
            <Text type="secondary">
              There are currently no tests available for you to take.
              <br />
              Please check back later or contact your instructor.
            </Text>
            <div style={{ marginTop: 20 }}>
              <Button
                type="primary"
                onClick={() => navigate("/student/dashboard")}
              >
                Return to Dashboard
              </Button>
            </div>
          </Card>
        </div>
      </StudentLayoutWrapper>
    );
  }

  return (
    <StudentLayoutWrapper pageTitle="Test">
      <div style={{ padding: "20px" }}>
        <Row gutter={16}>
          <Col xs={24} lg={18}>
            <Card>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginBottom: "10px",
                }}
              >
                <Text>Total Questions: {questions.length}</Text>
                <Text>
                  Attempted:{" "}
                  {
                    Object.values(selectedAnswers).filter(
                      (answer) =>
                        answer.optionId !== null || answer.text !== null
                    ).length
                  }
                  /{questions.length}
                </Text>
                <Text style={{ color: "red" }}>
                  Time Remaining: {formatTime(timeLeft)}
                </Text>
              </div>
              <Divider />
              <div style={{ marginBottom: 20 }}>
                <Title level={4}>
                  {currentQuestionIndex + 1}. {currentQuestion?.name}
                </Title>
                {currentQuestion?.image && (
                  <img
                    src={currentQuestion.image}
                    alt="Question visual"
                    style={{
                      width: "100%",
                      height: "200px",
                      objectFit: "contain",
                    }}
                  />
                )}

                {currentQuestion?.type === "text" ? (
                  <TextArea
                    placeholder="Type your answer here..."
                    value={selectedAnswers[currentQuestion.id]?.text || ""}
                    onChange={(e) =>
                      setSelectedAnswers({
                        ...selectedAnswers,
                        [currentQuestion.id]: {
                          optionId: null,
                          text: e.target.value,
                        },
                      })
                    }
                    style={{ marginTop: 16 }}
                    rows={4}
                  />
                ) : currentQuestion?.type === "radio" ? (
                  <Radio.Group
                    onChange={(e) =>
                      setSelectedAnswers({
                        ...selectedAnswers,
                        [currentQuestion.id]: {
                          optionId: e.target.value,
                          text: null,
                        },
                      })
                    }
                    value={
                      selectedAnswers[currentQuestion.id]?.optionId || null
                    }
                  >
                    {currentQuestion?.options.map((option) => (
                      <Radio
                        key={option.id}
                        value={option.id}
                        style={{ display: "block", margin: "10px 0" }}
                      >
                        {option.option_text}
                        {option.option_image && (
                          <img
                            src={option.option_image}
                            alt="Option visual"
                            style={{
                              maxWidth: "100%",
                              maxHeight: "100px",
                              marginLeft: "10px",
                            }}
                          />
                        )}
                      </Radio>
                    ))}
                  </Radio.Group>
                ) : currentQuestion?.type === "multiple_choice" ? (
                  <div>
                    {currentQuestion?.options.map((option) => (
                      <div key={option.id} style={{ margin: "10px 0" }}>
                        <Checkbox
                          checked={
                            selectedAnswers[
                              currentQuestion.id
                            ]?.optionIds?.includes(option.id) || false
                          }
                          onChange={(e) => {
                            const currentSelected =
                              selectedAnswers[currentQuestion.id]?.optionIds ||
                              [];
                            let newOptionIds;

                            if (e.target.checked) {
                              newOptionIds = [...currentSelected, option.id];
                            } else {
                              newOptionIds = currentSelected.filter(
                                (id) => id !== option.id
                              );
                            }

                            setSelectedAnswers({
                              ...selectedAnswers,
                              [currentQuestion.id]: {
                                ...selectedAnswers[currentQuestion.id],
                                optionIds: newOptionIds,
                                optionId: null,
                                text: null,
                              },
                            });
                          }}
                        >
                          {option.option_text}
                          {option.option_image && (
                            <img
                              src={option.option_image}
                              alt="Option visual"
                              style={{
                                maxWidth: "100%",
                                maxHeight: "100px",
                                marginLeft: "10px",
                              }}
                            />
                          )}
                        </Checkbox>
                      </div>
                    ))}
                  </div>
                ) : null}
              </div>

              <Space>
                <Button
                  type="primary"
                  onClick={handlePrevious}
                  disabled={currentQuestionIndex === 0 || submitting}
                >
                  Previous
                </Button>
                <Button
                  type="primary"
                  onClick={
                    currentQuestionIndex === questions.length - 1
                      ? handleNext
                      : handleNext
                  }
                  disabled={submitting}
                >
                  {submitting ? (
                    <Spin size="small" />
                  ) : currentQuestionIndex === questions.length - 1 ? (
                    "Submit"
                  ) : (
                    "Next"
                  )}
                </Button>
              </Space>
            </Card>
          </Col>

          <Col xs={24} lg={6}>
            <Card title="Answer Status" bordered>
              <Space direction="vertical" size="small">
                <Space>
                  <div
                    style={{ background: "#52c41a", width: 20, height: 20 }}
                  />{" "}
                  <Text>Attempted</Text>
                </Space>
                <Space>
                  <div
                    style={{ background: "#1890ff", width: 20, height: 20 }}
                  />{" "}
                  <Text>Seen but Not Answered</Text>
                </Space>
                <Space>
                  <div
                    style={{ background: "#faad14", width: 20, height: 20 }}
                  />{" "}
                  <Text>Not Seen</Text>
                </Space>
              </Space>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(5, 1fr)",
                  gap: 10,
                  marginTop: 20,
                }}
              >
                {questions.map((q, index) => {
                  const answered =
                    (selectedAnswers[q.id]?.optionIds?.length || 0) > 0 ||
                    selectedAnswers[q.id]?.optionId !== null ||
                    selectedAnswers[q.id]?.text !== null;
                  const seen = seenQuestions.includes(q.id);

                  let bgColor = "#faad14"; // Gold - not seen
                  let textColor = "#000";

                  if (answered) {
                    bgColor = "#52c41a"; // Green - answered
                    textColor = "#fff";
                  } else if (seen) {
                    bgColor = "#1890ff"; // Blue - seen but not answered
                    textColor = "#fff";
                  }

                  return (
                    <Button
                      key={q.id}
                      type="default"
                      style={{
                        backgroundColor: bgColor,
                        color: textColor,
                      }}
                      onClick={() => handleQuestionNavigation(index)}
                    >
                      {index + 1}
                    </Button>
                  );
                })}
              </div>
            </Card>
            <Card title="Marks Information" bordered style={{ marginTop: 20 }}>
              <Space
                direction="vertical"
                size="middle"
                style={{ width: "100%" }}
              >
                <div
                  style={{
                    border: "2px solid #52c41a", // Green border
                    borderRadius: "4px",
                    padding: "8px 16px",
                    backgroundColor: "#f6ffed", // Light green background
                    textAlign: "center",
                    width: "100%",
                  }}
                >
                  <Text strong style={{ color: "#52c41a" }}>
                    Total Marks:
                  </Text>{" "}
                  <Text strong style={{ fontSize: "16px" }}>
                    {currentQuestion?.total_marks}
                  </Text>
                </div>
                <div
                  style={{
                    border: "2px solid #ff4d4f", // Red border
                    borderRadius: "4px",
                    padding: "8px 16px",
                    backgroundColor: "#fff2f0", // Light red background
                    textAlign: "center",
                    width: "100%",
                  }}
                >
                  <Text strong style={{ color: "#ff4d4f" }}>
                    Negative Marks:
                  </Text>{" "}
                  <Text strong style={{ fontSize: "16px" }}>
                    {currentQuestion?.negative_marks}
                  </Text>
                </div>
              </Space>
            </Card>
          </Col>
        </Row>

        {/* <Modal
          title="Test Result"
          open={isModalVisible}
          onOk={handleModalOk}
          onCancel={handleModalOk}
          okText="OK"
          width={800}
          footer={[
            <Button key="submit" type="primary" onClick={handleModalOk}>
              OK
            </Button>,
          ]}
        >
          {testResult && (
            <Table
              dataSource={[
                {
                  key: "1",
                  label: "Total Questions",
                  value: testResult.totalQuestions,
                },
                { key: "2", label: "Attempted", value: testResult.attempted },
                { key: "3", label: "Correct", value: testResult.correct },
                { key: "4", label: "Wrong", value: testResult.wrong },
                {
                  key: "5",
                  label: "Final Score",
                  value: `${testResult.finalScore}%`,
                },
                {
                  key: "6",
                  label: "Final Result",
                  value: testResult.finalResult,
                },
              ]}
              columns={[
                { title: "Details", dataIndex: "label", key: "label" },
                { title: "Result", dataIndex: "value", key: "value" },
              ]}
              pagination={false}
              bordered
            />
          )}
        </Modal> */}
        <Modal
          title="Test Completed"
          open={isFinalModalVisible}
          onOk={() => {
            setIsFinalModalVisible(false);
            navigate("/student/CompletedTest");
          }}
          footer={[
            <Button
              key="submit"
              type="primary"
              onClick={() => {
                setIsFinalModalVisible(false);
                navigate("/student/CompletedTest");
              }}
            >
              OK
            </Button>,
          ]}
          width={700}
        >
          {finalResult && (
            <Table
              dataSource={[
                {
                  key: "1",
                  label: "Total Questions",
                  value: finalResult.total_questions,
                },
                { key: "2", label: "Attempted", value: finalResult.attempted },
                {
                  key: "3",
                  label: "Unattempted",
                  value: finalResult.unattempted,
                },
                {
                  key: "4",
                  label: "Correct Answers",
                  value: finalResult.correct,
                },
                { key: "5", label: "Wrong Answers", value: finalResult.wrong },
                {
                  key: "6",
                  label: "Final Score",
                  value: `${finalResult.final_score}%`,
                },
                {
                  key: "7",
                  label: "Final Result",
                  value: finalResult.final_result,
                },
                {
                  key: "8",
                  label: "Marks Awarded",
                  value: finalResult.marks_awarded,
                },
                {
                  key: "9",
                  label: "Marks Deducted",
                  value: finalResult.marks_deducted,
                },
                {
                  key: "10",
                  label: "Total Marks Awarded",
                  value: finalResult.total_marks_awarded,
                },
              ]}
              columns={[
                { title: "Details", dataIndex: "label", key: "label" },
                { title: "Result", dataIndex: "value", key: "value" },
              ]}
              pagination={false}
              bordered
            />
          )}
        </Modal>
      </div>
    </StudentLayoutWrapper>
  );
};

export default TestScreen;
