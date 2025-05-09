import React, { useState, useEffect, useRef } from "react";
import api from "../services/api";
import Navbar from "../components/navbar";
import { Box, Tabs, Tab, Tooltip, styled, Typography } from "@mui/material";
import { useNavigate } from "react-router-dom";
import MenuIcon from "@mui/icons-material/Menu";
import TrackChangesIcon from "@mui/icons-material/TrackChanges";
import FlagIcon from "@mui/icons-material/Flag";
import SupervisedUserCircleIcon from "@mui/icons-material/SupervisedUserCircle";
import { useAuth } from "../context/AuthContext";
import newBG from "../assets/vertical_bar_bg.jpg";

const DashEmbed = () => {
  const { user } = useAuth();
  const [dashUrl, setDashUrls] = useState(null);
  const [error, setError] = useState(null);
  const [selectedUrl, setSelectedUrl] = useState(null);
  const [selectedTab, setSelectedTab] = useState(1);
  const [expanded, setExpanded] = useState(false); // Track expansion

  // Add ref for the menu container
  const menuRef = useRef(null);

  // Handle click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setExpanded(false);
      }
    };

    // Add event listener
    document.addEventListener("mousedown", handleClickOutside);

    // Cleanup
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Update iframe height on resize
  const updateIframeSize = () => {
    const iframe = document.getElementById("dashboard-iframe");
    if (iframe) {
      iframe.style.height = `${window.innerHeight + 10}px`; // Adjust this value based on your layout
    }
  };

  useEffect(() => {
    const fetchDashUrls = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          setError("No access token found.");
          return;
        }

        const response = await api.get("/dash/combineddash", {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (response.data) {
          console.log("Returned Dash Data:", response.data); // Debugging

          const urls = Object.values(response.data); // Extract URLs from dictionary
          setDashUrls(urls);
          if (user?.role === "05") {
            setSelectedUrl(urls[0]); // Default to first URL
          } else {
            if (selectedTab === 0) {
              return;
            }
            if (selectedTab === 3) {
              console.log(selectedTab - 3);
              setSelectedUrl(urls[selectedTab - 3]);
              return;
            }
            setSelectedUrl(urls[selectedTab]); // Default to first URL
          }
          console.log(selectedTab);
        } else {
          setError("Failed to retrieve Dash app URLs.");
        }
      } catch (err) {
        setError(
          err.response?.data?.error || err.message || "Failed to load Dash app."
        );
      }
    };

    fetchDashUrls();
  }, [selectedTab]);

  useEffect(() => {
    window.addEventListener("resize", updateIframeSize);
    updateIframeSize(); // Call initially to set the size

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

  const CustomTooltip = styled(({ className, ...props }) => (
    <Tooltip {...props} arrow classes={{ popper: className }} />
  ))(({ theme }) => ({
    [`& .MuiTooltip-tooltip`]: {
      backgroundColor: "#08397C",
      color: "white",
      fontSize: "0.9rem",
      borderRadius: "8px",
      padding: "4px 8px",
      maxWidth: "100%", // Set a maximum width for the tooltip
      textAlign: "center", // Center-align text
      boxShadow: theme.shadows[3],
    },
    [`& .MuiTooltip-arrow`]: {
      color: "#08397C", // Same as backgroundColor to match
    },
  }));

  const handleMenuClick = () => {
    setExpanded((prev) => !prev);
  };

  const handleTabChange = (event, newValue) => {
    if (newValue === 0) {
      return;
    }
    setSelectedTab(newValue);
    // Collapse menu if selecting any tab except the menu icon (index 0)
    if (newValue !== 0) {
      setExpanded(false);
    }
  };

  const tabSettings = {
    fontSize: {
      sm: "0.7rem",
      md: "0.7rem",
      lg: "0.9rem",
    },
    display: "flex",
    flexDirection: "row", // Make sure items flow horizontally
    alignItems: "center", // Center items vertically
    justifyContent: "flex-start", // Start from the left
  };

  return (
    <>
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          height: "100vh",
          overflow: "hidden",
        }}
      >
        <Navbar />

        <Box sx={{ display: "flex", height: "100vh", paddingTop: "3.5rem" }}>
          <Box ref={menuRef} sx={{ display: "flex", height: "100vh" }}>
            <Tabs
              scrollButtons={false}
              orientation='vertical'
              value={selectedTab}
              onChange={handleTabChange}
              sx={{
                borderColor: "divider",
                width: expanded ? 340 : 75,
                transition: "width 0.1s ease-in-out",
                backgroundColor: "#08397C", // Base background color
                backgroundImage: `linear-gradient(rgba(8, 57, 124, 0.65), rgba(8, 57, 124, 0.65)), url(${newBG})`,
                backgroundSize: "cover",
                backgroundRepeat: "no-repeat",
                backgroundPosition: "center",
                "& .MuiTab-root": {
                  color: "white",
                  minHeight: 60,
                  justifyContent: expanded ? "flex-start" : "center",
                  "&:hover": {
                    backgroundColor: "rgba(10, 77, 162, 0.8)",
                    color: "white",
                  },
                },
                "& .Mui-selected": {
                  color: "white !important",
                  fontWeight: "bold",
                  backgroundColor: "rgba(12, 90, 207, 0.8)",
                },
              }}
            >
              {expanded ? (
                <Typography
                  onClick={handleMenuClick}
                  color='white'
                  padding={3}
                  fontWeight='1000'
                  sx={{
                    cursor: "pointer", // Add this line
                    textAlign: "start",
                    fontSize: {
                      sm: "1.25rem",
                      md: "1.5rem",
                      lg: "1.75rem",
                    },
                  }}
                >
                  <MenuIcon sx={{ fontSize: 30, color: "white", pt: 1 }} />
                  &nbsp;Dashboard
                </Typography>
              ) : (
                <Tab
                  icon={
                    <MenuIcon
                      sx={{
                        fontSize: 50,
                        color: "white",
                        padding: "0.75rem",
                        marginRight: "0.75rem",
                      }}
                    />
                  }
                  label={expanded ? "Menu" : ""}
                  onClick={handleMenuClick}
                  sx={{ display: "flex", alignItems: "flex-start" }}
                />
              )}

              <CustomTooltip
                title='Institutional Performance'
                placement='right'
              >
                <Tab
                  icon={
                    <TrackChangesIcon
                      sx={{
                        fontSize: 55,
                        color: "white",
                        padding: "0.9rem",
                        marginRight: "0.75rem",
                      }}
                    />
                  }
                  label={expanded ? "Institutional Performance" : ""}
                  sx={tabSettings}
                />
              </CustomTooltip>
              {user?.role !== "05" && (
                <CustomTooltip title='SDG Impact' placement='right'>
                  <Tab
                    icon={
                      <FlagIcon
                        sx={{
                          fontSize: 55,
                          color: "white",
                          padding: "0.9rem",
                          marginRight: "0.75rem",
                        }}
                      />
                    }
                    label={expanded ? "SDG Impact" : ""}
                    sx={tabSettings}
                  />
                </CustomTooltip>
              )}
              {user?.role !== "05" && (
                <CustomTooltip title='User Engagement' placement='right'>
                  <Tab
                    icon={
                      <SupervisedUserCircleIcon
                        sx={{
                          fontSize: 55,
                          color: "white",
                          padding: "0.9rem",
                          marginRight: "0.75rem",
                        }}
                      />
                    }
                    label={expanded ? "User Engagement" : ""}
                    sx={tabSettings}
                  />
                </CustomTooltip>
              )}
            </Tabs>
          </Box>
          <Box
            sx={{
              width: "100%",
              height: "100%",
              overflow: "hidden",
              position: "relative",
            }}
          >
            <iframe
              id='dashboard-iframe'
              src={selectedUrl}
              style={{
                border: "none",
                width: "111%", // Compensating for scale(0.8)
                height: "111%",
                display: "block",
                transform: "scale(0.9)",
                transformOrigin: "top left",
                position: "absolute",
                top: 0,
                left: 0,
              }}
              sandbox='allow-scripts allow-same-origin allow-forms allow-popups allow-downloads'
              title='Dash App'
            />
          </Box>
        </Box>
      </Box>
    </>
  );
};

export default DashEmbed;
