import React, { useEffect, useState } from "react";
import {
  Table,
  Spin,
  Tag,
  Modal,
  Form,
  Input,
  Button,
  message,
  Popconfirm,
  Space,
} from "antd";
import { EditOutlined, DeleteOutlined } from "@ant-design/icons";
import LayoutWrapper from "../../components/adminlayout/layoutWrapper";

interface Course {
  course_id: number;
  course_name: string;
}

interface Batch {
  batch_id: number;
  batch_name: string;
  start_date: number;
  end_date: number;
}

interface Student {
  student_id: number;
  firstname: string;
  lastname: string;
  email: string;
  countrycode: string;
  mobileno: string;
  college_name: string | null;
  courses: Course[];
  batches: Batch[];
}

const AllStudents: React.FC = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [form] = Form.useForm();

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = () => {
    setLoading(true);
    fetch("http://13.233.33.133:3001/api/student/getAllStudents", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        token: localStorage.getItem("token") || "",
      },
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return response.json();
      })
      .then((data) => {
        setStudents(data.data || []);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching students:", error);
        setLoading(false);
      });
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleDateString();
  };

  const showEditModal = (student: Student) => {
    setEditingStudent(student);
    form.setFieldsValue({
      firstname: student.firstname,
      lastname: student.lastname,
      email: student.email,
      countrycode: student.countrycode,
      mobileno: student.mobileno,
    });
    setIsModalVisible(true);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    form.resetFields();
  };

  const handleUpdate = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);

      const response = await fetch(
        "http://13.233.33.133:3001/api/student/updateStudent",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            token: localStorage.getItem("token") || "",
          },
          body: JSON.stringify({
            studentId: editingStudent?.student_id,
            ...values,
          }),
        }
      );
      setIsModalVisible(false);
      window.location.reload();

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const result = await response.json();
      if (result.success) {
        message.success("Student updated successfully");
        fetchStudents();

      } else {
        throw new Error(result.message || "Failed to update student");
      }
    } catch (error) {
      console.error("Error updating student:", error);
      message.error(
        error instanceof Error ? error.message : "Failed to update student"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (studentId: number) => {
    try {
      setLoading(true);
      const response = await fetch(
        "http://13.233.33.133:3001/api/student/deleteStudent",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            token: localStorage.getItem("token") || "",
          },
          body: JSON.stringify({ studentId }),
        }
      );

      alert("Deleting student with ID: " + studentId);

      window.location.reload();

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const result = await response.json();
      if (result.ok) {
        message.success("Student deleted successfully");
        fetchStudents();
        window.location.reload();
      } else {
        throw new Error(result.message || "Failed to delete student");
      }
    } catch (error) {
      console.error("Error deleting student:", error);
      message.error(
        error instanceof Error ? error.message : "Failed to delete student"
      );
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    {
      title: "Student Name",
      key: "studentName",
      render: (_: unknown, record: Student) =>
        `${record.firstname} ${record.lastname}`,
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
    },
    {
      title: "Phone Number",
      key: "phoneNumber",
      render: (_: unknown, record: Student) =>
        `${record.countrycode} ${record.mobileno}`,
    },
    {
      title: "Courses",
      key: "courses",
      render: (_: unknown, record: Student) => (
        <div>
          {record.courses.map((course) => (
            <Tag color="blue" key={course.course_id}>
              {course.course_name}
            </Tag>
          ))}
        </div>
      ),
    },
    {
      title: "Batches",
      key: "batches",
      render: (_: unknown, record: Student) => (
        <div>
          {record.batches.map((batch) => (
            <div key={batch.batch_id} style={{ marginBottom: 4 }}>
              <Tag color="green">{batch.batch_name}</Tag>
              <div style={{ fontSize: 12 }}>
                {formatDate(batch.start_date)} to {formatDate(batch.end_date)}
              </div>
            </div>
          ))}
        </div>
      ),
    },
    {
      title: "Action",
      key: "action",
      render: (_: unknown, record: Student) => (
        <Space>
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => showEditModal(record)}
          />
          <Popconfirm
            title="Are you sure to delete this student?"
            onConfirm={() => handleDelete(record.student_id)}
            okText="Yes"
            cancelText="No"
          >
            <Button type="link" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <LayoutWrapper pageTitle="BORIGAM / All Students ">
      <div
        className="enrolled-students-container"
        style={{
          borderRadius: "10px",
          overflow: "hidden",
          background: "white",
          boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
          padding: "10px",
        }}
      >
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
          All Students
        </div>
        {loading ? (
          <Spin
            size="large"
            className="loading-spinner"
            style={{
              display: "flex",
              justifyContent: "center",
              padding: "20px",
            }}
          />
        ) : (
          <Table
            dataSource={students}
            columns={columns}
            rowKey="student_id"
            bordered
            pagination={{ pageSize: 5 }}
          />
        )}

        <Modal
          title="Edit Student Details"
          visible={isModalVisible}
          onOk={handleUpdate}
          onCancel={handleCancel}
          footer={[
            <Button key="back" onClick={handleCancel}>
              Cancel
            </Button>,
            <Button
              key="submit"
              type="primary"
              loading={loading}
              onClick={handleUpdate}
            >
              Update
            </Button>,
          ]}
        >
          <Form form={form} layout="vertical">
            <Form.Item
              name="firstname"
              label="First Name"
              rules={[{ required: true, message: "Please input first name!" }]}
            >
              <Input />
            </Form.Item>
            <Form.Item
              name="lastname"
              label="Last Name"
              rules={[{ required: true, message: "Please input last name!" }]}
            >
              <Input />
            </Form.Item>
            <Form.Item
              name="email"
              label="Email"
              rules={[
                { required: true, message: "Please input email!" },
                { type: "email", message: "Please enter a valid email!" },
              ]}
            >
              <Input />
            </Form.Item>
            <Form.Item
              name="countrycode"
              label="Country Code"
              rules={[
                { required: true, message: "Please input country code!" },
              ]}
            >
              <Input />
            </Form.Item>
            <Form.Item
              name="mobileno"
              label="Mobile Number"
              rules={[
                { required: true, message: "Please input mobile number!" },
              ]}
            >
              <Input />
            </Form.Item>
          </Form>
        </Modal>
      </div>
    </LayoutWrapper>
  );
};

export default AllStudents;
