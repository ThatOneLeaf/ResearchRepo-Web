import React, { useEffect, useState } from "react";
import Navbar from "./navbar";
import DynamicTimeline from "./Timeline";
import StatusUpdateButton from "./StatusUpdateButton";
import { CircularProgress } from "@mui/material";
import { Link } from "react-router-dom";
import {
  Box,
  Button,
  IconButton,
  TextField,
  Typography,
  Grid2,
  Divider,
  Modal,
  MenuItem,
} from "@mui/material";
import Stack from '@mui/material/Stack';
import ArrowBackIosIcon from "@mui/icons-material/ArrowBackIos";
import DownloadIcon from '@mui/icons-material/Download';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { useNavigate } from "react-router-dom";
import { useLocation } from "react-router-dom";
import homeBg from "../assets/home_bg.png";
import axios from "axios";
import FileUploader from "./FileUploader";

const UpdateTrackingInfo = ({ route, navigate }) => {
  const [users, setUsers] = useState([]);
  const navpage = useNavigate();
  const location = useLocation();
  const [openModal, setOpenModal] = useState(false);
  const { id } = location.state || {}; // Default to an empty object if state is undefined
  const [data, setData] = useState(null); // Start with null to represent no data
  const [selectedUser, setSelectedUser] = useState(null);
  const [newRole, setNewRole] = useState("");
  const [loading, setLoading] = useState(true); // Track loading state

  const [conferenceTitle, setConferenceTitle] = useState("");
  const [singleCountry, setSingleCountry] = useState("");
  const [singleCity, setSingleCity] = useState("");
  const [countries, setCountries] = useState([]);
  const [Cities, setCities] = useState([]);
  const [dateApproved, setDateApproved] = useState("");

  const fetchCountries = async () => {
    let country = await axios.get(
      "https://countriesnow.space/api/v0.1/countries"
    );
    console.log(country);

    setCountries(country.data.data);
  };

  const fetchCities = (country) => {
    const selectedCountry = countries.find((c) => c.country === country);
    if (selectedCountry) {
      setCities(selectedCountry.cities);
      setSingleCity(""); // Reset city when country changes
    }
  };

  useEffect(() => {
    fetchCountries();
  }, []);

  useEffect(() => {
    if (id) {
      const fetchData = async () => {
        try {
          const response = await axios.get(
            `/dataset/fetch_ordered_dataset/${id}`
          );
          const fetchedDataset = response.data.dataset || []; // Use empty array if dataset is undefined
          console.log("Fetched data:", fetchedDataset);
          setData({ dataset: fetchedDataset });
        } catch (error) {
          console.error("Error fetching data:", error);
          setData({ dataset: [] }); // Set an empty dataset on error
        } finally {
          setLoading(false); // Stop loading regardless of success or failure
        }
      };
      fetchData();
    } else {
      console.warn("ID is undefined or null:", id);
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axios.get("/accounts/users");
        const fetchedUsers = response.data.researchers;
        setUsers(fetchedUsers);
      } catch (error) {
        console.error("Error fetching data of users:", error);
      } finally {
      }
    };

    fetchUsers();
  }, []);

  const handleOpenModal = () => {
    setOpenModal(true);
  };

  const handleCloseModal = () => {
    setConferenceTitle("");
    setSingleCountry("");
    setSingleCity("");
    setDateApproved("");
    setOpenModal(false);
  };

  const handleAddConference = async () => {
    try {
      // Validate required fields
      const requiredFields = {
        "Conference Title": conferenceTitle,
        Country: singleCountry,
        City: singleCity,
        "Conference Date": dateApproved
      };

      const missingFields = Object.entries(requiredFields)
        .filter(([_, value]) => {
          if (Array.isArray(value)) {
            return value.length === 0;
          }
          return !value;
        })
        .map(([key]) => key);

      if (missingFields.length > 0) {
        alert(
          `Please fill in all required fields: ${missingFields.join(", ")}`
        );
        return;
      }

      const formData = new FormData();

      // Get user_id from localStorage
      const userId = localStorage.getItem("user_id");
      formData.append("user_id", userId);

      // Add all required fields to formData
      formData.append("conference_title", conferenceTitle);
      formData.append("country", singleCountry);
      formData.append("city", singleCity);
      formData.append("conference_date", dateApproved);

      // Send the conference data
      const response = await axios.post("/conference/add_conference", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      console.log("Response:", response.data);
      alert("Conference added successfully!");
      handleCloseModal();
    } catch (error) {
      console.error("Error adding conference:", error);
      if (error.response) {
        console.error("Error response:", error.response.data);
        alert(
          `Failed to add conference: ${
            error.response.data.error || "Please try again."
          }`
        );
      } else {
        alert("Failed to add conference. Please try again.");
      }
    }
  };

  const [file, setFile] = useState(null);

  const onSelectFileHandler = (e) => {
    setFile(e.target.files[0]);
  };

  const onDeleteFileHandler = () => {};
  const handleViewManuscript = async (researchItem) => {
    const { research_id } = researchItem;
    if (research_id) {
      try {
        // Make the API request to get the PDF as a Blob kasi may proxy issue if directly window.open, so padaanin muna natin kay axios
        const response = await axios.get(
          `/paper/view_manuscript/${research_id}`,
          {
            responseType: "blob", // Get the response as a binary Blob (PDF)
          }
        );

        // Create a URL for the Blob and open it in a new tab
        const blob = new Blob([response.data], { type: "application/pdf" });
        const url = window.URL.createObjectURL(blob);

        // Open the PDF in a new tab
        window.open(url, "_blank");
      } catch (error) {
        console.error("Error fetching the manuscript:", error);
        alert("Failed to retrieve the manuscript. Please try again.");
      }
    } else {
      alert("No manuscript available for this research.");
    }
  };

  const [status, setStatus] = useState(null);
  const [error, setError] = useState(null);
  const [isButtonDisabled, setIsButtonDisabled] = useState(false);
  const [refreshTimeline, setRefreshTimeline] = useState(false); // Track refresh state

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const response = await axios.get(`/track/next_status/${id}`); // Replace with your API endpoint
        console.log("API Response:", response.data); // Log the raw response (string)

        setStatus(response.data); // Directly set the response if it's a string
      } catch (err) {
        console.error(err);
        setError("Failed to fetch status.");
      } finally {
        setLoading(false);
      }
    };

    fetchStatus();
  }, []);

  useEffect(() => {
    // Disable the button if the status is "PUBLISHED" or "PULLED OUT"
    if (status === "COMPLETED" || status === "PULLOUT" || status === "READY") {
      setIsButtonDisabled(true);
    } else {
      setIsButtonDisabled(false);
    }
  }, [status]);
  // Handle status update and refresh timeline
  const handleStatusUpdate = async (newStatus) => {
    try {
      // Make the status update request
      const response = await axios.post(`/track/research_status/${id}`, {
        status: newStatus,
      });

      if (response.status === 200 || response.status === 201) {
        // Toggle refresh to trigger timeline update
        setRefreshTimeline((prev) => !prev);

        // Fetch the next available status
        const nextStatusResponse = await axios.get(`/track/next_status/${id}`);
        setStatus(nextStatusResponse.data);
      }
    } catch (err) {
      console.error("Error updating status:", err);
      setError(err.response?.data?.message || "Failed to update status");
    }
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
        <Box
          sx={{
            flexGrow: 1,
            height: { xs: "100%", md: "calc(100vh - 9rem)" },
            marginTop: { xs: "3.5rem", sm: "4rem", md: "6rem" },
          }}
        >
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
              height: { xs: "5rem", md: "6rem" },
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
                backgroundSize: "cover",
                opacity: 0.25,
                zIndex: 1,
              }}
            />

            <Box
              sx={{
                display: "flex",
                flexDirection: "row",
                ml: "5rem",
                zIndex: 3,
              }}
            >
              <IconButton
                onClick={() => navpage(-1)}
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
                  fontSize: { xs: "1.5rem", sm: "2rem", md: "2.575rem" },
                  color: "#FFF",
                  alignSelf: "center",
                  zIndex: 2,
                }}
              >
                Update Tracking Info
              </Typography>
            </Box>
          </Box>

          {/*Main Content */}
          <Box
            sx={{
              padding: 5,
            }}
          >
            {/* Left-side Form Section*/}
            <Grid2
              container
              sx={{
                display: "flex",
                flexDirection: "flex-start",
                height: "100%",
              }}
            >
              <Grid2 display='flex' size={9}>
                <Box
                  sx={{
                    border: "2px solid #0A438F",
                    marginLeft: 10,
                    marginRight: 5,
                    padding: 4,
                    display: "flex",
                    flexDirection: "column",
                    height: "auto",
                    borderRadius: 3,
                  }}
                >
                  <form onSubmit={null}>
                    <Box
                      sx={{
                        width: "100%",
                        justifyContent: "center",
                      }}
                    >
                      <Grid2
                        container
                        sx={{ mb: "3rem", mt: "1rem" }}
                      >
                        {data && data.dataset && data.dataset.length > 0 ? (
                          data.dataset.map((item, index) => (
                            <Box
                              sx={{
                                display: "flex",
                                flexDirection: "column",
                                borderRadius: 2,
                                width: "100%",
                              }}
                            >
                              <Grid2 container display='flex' flexDirection='column'>
                              <Typography
                                  variant="h4"
                                  textAlign="left"
                                  fontWeight="700"
                                  sx={{ color: "#08397C", width: "90%" }}
                                  gutterBottom
                                >
                                  <Link
                                    to={`/displayresearchinfo/${id}`}
                                    state={{ id }}
                                    style={{ textDecoration: "none", color: "inherit" }}
                                  >
                                    {item.title}
                                    </Link>
                                </Typography>
                                <Typography 
                                  variant='h6' 
                                  sx={{ mb: "1rem" }} 
                                  alignSelf='left'
                                  fontWeight='600'
                                >
                                  {Array.isArray(item.authors)
                                    ? item.authors
                                        .map((author) => `${(author.name)}`)
                                        .join(", ")
                                    : "No authors available"}
                                </Typography>
                                <Typography
                                  variant='h7' 
                                  sx={{ mb: "1rem", color:"#8B8B8B"}} 
                                  alignSelf='left'
                                  fontWeight='500'
                                >
                                  {item.year}
                                </Typography>
                              </Grid2>                              
                              <Divider variant="left" sx={{ mt: "1rem", mb: "2rem"}}/>
                            </Box>
                          ))
                        ) : (
                          <div>
                            <p>No research information available.</p>
                          </div>
                        )}
                      </Grid2>
                      {/* Publication Part */}
                      <Typography
                        variant='body1'
                        padding={1}
                        sx={{ color: "#d40821" }}
                      >
                        Publication:
                      </Typography>
                      <Grid2 container padding={1} spacing={{ xs: 0, md: 3 }}>
                        <Grid2 item size={{ xs: 12, md: 3 }}>
                          <TextField
                            fullWidth
                            label='Publication Name'
                            name='publicationName'
                            value={null}
                            onChange={null}
                            variant='outlined'
                          ></TextField>
                        </Grid2>
                        <Grid2 item size={{ xs: 12, md: 3 }}>
                          <TextField
                            fullWidth
                            label='Publication Format'
                            name='publicationFormat'
                            value={null}
                            onChange={null}
                            variant='outlined'
                          ></TextField>
                        </Grid2>
                        <Grid2 item size={{ xs: 12, md: 3 }}>
                          <TextField
                            fullWidth
                            label='Published Date'
                            name='fundingagency'
                            value={null}
                            onChange={null}
                            variant='outlined'
                          ></TextField>
                        </Grid2>
                        <Grid2 item size={{ xs: 12, md: 3 }}>
                          <TextField
                            fullWidth
                            label='Scopus'
                            name='scopus'
                            value={null}
                            onChange={null}
                            variant='outlined'
                          ></TextField>
                        </Grid2>
                        <Grid2 item size={{ xs: 12, md: 12 }}>
                          <Typography variant='body1' sx={{ color: "#8B8B8B" }}>
                            Upload Extended Abstract:
                          </Typography>
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              border: "1px dashed #ccc",
                              borderRadius: 1,
                              p: 1,
                              cursor: "pointer",
                              justifyContent: "center",
                              gap: 2,
                              mb: 5,
                            }}
                          >
                            <FileUploader
                              onSelectFile={onSelectFileHandler}
                              onDeleteFile={onDeleteFileHandler}
                            />
                          </Box>
                        </Grid2>
                      </Grid2>
                      <Divider orientation='horizontal' flexItem />
                      <Typography
                        variant='body1'
                        padding={1}
                        sx={{ color: "#d40821" }}
                      >
                        Conference:
                      </Typography>
                      <Grid2
                        container
                        paddingLeft={1}
                        spacing={{ xs: 0, md: 3 }}
                      >
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            border: "1px dashed #ccc",
                            borderRadius: 1,
                            p: 1,
                            cursor: "pointer",
                            justifyContent: "center",
                            gap: 2,
                            mb: 1,
                          }}
                        >
                          <Button
                            variant='text'
                            color='primary'
                            sx={{
                              width: "20rem",
                              color: "#08397C",
                              fontFamily: "Montserrat, sans-serif",
                              fontWeight: 400,
                              textTransform: "none",
                              fontSize: { xs: "0.875rem", md: "1rem" },
                              alignSelf: "center",
                              maxHeight: "3rem",
                              "&:hover": {
                                color: "#052045",
                              },
                            }}
                            onClick={handleOpenModal}
                          >
                            + Add Conference
                          </Button>
                        </Box>
                      </Grid2>
                      <Box
                        sx={{
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "flex-end",
                          marginTop: 5,
                        }}
                      >
                        <Button
                          variant='contained'
                          color='primary'
                          sx={{
                            backgroundColor: "#08397C",
                            color: "#FFF",
                            fontFamily: "Montserrat, sans-serif",
                            fontWeight: 600,
                            textTransform: "none",
                            fontSize: { xs: "0.875rem", md: "1.275rem" },
                            padding: { xs: "0.5rem 1rem", md: "1.5rem" },
                            marginTop: "1rem",
                            width: "auto",
                            borderRadius: "100px",
                            maxHeight: "3rem",
                            "&:hover": {
                              backgroundColor: "#052045",
                              color: "#FFF",
                            },
                          }}
                        >
                          Update Info
                        </Button>
                      </Box>
                    </Box>
                  </form>
                </Box>
              </Grid2>

              {/* Add Conference Modal */}
              <Modal open={openModal} onClose={handleCloseModal}>
                <Box
                  sx={{
                    position: "absolute",
                    top: "50%",
                    left: "50%",
                    transform: "translate(-50%, -50%)",
                    width: "40rem",
                    bgcolor: "background.paper",
                    boxShadow: 24,
                    p: 5,
                    borderRadius: "8px",
                  }}
                >
                  <Typography
                    variant='h3'
                    color='#08397C'
                    fontWeight='1000'
                    mb={4}
                    sx={{
                      textAlign: { xs: "left", md: "bottom" },
                    }}
                  >
                    Add Conference
                  </Typography>
                  <TextField
                    label='Conference Title'
                    value={conferenceTitle}
                    fullWidth
                    onChange={(e) => setConferenceTitle(e.target.value)}
                    margin='normal'
                  />
                  <TextField
                    select
                    fullWidth
                    label='Country'
                    value={singleCountry}
                    onChange={(e) => {
                      setSingleCountry(e.target.value);
                      fetchCities(e.target.value);
                    }}
                    margin='normal'
                  >
                    <MenuItem value='' disabled>
                      Select your country
                    </MenuItem>
                    {countries.map((country) => (
                      <MenuItem key={country.country} value={country.country}>
                        {country.country}
                      </MenuItem>
                    ))}
                  </TextField>
                  <TextField
                    select
                    fullWidth
                    label='City'
                    value={singleCity}
                    onChange={(e) => setSingleCity(e.target.value)}
                    margin='normal'
                    disabled={!Cities.length} // Disable if no cities are loaded
                    helperText='Select country first to select city'
                  >
                    <MenuItem value='' disabled>
                      Select your city
                    </MenuItem>
                    {Cities.map((city) => (
                      <MenuItem key={city} value={city}>
                        {city}
                      </MenuItem>
                    ))}
                  </TextField>
                  <TextField
                    fullWidth
                    label='Date Approved'
                    variant='outlined'
                    type='date'
                    margin='normal'
                    value={dateApproved}
                    onChange={(e) => setDateApproved(e.target.value)}
                    InputLabelProps={{ shrink: true }}
                  />
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      mt: 5,
                    }}
                  >
                    <Button
                      onClick={handleCloseModal}
                      sx={{
                        backgroundColor: "#08397C",
                        color: "#FFF",
                        fontFamily: "Montserrat, sans-serif",
                        fontWeight: 600,
                        fontSize: { xs: "0.875rem", md: "1.275rem" },
                        padding: { xs: "0.5rem", md: "1.5rem" },
                        borderRadius: "100px",
                        maxHeight: "3rem",
                        textTransform: "none",
                        "&:hover": {
                          backgroundColor: "#072d61",
                        },
                      }}
                    >
                      Cancel
                    </Button>
                    <Button
                      variant='contained'
                      color='primary'
                      onClick={handleAddConference}
                      sx={{
                        backgroundColor: "#CA031B",
                        color: "#FFF",
                        fontFamily: "Montserrat, sans-serif",
                        fontWeight: 600,
                        textTransform: "none",
                        fontSize: { xs: "0.875rem", md: "1.275rem" },
                        padding: { xs: "0.5rem 1rem", md: "1.5rem" },
                        marginLeft: "2rem",
                        borderRadius: "100px",
                        maxHeight: "3rem",
                        "&:hover": {
                          backgroundColor: "#A30417",
                          color: "#FFF",
                        },
                      }}
                    >
                      Add
                    </Button>
                  </Box>
                </Box>
              </Modal>

              {/* Right-side Timeline Section*/}
              <Grid2
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  height: "100%",
                }}
                size={3}
              >
                <Box
                  sx={{
                    border: "2px solid #0A438F",
                    display: "flex",
                    flexDirection: "column",
                    width: "100%",
                    height: "auto",
                    borderRadius: 3,
                    padding: "1rem", // Optional padding for a better layout
                  }}
                >
                  <DynamicTimeline
                    researchId={id}
                    refresh={refreshTimeline}
                    sx={{
                      alignItems: "flex-start", // Align items to the start
                      "& .MuiTimelineContent-root": {
                        textAlign: "left", // Ensure content aligns left
                      },
                    }}
                  />
                </Box>
                {loading ? (
                  <CircularProgress />
                ) : error ? (
                  <div style={{ color: "red" }}>{error}</div>
                ) : (
                  status && (
                    <StatusUpdateButton
                      apiUrl={`/track/research_status/${id}`}
                      statusToUpdate={status}
                      disabled={isButtonDisabled}
                      onStatusUpdate={handleStatusUpdate}
                    />
                  )
                )}
              </Grid2>
            </Grid2>
          </Box>
        </Box>
      </Box>
    </>
  );
};

export default UpdateTrackingInfo;
