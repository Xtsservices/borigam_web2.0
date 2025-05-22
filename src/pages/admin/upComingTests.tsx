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

const UpComingTest = () => {
  const [upcomingTests, setUpcomingTests] = useState<Test[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchTests = async () => {
      try {
        const response = await fetch(
          "http://localhost:3001/api/question/getCurrentAndUpcomingTests",
          {
            headers: {
              "Content-Type": "application/json",
              token: localStorage.getItem("token") || "",
            },
          }
        );

        if (!response.ok) throw new Error("Failed to fetch tests");

        const result = await response.json();
        setUpcomingTests(result.data.upcoming_tests || []);
      } catch (error) {
        console.error("Error fetching tests:", error);
        message.error("Failed to fetch upcoming tests");
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
      render: () => <Tag color="orange">Upcoming</Tag>,
    },
  ];

  return (
    <LayoutWrapper pageTitle={"BORIGAM / Upcoming Tests"}>
      <Card title="Upcoming Tests" loading={loading}>
        <Table
          dataSource={upcomingTests}
          columns={columns}
          rowKey="test_id"
          pagination={{ pageSize: 10 }}
        />
      </Card>
    </LayoutWrapper>
  );
};

export default UpComingTest;