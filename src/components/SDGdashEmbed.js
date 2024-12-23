import React, { useState, useEffect } from "react";
import axios from "axios";
import Navbar from "./navbar";
import { Box, IconButton, Typography } from "@mui/material";
import ArrowBackIosIcon from "@mui/icons-material/ArrowBackIos";
import { useNavigate } from "react-router-dom";
import homeBg from "../assets/home_bg.png"; // Replace with actual image path

const SDGdashEmbed = () => {
  const [dashUrl, setDashUrl] = useState(null);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // Update iframe height on resize
  const updateIframeSize = () => {
    const iframe = document.getElementById('dashboard-iframe');
    if (iframe) {
      iframe.style.height = `${window.innerHeight - 100}px`; // Adjust this value based on your layout
    }
  };

  useEffect(() => {
    // Fetch the Dash app URL
    const fetchDashUrl = async () => {
      try {
        const token = localStorage.getItem("token"); // Get JWT from local storage
        if (!token) {
          setError("No access token found.");
          return;
        }
        const response = await axios.get("/dash/analytics", {
          headers: {
            Authorization: `Bearer ${token}`, // Add JWT to the request headers
          },
        });

        // Check if response contains URL
        if (response.data?.url) {
          setDashUrl(response.data.url); // Set the Dash app URL
        } else {
          setError("Failed to retrieve Dash app URL.");
        }
      } catch (err) {
        setError(
          err.response?.data?.error ||
            err.message ||
            "Failed to load Dash app."
        );
      }
    };

    fetchDashUrl();
  }, []);

  useEffect(() => {
    window.addEventListener('resize', updateIframeSize);
    updateIframeSize(); // Call initially to set the size

    return () => {
      window.removeEventListener('resize', updateIframeSize);
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
          flexGrow: 1,
          display: "flex",
          flexDirection: "column",
          marginTop: { xs: "3.5rem", sm: "4rem", md: "5rem" },
          height: {
            xs: "calc(100vh - 3.5rem)",
            sm: "calc(100vh - 4rem)",
            md: "calc(100vh - 6rem)",
          },
          overflow: "hidden",
        }}
      >
        <Box
          sx={{
            position: "relative",
            width: "100%",
            height: {
              xs: "clamp(2rem, 3vh, 3rem)",
              sm: "clamp(3rem, 8vh, 4rem)",
              md: "clamp(3rem, 14vh, 4rem)",
              lg: "clamp(4rem, 20vh, 5rem)",
            },
            backgroundColor: "#0A438F",
            backgroundSize: "cover",
            backgroundPosition: "center",
            display: "flex",
            alignItems: "center",
            zIndex: 1,
          }}
        >
          <Box
            sx={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundImage: `url(${homeBg})`,
              backgroundSize: "cover",
              opacity: 0.25,
              zIndex: 1,
            }}
          />
          <Box sx={{ display: "flex", ml: "5rem", zIndex: 3 }}>
            <IconButton
              onClick={() => navigate(-1)}
              sx={{
                color: "#fff",
                transform: {
                  xs: "scale(0.8)",
                  sm: "scale(1)",
                  md: "scale(1.2)",
                },
              }}
            >
              <ArrowBackIosIcon />
            </IconButton>
            <Typography
              variant="h3"
              sx={{
                fontFamily: "Montserrat, sans-serif",
                fontWeight: 800,
                fontSize: {
                  xs: "clamp(1rem, 2vw, 1rem)",
                  sm: "clamp(1.5rem, 3.5vw, 1.5rem)",
                  md: "clamp(2rem, 4vw, 2.25rem)",
                },
                color: "#FFF",
                lineHeight: 1.25,
                alignSelf: "center",
                zIndex: 2,
              }}
            >
              SDG Analytics
            </Typography>
          </Box>
        </Box>
        <Box
          sx={{
            flexGrow: 1,
            backgroundColor: "#f5f5f5",
            padding: 0,
            boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
            overflowY: "hidden",
          }}
        >
          <div style={{ 
            height: "100vh", 
            width: "100%", 
            paddingTop: "20px", 
            paddingLeft: "20px", 
            backgroundColor: "white" // Set the background color to white
          }}>
            <iframe
              src={dashUrl}
              style={{
                border: "none",
                width: "100%",
                height: "100%",
              }}
              title="Dash App"
            />
          </div>
        </Box>
      </Box>
    </>
  );
};

export default SDGdashEmbed;
