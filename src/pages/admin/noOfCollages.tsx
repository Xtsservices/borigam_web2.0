import React, { useEffect, useState } from "react";
import { 
  Table, 
  Spin, 
  Card, 
  Typography, 
  Tag, 
  Statistic,
  Row,
  Col,
  Divider
} from "antd";
import { 
  BankOutlined,
  UserOutlined,
  MailOutlined,
  PhoneOutlined,
  EnvironmentOutlined,
  IdcardOutlined
} from "@ant-design/icons";
import LayoutWrapper from "../../components/adminlayout/layoutWrapper";

const { Title, Text } = Typography;

interface User {
  userId: number;
  firstname: string;
  lastname: string;
  email: string;
  countrycode: string;
  mobileno: string;
  status: number;
  role: string;
}

interface College {
  collegeId: number;
  collegeName: string;
  collegeAddress: string;
  collegeStatus: number;
  collegeCode: string;
  users: User[];
}

const CollegeList: React.FC = () => {
  const [colleges, setColleges] = useState<College[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Fetch college data from API
  useEffect(() => {
    setLoading(true);
    fetch("http://13.233.33.133:3001/api/college/viewAllCollegesAndUsers", {
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
        setColleges(data.data || []);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching colleges:", error);
        setLoading(false);
      });
  }, []);

  // Define table columns
  const columns = [
    {
      title: (
        <span style={{ fontWeight: 600, color: '#1f2937' }}>
          <BankOutlined style={{ marginRight: 8, color: '#6366f1' }} />
          College Name
        </span>
      ),
      dataIndex: "collegeName",
      key: "collegeName",
      render: (text: string) => <Text strong>{text}</Text>,
    },
    {
      title: (
        <span style={{ fontWeight: 600, color: '#1f2937' }}>
          <EnvironmentOutlined style={{ marginRight: 8, color: '#6366f1' }} />
          Address
        </span>
      ),
      dataIndex: "collegeAddress",
      key: "collegeAddress",
      render: (text: string) => <Text>{text}</Text>,
    },
    {
      title: (
        <span style={{ fontWeight: 600, color: '#1f2937' }}>
          <IdcardOutlined style={{ marginRight: 8, color: '#6366f1' }} />
          College Code
        </span>
      ),
      dataIndex: "collegeCode",
      key: "collegeCode",
      render: (text: string) => <Tag color="blue">{text}</Tag>,
    },
    {
      title: (
        <span style={{ fontWeight: 600, color: '#1f2937' }}>
          <UserOutlined style={{ marginRight: 8, color: '#6366f1' }} />
          Contact Person
        </span>
      ),
      key: "userName",
      render: (_: unknown, record: College) => (
        record.users.length > 0 ? (
          <Text strong>{`${record.users[0].firstname} ${record.users[0].lastname}`}</Text>
        ) : (
          <Tag color="orange">N/A</Tag>
        )
      ),
    },
    {
      title: (
        <span style={{ fontWeight: 600, color: '#1f2937' }}>
          <MailOutlined style={{ marginRight: 8, color: '#6366f1' }} />
          Email
        </span>
      ),
      key: "userEmail",
      render: (_: unknown, record: College) => (
        record.users.length > 0 ? (
          <Text>{record.users[0].email}</Text>
        ) : (
          <Tag color="orange">N/A</Tag>
        )
      ),
    },
    {
      title: (
        <span style={{ fontWeight: 600, color: '#1f2937' }}>
          <PhoneOutlined style={{ marginRight: 8, color: '#6366f1' }} />
          Phone
        </span>
      ),
      key: "phoneNumber",
      render: (_: unknown, record: College) => (
        record.users.length > 0 ? (
          <Text>{`${record.users[0].countrycode} ${record.users[0].mobileno}`}</Text>
        ) : (
          <Tag color="orange">N/A</Tag>
        )
      ),
    },
    {
      title: (
        <span style={{ fontWeight: 600, color: '#1f2937' }}>
          Status
        </span>
      ),
      key: "status",
      render: (_: unknown, record: College) => (
        <Tag color={record.collegeStatus === 1 ? "green" : "red"}>
          {record.collegeStatus === 1 ? "Active" : "Inactive"}
        </Tag>
      ),
    },
  ];

  return (
    <LayoutWrapper pageTitle="BORIGAM / College List">
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
            Colleges Management
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
              <Col xs={24} sm={24} md={6}>
                <Statistic
                  title="Total Colleges"
                  value={colleges.length}
                  valueStyle={{ 
                    color: '#6366f1', 
                    fontSize: '24px', 
                    fontWeight: 700 
                  }}
                />
              </Col>
              <Col xs={24} sm={24} md={6}>
                <Statistic
                  title="Active Colleges"
                  value={colleges.filter(c => c.collegeStatus === 1).length}
                  valueStyle={{ 
                    color: '#10b981', 
                    fontSize: '24px', 
                    fontWeight: 700 
                  }}
                />
              </Col>
              <Col xs={24} sm={24} md={6}>
                <Statistic
                  title="Inactive Colleges"
                  value={colleges.filter(c => c.collegeStatus === 0).length}
                  valueStyle={{ 
                    color: '#ef4444', 
                    fontSize: '24px', 
                    fontWeight: 700 
                  }}
                />
              </Col>
              <Col xs={24} sm={24} md={6}>
                <Statistic
                  title="Colleges with Contacts"
                  value={colleges.filter(c => c.users.length > 0).length}
                  valueStyle={{ 
                    color: '#f59e0b', 
                    fontSize: '24px', 
                    fontWeight: 700 
                  }}
                />
              </Col>
            </Row>
          </Card>

          <Spin spinning={loading} tip="Loading colleges...">
            <Table
              columns={columns}
              dataSource={colleges}
              rowKey="collegeId"
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
              onRow={(record) => ({
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

export default CollegeList;