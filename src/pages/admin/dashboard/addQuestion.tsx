import { useEffect, useState } from "react";
import {
  Form,
  Select,
  Button,
  Card,
  Input,
  message,
  Modal,
  Typography,
  InputNumber,
  Upload,
} from "antd";
import { UploadOutlined } from "@ant-design/icons";

import LayoutWrapper from "../../../components/adminlayout/layoutWrapper";
const { Option } = Select;
const { Text } = Typography;
const { TextArea } = Input;

interface Course {
  id: number;
  name: string;
  status: string;
}

interface QuestionOption {
  option_text: string;
  is_correct: boolean;
  image?: File | null;
}

const AddQuestions = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const questionTypes = ["radio", "multiple_choice", "text"];
  const [selectedCourse, setSelectedCourse] = useState<string>("");
  const [selectedCourseId, setSelectedCourseId] = useState<number | null>(null);
  const [questionText, setQuestionText] = useState<string>("");
  const [questionType, setQuestionType] = useState<string>("");
  const [options, setOptions] = useState<QuestionOption[]>([
    { option_text: "", is_correct: false },
    { option_text: "", is_correct: false },
    { option_text: "", is_correct: false },
    { option_text: "", is_correct: false },
  ]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [questionImageFile, setQuestionImageFile] = useState<File | null>(null);
  const [totalMarks, setTotalMarks] = useState<number>(1);
  const [negativeMarks, setNegativeMarks] = useState<number>(0);
  const [textAnswer, setTextAnswer] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const coursesResponse = await fetch(
          "http://13.233.33.133:3001/api/course/getCourses",
          {
            headers: {
              "Content-Type": "application/json",
              token: localStorage.getItem("token") || "",
            },
          }
        );

        if (!coursesResponse.ok) throw new Error("Failed to fetch courses");
        const coursesData = await coursesResponse.json();
        setCourses(coursesData);
      } catch (error) {
        console.error("Error fetching data:", error);
        message.error("Failed to load data");
      }
    };

    fetchData();
  }, []);

  const handleOptionChange = (index: number, text: string) => {
    setOptions((prev) =>
      prev.map((opt, i) => (i === index ? { ...opt, option_text: text } : opt))
    );
  };

  const handleOptionImageChange = (index: number, file: File | null) => {
    setOptions((prev) =>
      prev.map((opt, i) => (i === index ? { ...opt, image: file } : opt))
    );
  };

  const handleCorrectOptionChange = (index: number, isCorrect: boolean) => {
    if (questionType === "radio") {
      setOptions((prev) =>
        prev.map((opt, i) => ({ ...opt, is_correct: i === index }))
      );
    } else if (questionType === "multiple_choice") {
      // Updated
      setOptions((prev) =>
        prev.map((opt, i) =>
          i === index ? { ...opt, is_correct: isCorrect } : opt
        )
      );
    }
  };

  const handleQuestionTypeChange = (type: string) => {
    setQuestionType(type);
    // Reset options when question type changes
    if (type !== "text") {
      setOptions([
        { option_text: "", is_correct: false },
        { option_text: "", is_correct: false },
        { option_text: "", is_correct: false },
        { option_text: "", is_correct: false },
      ]);
    } else {
      setTextAnswer("");
    }
  };

  const beforeUpload = (file: File) => {
    const isImage = file.type.startsWith("image/");
    if (!isImage) {
      message.error("You can only upload image files!");
    }
    return isImage;
  };

  const handleSubmit = async () => {
    if (!questionText || !questionType || !selectedCourseId) {
      message.error("Please fill in all required fields.");
      return;
    }

    const formData = new FormData();
    formData.append("name", questionText);
    formData.append(
      "type",
      questionType === "multiple_choice"
        ? "multiple_choice"
        : questionType.toLowerCase().replace(" ", "_")
    ); // Updated
    formData.append("course_id", selectedCourseId.toString());
    formData.append("total_marks", totalMarks.toString());
    formData.append("negative_marks", negativeMarks.toString());

    if (questionType === "text") {
      formData.append("correct_answer", JSON.stringify({ textAnswer }));
      formData.append("options", JSON.stringify([]));
    } else {
      const optionsData = options.map((option) => ({
        option_text: option.option_text,
        is_correct: option.is_correct,
      }));
      formData.append("options", JSON.stringify(optionsData));

      const imageOptions = options
        .map((option) => option.image)
        .filter((image) => image !== null);

      imageOptions.forEach((image, index) => {
        if (image) {
          formData.append(`imageOptions[${index}]`, image);
        }
      });
    }

    if (questionImageFile) {
      formData.append("image", questionImageFile);
    }

    try {
      const response = await fetch(
        "http://13.233.33.133:3001/api/question/createQuestion",
        {
          method: "POST",
          headers: {
            token: localStorage.getItem("token") || "",
          },
          body: formData,
        }
      );

      if (!response.ok) throw new Error("Failed to submit question");

      message.success("Question added successfully!");
      setIsModalVisible(true);
    } catch (error) {
      console.error("Error submitting question:", error);
      message.error("Failed to add question.");
    }
  };

  const handleModalOk = () => {
    setIsModalVisible(false);
    window.location.reload();
  };

  return (
    <LayoutWrapper pageTitle="BORIGAM / Add Question">
      <Card className="w-1/2 mx-auto p-6">
        <Form layout="vertical" onFinish={handleSubmit}>
          <Form.Item
            label="Select Course:"
            name="course"
            rules={[{ required: true }]}
          >
            <Select
              onChange={(value) => {
                const selectedCourse = courses.find(
                  (course) => course.name === value
                );
                setSelectedCourse(selectedCourse?.name || "");
                setSelectedCourseId(selectedCourse?.id || null);
              }}
              value={selectedCourse}
              placeholder="Select Course"
            >
              {courses.map((course) => (
                <Option key={course.id} value={course.name}>
                  {course.name}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item label="Question:" required>
            <TextArea
              rows={4}
              value={questionText}
              onChange={(e) => setQuestionText(e.target.value)}
              placeholder="Enter your question"
            />
          </Form.Item>

          <Form.Item label="Upload Question Image (optional)">
            <Upload
              beforeUpload={beforeUpload}
              onChange={(info) => {
                if (info.file.status !== "uploading") {
                  setQuestionImageFile(info.file.originFileObj || null);
                }
              }}
              showUploadList={false}
            >
              <Button icon={<UploadOutlined />}>Click to Upload</Button>
              {questionImageFile && (
                <span style={{ marginLeft: 8 }}>{questionImageFile.name}</span>
              )}
            </Upload>
          </Form.Item>

          <Form.Item
            label="Select Question Type:"
            name="questionType"
            rules={[{ required: true }]}
          >
            <Select
              onChange={handleQuestionTypeChange}
              value={questionType}
              placeholder="Select"
            >
              {questionTypes.map((type) => (
                <Option key={type} value={type}>
                  {type}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item label="Total Marks" required>
            <InputNumber
              min={1}
              value={totalMarks}
              onChange={(value) => setTotalMarks(value || 1)}
            />
          </Form.Item>

          <Form.Item label="Negative Marks">
            <InputNumber
              min={0}
              value={negativeMarks}
              onChange={(value) => setNegativeMarks(value || 0)}
            />
          </Form.Item>

          {(questionType === "radio" || questionType === "multiple_choice") && (
            <>
              {options.map((option, index) => (
                <div key={index} style={{ marginBottom: 16 }}>
                  <Form.Item label={`Option ${index + 1}`}>
                    <Input
                      value={option.option_text}
                      onChange={(e) =>
                        handleOptionChange(index, e.target.value)
                      }
                      placeholder={`Enter option ${index + 1}`}
                    />
                  </Form.Item>
                  <Form.Item>
                    <input
                      type={questionType === "radio" ? "radio" : "checkbox"} // This line is key
                      checked={option.is_correct}
                      onChange={(e) =>
                        handleCorrectOptionChange(index, e.target.checked)
                      }
                      style={{ marginRight: 8 }}
                      name={
                        questionType === "radio"
                          ? "correctOption"
                          : `correctOption${index}`
                      } // Group radios, separate checkboxes
                    />
                    Mark as Correct Answer
                  </Form.Item>
                  <Form.Item label="Option Image (optional)">
                    <Upload
                      beforeUpload={beforeUpload}
                      onChange={(info) => {
                        if (info.file.status !== "uploading") {
                          handleOptionImageChange(
                            index,
                            info.file.originFileObj || null
                          );
                        }
                      }}
                      showUploadList={false}
                    >
                      <Button icon={<UploadOutlined />}>Upload Image</Button>
                      {option.image && (
                        <span style={{ marginLeft: 8 }}>
                          {option.image.name}
                        </span>
                      )}
                    </Upload>
                  </Form.Item>
                </div>
              ))}
            </>
          )}

          {questionType === "text" && (
            <Form.Item label="Expected Answer (for reference):">
              <TextArea
                rows={4}
                value={textAnswer}
                onChange={(e) => setTextAnswer(e.target.value)}
                placeholder="Enter the expected answer for text questions"
              />
            </Form.Item>
          )}

          <Button type="primary" htmlType="submit" className="mt-4">
            Submit
          </Button>
        </Form>
      </Card>

      <Modal
        title="Success"
        open={isModalVisible}
        onOk={handleModalOk}
        onCancel={handleModalOk}
        okText="OK"
      >
        <p>Question added successfully!</p>
        {selectedCourse && (
          <Text type="secondary">Course: {selectedCourse}</Text>
        )}
        <br />
      </Modal>
    </LayoutWrapper>
  );
};

export default AddQuestions;
