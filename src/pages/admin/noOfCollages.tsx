import React, { useEffect, useState } from "react";
import { Table, Spin } from "antd";
import LayoutWrapper from "../../components/adminlayout/layoutWrapper";

// Define TypeScript interfaces
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
    setLoading(true); // Ensure loading is true while fetching
    fetch("http://localhost:3001/api/college/viewAllCollegesAndUsers", {
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
      title: "College Name",
      dataIndex: "collegeName",
      key: "collegeName",
    },
    {
      title: "College Address",
      dataIndex: "collegeAddress",
      key: "collegeAddress",
    },
    {
      title: "College Code",
      dataIndex: "collegeCode",
      key: "collegeCode",
    },
    {
      title: "Name",
      key: "userName",
      render: (_: unknown, record: College) =>
        record.users.length > 0
          ? `${record.users[0].firstname} ${record.users[0].lastname}`
          : "N/A",
    },
    {
      title: "Email",
      key: "userEmail",
      render: (_: unknown, record: College) =>
        record.users.length > 0 ? record.users[0].email : "N/A",
    },
    {
      title: "Phone Number",
      key: "phoneNumber",
      render: (_: unknown, record: College) =>
        record.users.length > 0
          ? `${record.users[0].countrycode} ${record.users[0].mobileno}`
          : "N/A",
    },
  ];

  return (
    <LayoutWrapper pageTitle="BORIGAM / College List">
      <div
        className="college-list-container"
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
          College List
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
            dataSource={colleges}
            columns={columns}
            rowKey="collegeId"
            bordered
            pagination={{ pageSize: 5 }}
          />
        )}
      </div>
    </LayoutWrapper>
  );
};

export default CollegeList;
