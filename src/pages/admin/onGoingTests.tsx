import { useEffect, useState } from "react";
import LayoutWrapper from "../../components/adminlayout/layoutWrapper";
import { Card, Table, Tag, message } from "antd";

interface Test {
  test_id: number;
  test_name: string;
  duration: number;
  start_date: string;
  end_date: string;
  created_at: string;
  course_id: number;
  course_name: string;
  test_status: string;
}

const OngoingTest = () => {
  const [currentTests, setCurrentTests] = useState<Test[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchTests = async () => {
      try {
        const response = await fetch(
          "http://13.233.33.133:3001/api/question/getCurrentAndUpcomingTests",
          {
            headers: {
              "Content-Type": "application/json",
              token: localStorage.getItem("token") || "",
            },
          }
        );

        if (!response.ok) throw new Error("Failed to fetch tests");

        const result = await response.json();
        setCurrentTests(result.data.current_tests || []);
      } catch (error) {
        console.error("Error fetching tests:", error);
        message.error("Failed to fetch ongoing tests");
      } finally {
        setLoading(false);
      }
    };

    fetchTests();
  }, []);

  const formatDate = (timestamp: string) => {
    return new Date(parseInt(timestamp) * 1000).toLocaleString();
  };

  const columns = [
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
      title: "Duration (mins)",
      dataIndex: "duration",
      key: "duration",
    },
    {
      title: "Start Date",
      key: "start_date",
      render: (record: Test) => formatDate(record.start_date),
    },
    {
      title: "End Date",
      key: "end_date",
      render: (record: Test) => formatDate(record.end_date),
    },
    {
      title: "Status",
      key: "test_status",
      render: () => <Tag color="green">Ongoing</Tag>,
    },
  ];

  return (
    <LayoutWrapper pageTitle={"BORIGAM / Ongoing Test"}>
      <Card title="Ongoing Tests" loading={loading}>
        <Table
          dataSource={currentTests}
          columns={columns}
          rowKey="test_id"
          pagination={{ pageSize: 10 }}
        />
      </Card>
    </LayoutWrapper>
  );
};

export default OngoingTest;