import React, { useState, useEffect } from "react";
import Navbar from "./navbar";
import Footer from "./footer";
import {
  Box,
  Button,
  Grid2,
  Typography,
  Divider,
  IconButton,
  TextField,
  Modal,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import homeBg from "../assets/home_bg.png";
import ArrowBackIosIcon from "@mui/icons-material/ArrowBackIos";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const modalStyle = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 600,
  bgcolor: "background.paper",
  boxShadow: 24,
  p: 4,
  borderRadius: "10px",
};

const Profile = () => {
  const [userData, setUserData] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const navigate = useNavigate();
  // Retrieve user_id from cookie/localStorage
  const getUserId = () => {
    const userId = localStorage.getItem("user_id");
    return userId;
  };
  const [formValues, setFormValues] = useState({
    firstName: "",
    middleName: "",
    lastName: "",
    suffix: "",
    department: "",
    program: "",
  });

  const fetchUserData = async () => {
    const userId = getUserId();
    if (userId) {
      try {
        const response = await axios.get(
          `http://localhost:5000/users/${userId}`
        );
        const data = response.data;
        setUserData(data);

        // Pre-fill the form with user data
        setFormValues({
          firstName: data.researcher.first_name || "",
          middleName: data.researcher.middle_name || "",
          lastName: data.researcher.last_name || "",
          suffix: data.researcher.suffix || "",
          department: data.researcher.college_id || "",
          program: data.researcher.program_id || "",
        });
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    }
  };

  // Fetch user data on component mount
  useEffect(() => {
    fetchUserData();
  }, []);
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormValues({ ...formValues, [name]: value });
  };
  const handleNavigateHome = () => {
    navigate("/home");
  };

  const handleOpenModal = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  return (
    <>
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          minHeight: "100vh",
        }}
      >
        <Navbar />
        <Box sx={{ flexGrow: 1 }}>
          <Box
            sx={{
              position: "relative",
              marginTop: { xs: "3.5rem", sm: "4rem", md: "6rem" },
              display: "flex",
              flexDirection: { xs: "column", md: "row" },
              padding: 4,
              gap: 4,
              backgroundSize: "cover",
              backgroundPosition: "center",
              height: { xs: "5rem", md: "8rem" },
              backgroundColor: "#0A438F",
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
                opacity: 0.25,
                zIndex: 1,
              }}
            />
            <Box sx={{ display: "flex", ml: "5rem", zIndex: 3 }}>
              <IconButton
                onClick={handleNavigateHome}
                sx={{
                  color: "#fff",
                }}
              >
                <ArrowBackIosIcon></ArrowBackIosIcon>
              </IconButton>
              <Typography
                variant='h3'
                sx={{
                  fontFamily: "Montserrat, sans-serif",
                  fontWeight: 800,
                  fontSize: { xs: "2rem", sm: "2.5rem", md: "4.375rem" },
                  color: "#FFF",
                  mb: 2,
                  lineHeight: 1.25,
                  maxWidth: { xs: "100%", md: "80%" },
                  alignSelf: "center",
                  zIndex: 2,
                }}
              >
                Profile
              </Typography>
            </Box>
          </Box>

          {/* Content Section */}
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              padding: 4,
              width: "100%",
            }}
          >
            <Box sx={{ width: "60%", mb: "1.5rem" }}>
              <Button
                variant='outlined'
                startIcon={<EditIcon />}
                onClick={handleOpenModal}
                sx={{ fontWeight: 600 }}
              >
                Edit Profile
              </Button>
            </Box>
            <Grid2 container spacing={2} sx={{ width: "60%" }}>
              {userData ? (
                [
                  {
                    label: "First Name",
                    value: userData.researcher.first_name,
                  },
                  {
                    label: "Middle Name",
                    value: userData.researcher.middle_name,
                  },
                  {
                    label: "Last Name",
                    value: userData.researcher.last_name,
                  },
                  {
                    label: "Suffix",
                    value: userData.researcher.suffix,
                  },
                  {
                    label: "Mapúa MCL Live Account",
                    value: userData.account.live_account,
                  },
                  {
                    label: "Role",
                    value: userData.account.role,
                  },
                  {
                    label: "Department",
                    value: userData.researcher.college_id,
                  },
                  {
                    label: "Program",
                    value: userData.researcher.program_id,
                  },
                ].map((field, index) => (
                  <Grid2 size={{ xs: 12, sm: 6 }} key={index}>
                    <Typography
                      variant='body1'
                      sx={{
                        color: "#777",
                        fontWeight: 600,
                        fontSize: "1rem",
                      }}
                    >
                      {field.label}
                    </Typography>
                    <Typography
                      variant='h6'
                      sx={{
                        color: "#001C43",
                        fontWeight: 600,
                        fontSize: "1.25rem",
                        mt: "0.25rem",
                      }}
                    >
                      {field.value}
                    </Typography>
                    <Divider
                      sx={{ mt: "0.75rem", mb: "1.5rem", borderColor: "#ccc" }}
                    />
                  </Grid2>
                ))
              ) : (
                <Typography variant='body1'>Loading user data...</Typography>
              )}
            </Grid2>
          </Box>
          <Modal open={isModalOpen} onClose={handleCloseModal}>
            <Box sx={modalStyle}>
              <Typography variant='h4' sx={{ mb: 4, fontWeight: 600 }}>
                Edit Profile
              </Typography>
              <Grid2 container spacing={2}>
                {[
                  {
                    label: "First Name",
                    name: "firstName",
                    value: formValues.firstName,
                  },
                  {
                    label: "Middle Name",
                    name: "middleName",
                    value: formValues.middleName,
                  },
                  {
                    label: "Last Name",
                    name: "lastName",
                    value: formValues.lastName,
                  },
                  {
                    label: "Department",
                    name: "department",
                    value: formValues.department,
                  },
                  {
                    label: "Program",
                    name: "program",
                    value: formValues.program,
                  },
                ].map((field, index) => (
                  <Grid2 item xs={12} sm={6} key={index}>
                    <TextField
                      label={field.label}
                      fullWidth
                      name={field.name}
                      value={field.value}
                      onChange={handleInputChange}
                    />
                  </Grid2>
                ))}
              </Grid2>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginTop: "1.5rem",
                }}
              >
                <Button
                  variant='outlined'
                  onClick={handleCloseModal}
                  sx={{ fontWeight: 600 }}
                >
                  Back
                </Button>
                <Button
                  variant='contained'
                  onClick={handleCloseModal}
                  sx={{
                    backgroundColor: "#CA031B",
                    color: "#FFF",
                    fontWeight: 600,
                  }}
                >
                  Save Changes
                </Button>
              </Box>
            </Box>
          </Modal>
        </Box>
        <Footer />
      </Box>
    </>
  );
};

export default Profile;
