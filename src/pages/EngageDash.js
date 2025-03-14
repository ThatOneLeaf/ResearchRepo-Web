import React, { useState, useEffect } from "react";
import api from "../services/api";
import Navbar from "../components/navbar";
import { Box } from "@mui/material";
import { useNavigate } from "react-router-dom";
import HeaderWithBackButton from "../components/Header";

const EngageDash = () => {
  const [dashUrl, setDashUrl] = useState(null);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Fetch the Dash app URL
    const fetchDashUrl = async () => {
      try {
        const token = localStorage.getItem("token"); // Get JWT from local storage
        if (!token) {
          setError("No access token found.");
          return;
        }
        const response = await api.get("/dash/engagement", {
          headers: {
            Authorization: `Bearer ${token}`, // Add JWT to the request headers
          },
        });

        if (response.data?.url) {
          setDashUrl(response.data.url); // Set the Dash app URL
        } else {
          setError("Failed to retrieve Dash app URL.");
        }
      } catch (err) {
        setError(
          err.response?.data?.error || err.message || "Failed to load Dash app."
        );
      }
    };

    fetchDashUrl();
  }, []);

  useEffect(() => {
    const updateIframeSize = () => {
      const iframe = document.getElementById("dashboard-iframe");
      if (iframe) {
        iframe.style.height = `${window.innerHeight}px`; // Dynamically set height
      }
    };

    window.addEventListener("resize", updateIframeSize);
    updateIframeSize(); // Set initial size

    return () => {
      window.removeEventListener("resize", updateIframeSize);
    };
  }, []);

  if (error) {
    return <div>Error: {error}</div>;
  }

  if (!dashUrl) {
    return <div>Loading Dash app...</div>;
  }

  return (
    <>
      <Navbar />
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          height: "100vh", // Full viewport height
          overflow: "hidden", // Prevent scrollbars
        }}
      >
        <HeaderWithBackButton
          title='User Engagement Dashboard'
          onBack={() => navigate(-1)}
        />
        <Box
          sx={{
            flexGrow: 1,
            padding: 0,
            margin: 0,
            height: "100%", // Ensure it occupies full remaining height
            overflow: "hidden", // Prevent scrollbars
          }}
        >
          <iframe
            id='dashboard-iframe'
            src={dashUrl}
            style={{
              border: "none",
              width: "100%", // Occupy full width
              height: "100vh", // Full viewport height
              display: "block", // Avoid inline gaps
            }}
            sandbox='allow-scripts allow-same-origin allow-forms allow-popups'
            title='Engage Dash App'
          />
        </Box>
      </Box>
    </>
  );
};

export default EngageDash;
