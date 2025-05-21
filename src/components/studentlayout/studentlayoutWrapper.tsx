import { Layout } from "antd";
import StudentAppHeader from "./studentHeader";
import StudentAppSidebar from "./studentSidebar";

const { Content, Footer } = Layout;

interface LayoutWrapperProps {
  children: React.ReactNode;
  pageTitle: string;
}

const LayoutWrapper = ({ children, pageTitle }: LayoutWrapperProps) => {
  const currentYear = new Date().getFullYear();

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
            padding: "20px",
            background: "white",
            overflow: "auto",
            flex: 1,
          }}
        >
          {children}
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
    </Layout>
  );
};

export default LayoutWrapper;
