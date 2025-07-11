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
import CollegeLayoutWrapper from "../../components/collegeLayout/collegeLayoutWrapper";
import { useParams, useNavigate } from "react-router-dom";

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
  image?: File | string | null;
}

const AddQuestionsCollege = () => {
  const { collegeId } = useParams();
  const navigate = useNavigate();
  const [courses, setCourses] = useState<Course[]>([]);
  const questionTypes = ["radio", "multiple_choice", "text"];
  const [selectedCourse, setSelectedCourse] = useState<string>("");
  const [selectedCourseId, setSelectedCourseId] = useState<number | null>(null);
  const [questionText, setQuestionText] = useState<string>("");
  const [explanation, setExplanation] = useState<string>("");

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

  const handleOptionImageChange = (index: number, file: File | string | null) => {
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
      setOptions((prev) =>
        prev.map((opt, i) =>
          i === index ? { ...opt, is_correct: isCorrect } : opt
        )
      );
    }
  };

  const handleQuestionTypeChange = (type: string) => {
    setQuestionType(type);
    if (type !== "text") {
      setOptions([
        { option_text: "", is_correct: false },
        { option_text: "", is_correct: false },
        { option_text: "", is_correct: false },
        { option_text: "", is_correct: false },
      ]);
      setTextAnswer(""); 
    } else {
      setOptions([
        { option_text: "", is_correct: false },
        { option_text: "", is_correct: false },
        { option_text: "", is_correct: false },
        { option_text: "", is_correct: false },
      ]);
    }
  };

  const beforeUpload = (file: File) => {
    const isImage = file.type.startsWith("image/");
    if (!isImage) {
      message.error("You can only upload image files!");
    }
    return isImage;
  };

  const validateForm = () => {
    if (!questionText || !questionType || !selectedCourseId) {
      message.error("Please fill in all required fields.");
      return false;
    }

    // Validation for radio and multiple_choice questions
    if (questionType === "radio" || questionType === "multiple_choice") {
      const hasCorrectOption = options.some((option) => option.is_correct);
      if (!hasCorrectOption) {
        message.warning("Mark at least one option as correct answer.");
        return false;
      }
    }

    // Validation for text questions
    if (questionType === "text" && !textAnswer.trim()) {
      message.error("Please provide an expected answer for text questions.");
      return false;
    }

    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    const formData = new FormData();
    formData.append("name", questionText);
    formData.append(
      "type",
      questionType === "multiple_choice"
        ? "multiple_choice"
        : questionType.toLowerCase().replace(" ", "_")
    );
    formData.append("course_id", (selectedCourseId ?? "").toString());
    formData.append("total_marks", totalMarks.toString());
    formData.append("negative_marks", negativeMarks.toString());
    formData.append("explanation", explanation);

    if (questionType === "text") {
      formData.append("correct_answer", JSON.stringify({ textAnswer }));
    } else {
      const validOptions = options.filter(
        (option) => option.option_text.trim() !== ""
      );
      const optionsData = validOptions.map((option) => ({
        option_text: option.option_text,
        is_correct: option.is_correct,
      }));
      formData.append("options", JSON.stringify(optionsData));

      // Handle option images only for non-text questions
      const imageOptions = validOptions
        .map((option) => option.image)
        .filter((image) => image instanceof File);

      console.log("imageOptions", imageOptions);
   
      if (imageOptions.length > 0) {
        imageOptions.forEach((image: File, index: number) => {
          formData.append(`imageOption${index + 1}`, image as File);
        });
      }
    }

    if (questionImageFile) {
      formData.append("image", questionImageFile);
    }

    console.log("Form Data:", formData);

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

      window.location.reload()

      if (!response.ok) throw new Error("Failed to submit question");

      message.success("Question submitted successfully!");
      setIsModalVisible(false);

      // Reset form
      setSelectedCourse("");
      setSelectedCourseId(null);
      setQuestionText("");
      setQuestionType("");
      setOptions([
        { option_text: "", is_correct: false },
        { option_text: "", is_correct: false },
        { option_text: "", is_correct: false },
        { option_text: "", is_correct: false },
      ]);
      setQuestionImageFile(null);
      setTotalMarks(1);
      setNegativeMarks(0);
      setTextAnswer("");
      setExplanation("");
      // Navigate back to college dashboard
      navigate(`/college/dashboard`);
    } catch (error) {
      console.error("Error submitting question:", error);
      message.error("Failed to add question.");
    }
  };

  const handlePreSubmit = () => {
    if (!validateForm()) {
      return;
    }
    setIsModalVisible(true);
  };

  return (
    <CollegeLayoutWrapper pageTitle="Add Question">
      <Card className="w-1/2 mx-auto p-6">
        <Form layout="vertical">
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
              rows={6}
              value={questionText}
              onChange={(e) => setQuestionText(e.target.value)}
              placeholder="Enter your question here.."
              style={{
                minHeight: "140px",
                fontSize: "14px",
                fontFamily: "monospace, sans-serif",
                resize: "vertical",
              }}
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
              min={0.01}
              step={0.01}
              value={totalMarks}
              onChange={(value) => setTotalMarks(Number(value) || 1)}
            />
          </Form.Item>

          <Form.Item label="Negative Marks">
            <InputNumber
              min={0}
              step={0.01}
              value={negativeMarks}
              onChange={(value) => setNegativeMarks(Number(value) || 0)}
            />
          </Form.Item>

          {(questionType === "radio" || questionType === "multiple_choice") && (
            <>
              {options.map((option, index) => (
                <div key={index} style={{ marginBottom: 16 }}>
                  <Form.Item label={`Option ${index + 1}`}>
                    <TextArea
                      rows={3}
                      value={option.option_text}
                      onChange={(e) =>
                        handleOptionChange(index, e.target.value)
                      }
                      placeholder={`Enter option ${index + 1}`}
                      style={{
                        minHeight: "70px",
                        fontSize: "10px",
                        fontFamily: "monospace, sans-serif",
                        resize: "vertical",
                      }}
                      
                    />
                  </Form.Item>
                  <Form.Item>
                    <input
                      type={questionType === "radio" ? "radio" : "checkbox"}
                      checked={option.is_correct}
                      onChange={(e) =>
                        handleCorrectOptionChange(index, e.target.checked)
                      }
                      style={{ marginRight: 8 }}
                      name={
                        questionType === "radio"
                          ? "correctOption"
                          : `correctOption${index}`
                      }
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
                        <div style={{ marginTop: 8 }}>
                          <span style={{ marginRight: 8 }}>
                            {typeof option.image === 'string' ? 'Image uploaded' : option.image.name}
                          </span>
                          {typeof option.image === 'string' && (
                            <img 
                              src={option.image} 
                              alt={`Option ${index + 1}`}
                              style={{ 
                                maxWidth: '200px', 
                                maxHeight: '100px', 
                                objectFit: 'contain',
                                display: 'block',
                                marginTop: '4px'
                              }}
                            />
                          )}
                        </div>
                      )}
                    </Upload>
                  </Form.Item>
                </div>
              ))}
            </>
          )}

          {questionType === "text" && (
            <Form.Item label="Expected Answer (for reference):" required>
              <TextArea
                rows={4}
                value={textAnswer}
                onChange={(e) => setTextAnswer(e.target.value)}
                placeholder="Enter the expected answer for text questions"
              />
            </Form.Item>
          )}

          <Form.Item label="Explanation (Optional)">
            <TextArea
              rows={4}
              value={explanation}
              onChange={(e) => setExplanation(e.target.value)}
              placeholder="Enter your explanation"
              style={{
                minHeight: "70px",
                fontSize: "10px",
                fontFamily: "monospace, sans-serif",
                resize: "vertical",
              }}
            />
          </Form.Item>

          <Button type="primary" className="mt-4" onClick={handlePreSubmit}>
            Submit
          </Button>
        </Form>
      </Card>

      <Modal
        title="Confirm Submission"
        open={isModalVisible}
        onOk={handleSubmit}
        onCancel={() => setIsModalVisible(false)}
        okText="Submit"
      >
        <p>Are you sure you want to submit this question?</p>
        {selectedCourse && (
          <Text type="secondary">Course: {selectedCourse}</Text>
        )}
        <br />
      </Modal>
    </CollegeLayoutWrapper>
  );
};

export default AddQuestionsCollege;