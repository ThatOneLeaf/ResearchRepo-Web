import {
  Box,
  Button,
  Checkbox,
  FormControlLabel,
  Grid2,
  IconButton,
  InputAdornment,
  Pagination,
  Slider,
  TextField,
  Typography,
} from "@mui/material";
import React, { useEffect, useState } from "react";
import Navbar from "./navbar";
import Footer from "./footer";
import homeBg from "../assets/home_bg.png";
import { Search } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import ArrowBackIosIcon from "@mui/icons-material/ArrowBackIos";
import axios from "axios";

const DepartmentCollection = () => {
  const navigate = useNavigate();
  const [userDepartment, setUserDepartment] = useState(null);
  const [research, setResearch] = useState([]);
  const [programs, setPrograms] = useState([]);
  const [filteredResearch, setFilteredResearch] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [dateRange, setDateRange] = useState([2010, 2024]);
  const [selectedPrograms, setSelectedPrograms] = useState([]);
  const [selectedFormats, setSelectedFormats] = useState([]);
  const itemsPerPage = 5;

  const handleNavigateHome = () => {
    navigate("/main");
  };
  const handleNavigateKnowledgeGraph = () => {
    navigate("/knowledgegraph");
  };

  const getUserId = () => {
    const userId = localStorage.getItem("user_id");
    return userId;
  };

  const fetchUserData = async () => {
    const userId = getUserId();
    if (userId) {
      try {
        const response = await axios.get(`/accounts/users/${userId}`);
        const data = response.data;
        setUserDepartment(data.researcher.college_id);
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    }
  };

  useEffect(() => {
    fetchUserData();
  }, []);

  useEffect(() => {
    const fetchPrograms = async () => {
      if (userDepartment) {
        try {
          const response = await axios.get(`/deptprogs/programs`, {
            params: { department: userDepartment },
          });
          setPrograms(response.data.programs);
        } catch (error) {
          console.error("Error fetching programs for department:", error);
        }
      }
    };
    fetchPrograms();
  }, [userDepartment]);

  useEffect(() => {
    const fetchDepartmentResearch = async () => {
      if (userDepartment) {
        try {
          const response = await axios.put(
            `/dataset/fetch_researches/${userDepartment}`
          );
          const fetchedResearch = response.data.dataset;
          setResearch(fetchedResearch);
          setFilteredResearch(fetchedResearch);
        } catch (error) {
          console.error("Error fetching data of research:", error);
        } finally {
          setLoading(false);
        }
      }
    };
    fetchDepartmentResearch();
  }, [userDepartment]);

  useEffect(() => {
    let filtered = research;

    // Filter by Date Range
    filtered = filtered.filter(
      (item) => item.year >= dateRange[0] && item.year <= dateRange[1]
    );

    // Filter by Selected Programs
    if (selectedPrograms.length > 0) {
      filtered = filtered.filter((item) =>
        selectedPrograms.includes(item.program_name)
      );
    }

    // Filter by Selected Formats
    if (selectedFormats.length > 0) {
      filtered = filtered.filter((item) =>
        selectedFormats.some(
          (format) => format.toLowerCase() === item.journal.toLowerCase()
        )
      );
    }

    // Filter by Search Query
    if (searchQuery) {
      filtered = filtered.filter(
        (item) =>
          item.title.toLowerCase().includes(searchQuery) ||
          item.concatenated_authors.toLowerCase().includes(searchQuery)
      );
    }

    setFilteredResearch(filtered);
    setCurrentPage(1); // Reset to the first page on filter change
  }, [dateRange, selectedPrograms, selectedFormats, searchQuery, research]);

  // Handle change in search query
  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value.toLowerCase());
  };

  // Handle change in date range filter
  const handleDateRangeChange = (event, newValue) => {
    setDateRange(newValue);
  };

  // Handle change in selected programs filter
  const handleProgramChange = (event) => {
    const { value, checked } = event.target;
    setSelectedPrograms((prev) =>
      checked ? [...prev, value] : prev.filter((item) => item !== value)
    );
  };

  // Handle change in selected formats filter
  const handleFormatChange = (event) => {
    const { value, checked } = event.target;
    setSelectedFormats((prev) =>
      checked ? [...prev, value] : prev.filter((item) => item !== value)
    );
  };

  // Handle pagination change
  const handleChangePage = (event, newPage) => {
    setCurrentPage(newPage);
  };

  // Get the paginated research outputs
  const paginatedResearch = filteredResearch.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <>
      <Box
        sx={{
          margin: 0,
          padding: 0,
          height: "100vh",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <Navbar />
        <Box
          sx={{
            flexGrow: 1,
            display: "flex",
            flexDirection: "column",
            height: { xs: "100%", md: "calc(100vh - 9rem)" },
            marginTop: { xs: "3.5rem", sm: "4rem", md: "6rem" },
          }}
        >
          {/* Header Section */}
          <Box
            sx={{
              position: "relative",
              marginBottom: 2,
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
                <ArrowBackIosIcon />
              </IconButton>
              <Typography
                variant='h3'
                sx={{
                  fontFamily: "Montserrat, sans-serif",
                  fontWeight: 800,
                  fontSize: { xs: "1.5rem", sm: "2rem", md: "3rem" },
                  color: "#FFF",
                  mb: 2,
                  lineHeight: 1.25,
                  alignSelf: "center",
                  zIndex: 2,
                }}
              >
                Collections
              </Typography>
            </Box>
          </Box>

          {/* Main Content Section */}
          <Box
            sx={{
              flexGrow: 1,
              padding: 4,
              overflow: "hidden",
              mb: 4,
            }}
          >
            <Grid2 container spacing={2} sx={{ height: "100%" }}>
              <Grid2 size={3}>
                <Box
                  sx={{
                    border: "1px solid #ccc",
                    height: "100%",
                    padding: 2,
                    boxSizing: "border-box",
                    display: "flex",
                    flexDirection: "column",
                    overflow: "hidden",
                  }}
                >
                  <Typography
                    variant='h6'
                    sx={{
                      mb: 2,
                      fontWeight: "bold",
                      color: "#0A438F",
                      fontSize: "1.5rem",
                    }}
                  >
                    {userDepartment}
                  </Typography>
                  <Typography variant='h6' sx={{ mb: 2 }}>
                    Filters
                  </Typography>
                  <Typography variant='body1' sx={{ mb: 1 }}>
                    Date Range:
                  </Typography>
                  <Slider
                    value={dateRange}
                    onChange={handleDateRangeChange}
                    valueLabelDisplay='on'
                    min={2010}
                    max={2024}
                    sx={{ my: 3, width: "80%", alignSelf: "center" }}
                  />
                  <Typography variant='body1' sx={{ mb: 1 }}>
                    Program:
                  </Typography>
                  <Box
                    sx={{
                      height: "8rem",
                      overflowY: "auto",
                    }}
                  >
                    {programs.map((program) => (
                      <FormControlLabel
                        key={program.program_id}
                        control={
                          <Checkbox
                            checked={selectedPrograms.includes(
                              program.program_name
                            )}
                            onChange={handleProgramChange}
                            value={program.program_name}
                          />
                        }
                        label={program.program_name}
                      />
                    ))}
                  </Box>
                  <Typography variant='body1' sx={{ mt: 2, mb: 1 }}>
                    Publication Format:
                  </Typography>
                  {["Journal", "Proceeding", "Unpublished"].map((format) => (
                    <FormControlLabel
                      key={format}
                      control={
                        <Checkbox
                          checked={selectedFormats.includes(format)}
                          onChange={handleFormatChange}
                          value={format}
                        />
                      }
                      label={format}
                    />
                  ))}
                </Box>
              </Grid2>
              <Grid2 size={6}>
                <Box
                  sx={{
                    border: "1px solid #ccc",
                    height: "100%",
                    padding: 2,
                    boxSizing: "border-box",
                  }}
                >
                  <TextField
                    variant='outlined'
                    placeholder='Search Research...'
                    value={searchQuery}
                    onChange={handleSearchChange}
                    sx={{ width: "30rem" }}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position='start'>
                          <Search />
                        </InputAdornment>
                      ),
                    }}
                  />

                  {loading ? (
                    <Typography>Loading...</Typography>
                  ) : (
                    <>
                      {paginatedResearch.map((researchItem) => (
                        <Box
                          key={researchItem.research_id}
                          sx={{ marginBottom: 2 }}
                        >
                          <Typography variant='h6'>
                            {researchItem.title}
                          </Typography>
                          <Typography variant='body2'>
                            {researchItem.program_name} |{" "}
                            {researchItem.concatenated_authors} |{" "}
                            {researchItem.year}
                          </Typography>
                          <Typography variant='caption'>
                            {researchItem.journal}
                          </Typography>
                        </Box>
                      ))}
                      <Pagination
                        count={Math.ceil(
                          filteredResearch.length / itemsPerPage
                        )}
                        page={currentPage}
                        onChange={handleChangePage}
                        sx={{
                          mt: 2,
                          alignSelf: "center",
                        }}
                      />
                    </>
                  )}
                </Box>
              </Grid2>
              <Grid2 size={3}>
                <Button
                  onClick={handleNavigateKnowledgeGraph}
                  sx={{
                    width: "100%",
                    height: "100%",
                    border: "1px solid #ccc",
                    padding: 0,
                    boxSizing: "border-box",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Box
                    sx={{
                      width: "100%",
                      height: "100%",
                      backgroundColor: "#E0E0E0",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Typography variant='h5'>Knowledge Graph</Typography>
                  </Box>
                </Button>
              </Grid2>
            </Grid2>
          </Box>
        </Box>

        <Footer />
      </Box>
    </>
  );
};

export default DepartmentCollection;
