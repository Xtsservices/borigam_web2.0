import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import LayoutWrapper from "../../../components/adminlayout/layoutWrapper";
import { Table, Card, message, Tag, Descriptions } from "antd";

interface Student {
  student_id: number;
  firstname: string;
  lastname: string;
  email: string;
  countrycode: string;
  mobileno: string;
  status: number;
  college_id: number | null;
  college_name: string | null;
  courses: {
    course_id: number;
    course_name: string;
  }[];
  batches: {
    batch_id: number;
    batch_name: string;
    start_date: number;
    end_date: number;
  }[];
}

const BatchStudents = () => {
  const { batchId } = useParams<{ batchId: string }>();
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchBatchStudents = async () => {
      try {
        setLoading(true);
        const response = await fetch(
          `http://localhost:3001/api/student/getAllStudents?batchId=${batchId}`,
          {
            headers: {
              "Content-Type": "application/json",
              token: localStorage.getItem("token") || "",
            },
          }
        );

        if (!response.ok) throw new Error("Failed to fetch students");

        const result = await response.json();
        setStudents(result.data || []);
      } catch (error) {
        console.error("Error fetching data:", error);
        message.error("Failed to fetch batch students");
      } finally {
        setLoading(false);
      }
    };

    if (batchId) {
      fetchBatchStudents();
    }
  }, [batchId]);

  const formatDate = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleDateString();
  };

  const expandedRowRender = (record: Student) => {
    return (
      <Descriptions bordered column={2} size="small">
        <Descriptions.Item label="Student ID">{record.student_id}</Descriptions.Item>
        <Descriptions.Item label="College">
          {record.college_name || "N/A"}
        </Descriptions.Item>
        <Descriptions.Item label="Courses">
          {record.courses.map(c => c.course_name).join(", ")}
        </Descriptions.Item>
        <Descriptions.Item label="Batch Details">
          {record.batches.map(b => (
            <div key={b.batch_id}>
              <div><strong>Name:</strong> {b.batch_name}</div>
              <div><strong>Start:</strong> {formatDate(b.start_date)}</div>
              <div><strong>End:</strong> {formatDate(b.end_date)}</div>
            </div>
          ))}
        </Descriptions.Item>
      </Descriptions>
    );
  };

  const columns = [
    {
      title: "Name",
      key: "name",
      render: (record: Student) => `${record.firstname} ${record.lastname}`,
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
    },
    {
      title: "Phone",
      key: "phone",
      render: (record: Student) => `${record.countrycode} ${record.mobileno}`,
    },
    {
      title: "Status",
      key: "status",
      render: (record: Student) => (
        <Tag color={record.status === 1 ? "green" : "red"}>
          {record.status === 1 ? "Active" : "Inactive"}
        </Tag>
      ),
    },
  ];

  return (
    <LayoutWrapper pageTitle={`BORIGAM / Batch Students`}>
      <Card className="m-4 shadow-md" loading={loading}>
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold">Batch Students</h1>
        </div>
        <Table
          dataSource={students}
          columns={columns}
          rowKey="student_id"
          bordered
          expandable={{ expandedRowRender }}
          pagination={{ pageSize: 10 }}
        />
      </Card>
    </LayoutWrapper>
  );
};

export default BatchStudents;