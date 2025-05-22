import { useEffect, useState } from "react";
import LayoutWrapper from "../../components/adminlayout/layoutWrapper";
import { Table, Card, message } from "antd";

interface Student {
  student_id: number;
  firstname: string;
  lastname: string;
  email: string;
  countrycode: string;
  mobileno: string;
  status: number;
  college_id: number;
  college_name: string;
}

const CollageStudents = () => {
  const [students, setStudents] = useState<Student[]>([]);

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const response = await fetch(
          "http://13.233.33.133:3001/api/student/getAllStudents?collegeId=1",
          {
            headers: {
              "Content-Type": "application/json",
              token: localStorage.getItem("token") || "",
            },
          }
        );

        if (!response.ok) throw new Error("Failed to fetch students");

        const data = await response.json();
        setStudents(data.data);
      } catch (error) {
        console.error("Error fetching students:", error);
        message.error("Failed to fetch students");
      }
    };

    fetchStudents();
  }, []);

  const columns = [
    {
      title: "ID",
      dataIndex: "student_id",
      key: "student_id",
    },
    {
      title: "First Name",
      dataIndex: "firstname",
      key: "firstname",
    },
    {
      title: "Last Name",
      dataIndex: "lastname",
      key: "lastname",
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
    },
    {
      title: "Mobile",
      key: "mobileno",
      render: (record: Student) => `${record.countrycode} ${record.mobileno}`,
    },
    {
      title: "Status",
      key: "status",
      render: (record: Student) =>
        record.status === 1
          ? "Active"
          : record.status === 2
          ? "Inactive"
          : "Unknown",
    },
    {
      title: "College Name",
      dataIndex: "college_name",
      key: "college_name",
    },
  ];

  return (
    <LayoutWrapper pageTitle={"BORIGAM / Collage Students"}>
      <Card className="m-4 shadow-md">
        <h1 className="text-2xl font-bold mb-4">College Students</h1>
        <Table
          dataSource={students}
          columns={columns}
          rowKey="student_id"
          bordered
          pagination={{ pageSize: 5 }}
        />
      </Card>
    </LayoutWrapper>
  );
};

export default CollageStudents;
