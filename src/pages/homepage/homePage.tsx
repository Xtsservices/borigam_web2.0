import React from "react";
import { Button, Divider } from "antd";
import borigam_profile from "../../assets/borigam-new.png";
import { useNavigate } from "react-router-dom";

const HomePage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div style={{ height: "100vh", width: "100vw", position: "relative" }}>
      {/* Full Page Image */}
      <img
        src={borigam_profile}
        alt="Profile"
        style={{
          height: "100%",
          width: "100%",
          objectFit: "cover",
          position: "absolute",
          top: 0,
          left: 0,
          zIndex: 0,
        }}
      />

      {/* Header Buttons */}
      <div
        style={{
          position: "absolute",
          top: 0,
          width: "100%",
          marginTop: "20px",
          zIndex: 1,
        }}
      >
        <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px", marginRight: "20px" }}>
          {/* <Button
            type="primary"
            style={{
              backgroundColor: "#ffc107",
              borderColor: "#ffc107",
              color: "black",
            }}
            onClick={() => navigate("/enquirynow")}
          >
            Enquiry Now
          </Button> */}
          <Button
            type="primary"
            style={{
              backgroundColor: "#ffc107",
              borderColor: "#ffc107",
              color: "black",
            }}
            onClick={() => navigate("/login")}
          >
            Login
          </Button>
          {/* <Button
            type="primary"
            style={{ color: "#000" }}
            onClick={() => navigate("/signup")}
          >
            Signup
          </Button> */}
        </div>

        {/* Divider Line */}
        <Divider style={{ borderColor: "#ffc107", borderWidth: 2 }} />
      </div>
    </div>
  );
};

export default HomePage;
