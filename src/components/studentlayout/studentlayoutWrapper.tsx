import React, { useState, useEffect } from "react";
import { Layout, Tabs } from "antd";
import { useLocation, useNavigate } from "react-router-dom";
import StudentAppHeader from "./studentHeader";
import StudentAppSidebar from "./studentSidebar";

const { Content, Footer } = Layout;
const { TabPane } = Tabs;

interface LayoutWrapperProps {
  children: React.ReactNode;
  pageTitle: string;
}

const LayoutWrapper = ({ children, pageTitle }: LayoutWrapperProps) => {
  const currentYear = new Date().getFullYear();
  const location = useLocation();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<string>("dashboard");

  // Define routes that should show tabs
  const tabRoutes = [
    "/student/dashboard",
    "/student/CompletedTest"
  ];

  // Check if current route should show tabs
  const shouldShowTabs = tabRoutes.some(route => 
    location.pathname.startsWith(route.split('/').slice(0, -1).join('/'))
  );

  // Update active tab based on current route
  useEffect(() => {
    if (location.pathname.includes("/CompletedTest")) {
      setActiveTab("completed");
    } else if (location.pathname.includes("/dashboard")) {
      setActiveTab("dashboard");
    }
  }, [location.pathname]);

  // Handle tab change
  const handleTabChange = (key: string) => {
    setActiveTab(key);
    if (key === "dashboard") {
      navigate("/student/dashboard");
    } else if (key === "completed") {
      navigate("/student/CompletedTest");
    }
  };

  return (
    <Layout
      style={{
        minHeight: "100vh",
        display: "flex",
        overflowX: "hidden",
        background: "white",
      }}
    >
      <StudentAppSidebar />
      <Layout>
        <StudentAppHeader title={pageTitle} />
        <Content
          style={{
            padding: shouldShowTabs ? "20px 20px 0 20px" : "20px",
            background: "white",
            overflow: "auto",
            flex: 1,
          }}
        >
          {shouldShowTabs ? (
            <Tabs
              activeKey={activeTab}
              onChange={handleTabChange}
              type="card"
              size="large"
              style={{
                margin: "0 -20px",
                background: "white",
              }}
              tabBarStyle={{
                margin: "0 20px",
                background: "white",
                borderBottom: "1px solid #f0f0f0",
              }}
            >
              <TabPane 
                tab={
                  <span style={{ 
                    fontWeight: activeTab === "dashboard" ? "bold" : "normal",
                    color: activeTab === "dashboard" ? "#f59e0b" : "#666"
                  }}>
                    🏠 Dashboard
                  </span>
                } 
                key="dashboard"
              >
                <div style={{ padding: "20px" }}>
                  {activeTab === "dashboard" && children}
                </div>
              </TabPane>
              <TabPane 
                tab={
                  <span style={{ 
                    fontWeight: activeTab === "completed" ? "bold" : "normal",
                    color: activeTab === "completed" ? "#f59e0b" : "#666"
                  }}>
                    ✅ Completed Tests
                  </span>
                } 
                key="completed"
              >
                <div style={{ padding: "20px" }}>
                  {activeTab === "completed" && children}
                </div>
              </TabPane>
            </Tabs>
          ) : (
            children
          )}
        </Content>
        <Footer
          style={{
            textAlign: "center",
            background: "#fff",
            borderTop: "1px solid #e8e8e8",
            padding: "12px 0",
            fontSize: "14px",
            color: "#666",
          }}
        >
          © {currentYear} Borigam Institution. All rights reserved. | Powered by{" "}
          {""}
          <strong>XTS</strong>
        </Footer>
      </Layout>

      {/* Custom CSS for tabs */}
      <style>{`
        .ant-tabs-card > .ant-tabs-nav .ant-tabs-tab {
          background: #fafafa;
          border: 1px solid #d9d9d9;
          border-bottom: none;
          margin-right: 8px;
          padding: 8px 16px;
          transition: all 0.3s ease;
        }
        
        .ant-tabs-card > .ant-tabs-nav .ant-tabs-tab:hover {
          background: #fff;
          border-color: #f59e0b;
        }
        
        .ant-tabs-card > .ant-tabs-nav .ant-tabs-tab-active {
          background: #fff !important;
          border-color: #f59e0b !important;
          border-bottom: 1px solid #fff !important;
          position: relative;
          z-index: 1;
        }
        
        .ant-tabs-card > .ant-tabs-nav .ant-tabs-tab-active::before {
          content: '';
          position: absolute;
          bottom: -1px;
          left: 0;
          right: 0;
          height: 2px;
          background: #f59e0b;
        }
        
        .ant-tabs-card .ant-tabs-content-holder {
          border-top: 1px solid #f0f0f0;
          background: #fff;
        }
        
        .ant-tabs-card .ant-tabs-content {
          background: #fff;
        }
        
        .ant-tabs-nav {
          margin-bottom: 0 !important;
        }
        
        .ant-tabs-nav-wrap {
          background: #fff;
          padding: 0;
        }
      `}</style>
    </Layout>
  );
};

export default LayoutWrapper;