import { useEffect, useState } from "react";
import { 
  Table, 
  Spin, 
  Card, 
  Typography, 
  Tag, 
  Statistic,
  Row,
  Col,
  message
} from "antd";
import { 
  FileTextOutlined,
  BookOutlined,
  ClockCircleOutlined,
  CalendarOutlined,
  SyncOutlined
} from "@ant-design/icons";
import LayoutWrapper from "../../components/adminlayout/layoutWrapper";

const { Title, Text } = Typography;

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
        setLoading(true);
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
    const date = new Date(parseInt(timestamp) * 1000);
    return date.toLocaleDateString('en-US', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const columns = [
    {
      title: (
        <span style={{ fontWeight: 600, color: '#1f2937' }}>
          <FileTextOutlined style={{ marginRight: 8, color: '#6366f1' }} />
          Test Name
        </span>
      ),
      dataIndex: "test_name",
      key: "test_name",
      render: (text: string) => <Text strong>{text}</Text>,
    },
    {
      title: (
        <span style={{ fontWeight: 600, color: '#1f2937' }}>
          <BookOutlined style={{ marginRight: 8, color: '#6366f1' }} />
          Course
        </span>
      ),
      dataIndex: "course_name",
      key: "course_name",
      render: (text: string) => <Text>{text}</Text>,
    },
    {
      title: (
        <span style={{ fontWeight: 600, color: '#1f2937' }}>
          <ClockCircleOutlined style={{ marginRight: 8, color: '#6366f1' }} />
          Duration
        </span>
      ),
      dataIndex: "duration",
      key: "duration",
      render: (duration: number) => (
        <Text>{`${duration} min`}</Text>
      ),
    },
    {
      title: (
        <span style={{ fontWeight: 600, color: '#1f2937' }}>
          <CalendarOutlined style={{ marginRight: 8, color: '#6366f1' }} />
          Start Date
        </span>
      ),
      key: "start_date",
      render: (record: Test) => (
        <Text>{formatDate(record.start_date)}</Text>
      ),
    },
    {
      title: (
        <span style={{ fontWeight: 600, color: '#1f2937' }}>
          <CalendarOutlined style={{ marginRight: 8, color: '#6366f1' }} />
          End Date
        </span>
      ),
      key: "end_date",
      render: (record: Test) => (
        <Text>{formatDate(record.end_date)}</Text>
      ),
    },
    {
      title: (
        <span style={{ fontWeight: 600, color: '#1f2937' }}>
          Status
        </span>
      ),
      key: "test_status",
      render: () => (
        <Tag 
          icon={<SyncOutlined spin />} 
          color="blue"
          style={{ fontWeight: 500 }}
        >
          Ongoing
        </Tag>
      ),
    },
  ];

  return (
    <LayoutWrapper pageTitle={"BORIGAM / Ongoing Test"}>
      <div style={{ 
        padding: "32px", 
        background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
        minHeight: '100vh'
      }}>
        <div style={{ 
          background: 'white', 
          borderRadius: '16px', 
          padding: '32px',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
        }}>
          <Title 
            level={2} 
            style={{ 
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              fontSize: '32px',
              fontWeight: 700,
              marginBottom: '8px'
            }}
          >
            Ongoing Tests
          </Title>
          
          <Card
            style={{ 
              marginBottom: 32, 
              borderRadius: '16px',
              border: '1px solid #e5e7eb',
              boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)'
            }}
            bodyStyle={{ padding: '24px' }}
          >
            <Row gutter={[16, 16]} align="middle">
              <Col xs={24} sm={12} md={8}>
                <Statistic
                  title="Total Ongoing Tests"
                  value={currentTests.length}
                  valueStyle={{ 
                    color: '#6366f1', 
                    fontSize: '24px', 
                    fontWeight: 700 
                  }}
                />
              </Col>
              <Col xs={24} sm={12} md={8}>
                <Statistic
                  title="Unique Courses"
                  value={new Set(currentTests.map(test => test.course_id)).size}
                  valueStyle={{ 
                    color: '#10b981', 
                    fontSize: '24px', 
                    fontWeight: 700 
                  }}
                />
              </Col>
              <Col xs={24} sm={12} md={8}>
                <Statistic
                  title="Average Duration"
                  value={currentTests.length > 0 
                    ? (currentTests.reduce((sum, test) => sum + test.duration, 0) / currentTests.length)
                    : 0}
                  precision={0}
                  suffix="min"
                  valueStyle={{ 
                    color: '#f59e0b', 
                    fontSize: '24px', 
                    fontWeight: 700 
                  }}
                />
              </Col>
            </Row>
          </Card>

          <Spin spinning={loading} tip="Loading ongoing tests...">
            <Table
              columns={columns}
              dataSource={currentTests}
              rowKey="test_id"
              pagination={{ 
                pageSize: 5,
                showSizeChanger: true,
                pageSizeOptions: ['10', '20', '50', '100'],
                style: { padding: '16px 24px' }
              }}
              bordered={false}
              style={{ 
                background: 'white',
                borderRadius: '16px',
                border: '1px solid #e5e7eb',
                overflow: 'hidden'
              }}
              onRow={() => ({
                style: { 
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                },
                onMouseEnter: (e) => {
                  e.currentTarget.style.backgroundColor = '#f8fafc';
                },
                onMouseLeave: (e) => {
                  e.currentTarget.style.backgroundColor = 'white';
                }
              })}
            />
          </Spin>
        </div>
        
        <style>{`
          .table-row-light {
            background-color: #fafafa;
          }
          .table-row-dark {
            background-color: white;
          }
          .ant-table-thead > tr > th {
            background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%) !important;
            border-bottom: 2px solid #e5e7eb !important;
            font-weight: 600 !important;
            color: #1f2937 !important;
            padding: 16px !important;
          }
          .ant-table-tbody > tr > td {
            padding: 16px !important;
            border-bottom: 1px solid #f3f4f6 !important;
          }
          .ant-table-tbody > tr:hover > td {
            background-color: #f8fafc !important;
          }
        `}</style>
      </div>
    </LayoutWrapper>
  );
};

export default OngoingTest;