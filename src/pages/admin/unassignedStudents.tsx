import React, { useEffect, useState } from "react";
import { Table, Spin, Button, Modal, Select, message } from "antd";
import LayoutWrapper from "../../components/adminlayout/layoutWrapper";
import axios from "axios";

const { Option } = Select;

interface Student {
  student_id: number;
  firstname: string;
  lastname: string;
  email: string;
  countrycode: string;
  mobileno: string;
  college_name: string;
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

const UnassignedStudents: React.FC = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [courses, setCourses] = useState<Course[]>([]);
  const [batches, setBatches] = useState<Batch[]>([]);
  const [filteredBatches, setFilteredBatches] = useState<Batch[]>([]);
  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [selectedCourse, setSelectedCourse] = useState<number | null>(null);
  const [selectedBatch, setSelectedBatch] = useState<number | null>(null);

  const token = localStorage.getItem("token");

  useEffect(() => {
    setLoading(true);
    fetch("http://13.233.33.133:3001/api/student/getUnassignedStudentsList", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        token: token || "",
      },
    })
      .then((response) => response.json())
      .then((data) => {
        setStudents(data.data || []);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching students:", error);
        setLoading(false);
      });

    fetchCourses();
    fetchBatches();
  }, []);

  const fetchCourses = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      console.error("No token found, authentication required");
      return;
    }
    try {
      const response = await fetch(
        "http://13.233.33.133:3001/api/course/getCourses",
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
      const data: Course[] = await response.json();
      setCourses(data);
    } catch (error) {
      console.error("Error fetching courses:", error);
    }
  };

  const fetchBatches = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      console.error("No token found, authentication required");
      return;
    }
    try {
      const response = await fetch(
        "http://13.233.33.133:3001/api/course/viewAllBatches",
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
      setBatches(data.data || []);
    } catch (error) {
      console.error("Error fetching batches:", error);
    }
  };

  const handleCourseChange = (value: number) => {
    setSelectedCourse(value);
    setSelectedBatch(null); // Reset batch selection when course changes
    // Filter batches based on selected course
    const filtered = batches.filter(batch => batch.course_id === value);
    setFilteredBatches(filtered);
  };

  const openModal = (student: Student) => {
    setSelectedStudent(student);
    setModalVisible(true);
    setSelectedCourse(null);
    setSelectedBatch(null);
    setFilteredBatches([]);
  };

  const handleAssignCourse = async () => {
    if (!selectedStudent || !selectedCourse || !selectedBatch) {
      message.error("Please select a course and batch.");
      return;
    }

    const payload = {
      studentId: selectedStudent.student_id,
      courseId: selectedCourse,
      batchId: selectedBatch
    };

    try {
      await axios.post(
        "http://13.233.33.133:3001/api/student/assignStudentToCourse",
        payload,
        { headers: { token: token || "" } }
      );
      message.success("Course assigned successfully!");
      setModalVisible(false);
      window.location.reload();
    } catch (error) {
      message.error("Error assigning course.");
      console.error("Error:", error);
    }
  };

  const columns = [
    {
      title: "Student Name",
      key: "studentName",
      render: (_: unknown, record: Student) =>
        `${record.firstname} ${record.lastname}`,
    },
    { title: "Email", dataIndex: "email", key: "email" },
    {
      title: "Phone Number",
      key: "phoneNumber",
      render: (_: unknown, record: Student) =>
        `${record.countrycode} ${record.mobileno}`,
    },
    {
      title: "College Name",
      dataIndex: "college_name",
      key: "collegeName",
      render: (_: unknown, record: Student) => record.college_name || "",
    },
    {
      title: "Assign Course",
      key: "assignCourse",
      render: (_: unknown, record: Student) => (
        <Button type="primary" onClick={() => openModal(record)}>
          Assign Course
        </Button>
      ),
    },
  ];

  return (
    <LayoutWrapper pageTitle="BORIGAM / Unassigned Students">
      <div className="enrolled-students-container" style={containerStyle}>
        <div
          className="header"
          style={{
            backgroundColor: "gold",
            color: "black",
            fontSize: "18px",
            fontWeight: "bold",
            padding: "10px",
            textAlign: "center",
          }}
        >
          Unassigned Students
        </div>
        {loading ? (
          <Spin size="large" style={spinnerStyle} />
        ) : (
          <Table
            dataSource={students}
            columns={columns}
            rowKey="student_id"
            bordered
            pagination={{ pageSize: 5 }}
          />
        )}
      </div>

      {/* Modal for Assigning Course */}
      <Modal
        title="Assign Course"
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        onOk={handleAssignCourse}
        okText="Assign"
      >
        <p>
          <strong>Student:</strong> {selectedStudent?.firstname}{" "}
          {selectedStudent?.lastname}
        </p>
        <Select
          placeholder="Select Course"
          style={{ width: "100%", marginBottom: 16 }}
          onChange={handleCourseChange}
          value={selectedCourse}
        >
          {courses.map((course) => (
            <Option key={course.id} value={course.id}>
              {course.name}
            </Option>
          ))}
        </Select>
        
        <Select
          placeholder="Select Batch"
          style={{ width: "100%", marginBottom: 16 }}
          onChange={(value) => setSelectedBatch(value)}
          value={selectedBatch}
          disabled={!selectedCourse}
        >
          {filteredBatches.map((batch) => (
            <Option key={batch.batch_id} value={batch.batch_id}>
              {batch.name}
            </Option>
          ))}
        </Select>
      </Modal>
    </LayoutWrapper>
  );
};

export default UnassignedStudents;

// Styles
const containerStyle = {
  borderRadius: "10px",
  overflow: "hidden",
  background: "white",
  boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
  padding: "10px",
};

const spinnerStyle = {
  display: "flex",
  justifyContent: "center",
  padding: "20px",
};