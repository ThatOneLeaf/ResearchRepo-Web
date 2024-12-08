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
  Select,
  FormControl,
  InputLabel,
  Modal,
  MenuItem,
  Pagination,
  InputAdornment
} from "@mui/material";
import { Search } from "@mui/icons-material";
import ArrowBackIosIcon from "@mui/icons-material/ArrowBackIos";
import { useNavigate } from "react-router-dom";
import { useLocation } from "react-router-dom";
import homeBg from "../assets/home_bg.png";
import axios from "axios";
import { Virtuoso } from "react-virtuoso";

const UpdateTrackingInfo = ({ route, navigate }) => {
  const navpage = useNavigate();
  const location = useLocation();
  const [openModal, setOpenModal] = useState(false);
  const [openModalPub, setOpenModalPub] = useState(false);
  const [openModalCon, setOpenModalCon] = useState(false);
  const { id } = location.state || {}; // Default to an empty object if state is undefined
  const [data, setData] = useState(null); // Start with null to represent no data
  const [selectedUser, setSelectedUser] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [newRole, setNewRole] = useState("");
  const [loading, setLoading] = useState(true); // Track loading state
  const [currentPage, setCurrentPage] = useState(1);

  const [pubData, setPubData] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [initialValues, setInitialValues] = useState(null);

  const [publicationName, setPublicationName] = useState("");
  const [datePublished, setDatePublished] = useState("");
  const [publicationFormat, setPublicationFormat] = useState("");
  const [indexingStatus, setIndexingStatus] = useState("");

  const [conferences, setConferences] = useState([]);
  const [filteredConferences, setFilteredConferences] = useState([]);

  const [selectedTitle, setSelectedTitle] = useState("");
  const [selectedVenue, setSelectedVenue] = useState("");
  const [selectedDate, setSelectedDate] = useState("");

  const [conferenceTitle, setConferenceTitle] = useState("");
  const [singleCountry, setSingleCountry] = useState("");
  const [singleCity, setSingleCity] = useState("");
  const [countries, setCountries] = useState([]);
  const [Cities, setCities] = useState([]);
  const [dateApproved, setDateApproved] = useState("");

  const itemsPerPage = 5;

///////////////////// PUBLICATION DATA RETRIEVAL //////////////////////

  // Retrives publication data from the database
  useEffect(() => {
    const fetchPublication = async () => {
      try {
        const response = await axios.get(`/track/publication/${id}`);
        
        if (response.data.dataset && response.data.dataset.length > 0) {
          const fetched_data = response.data.dataset;
          console.log("Fetched publication data:", fetched_data);

          const initialData = {
            publication_name : fetched_data[0].publication_name || "",
            journal : fetched_data[0].journal || "",
            date_published : fetched_data[0].date_published,
            scopus : fetched_data[0].scopus || "",
            conference_title : fetched_data[0].conference_title || "",
            conference_venue : `${fetched_data[0].city}, ${fetched_data[0].country}` || "",
            conference_date : fetched_data[0].conference_date || "",
          };
          
          setInitialValues(initialData);
          console.log(initialData);

          // Set current values
          setPublicationName(initialData.publication_name);
          setPublicationFormat(initialData.journal);
          setDatePublished(initialData.date_published);
          setIndexingStatus(initialData.scopus);
          setSelectedTitle(initialData.conference_title);
          setSelectedVenue(initialData.conference_venue);
          setSelectedDate(initialData.conference_date);

          setPubData({ dataset: fetched_data });
        }
      } catch (error) {
        console.error("Error fetching publication data:", error);
      } finally {
      }
    };

    fetchPublication();
  }, [id]);

  const isPaperEmpty = Array.isArray(pubData) && pubData.length === 0; // Checks if there are data to be retrived from the database

  // Fetch all conference titles
  const fetchConferenceTitles = async () => {
    try {
      const response = await axios.get(`/data/conferences`);
      const fetchConferences = response.data.conferences
      setConferences(fetchConferences);
      setFilteredConferences(fetchConferences)
    } catch (error) {
      console.error("Error fetching conference titles:", error);
    }
  };

  // Fetch all conference_titles
  useEffect(() => {
    fetchConferenceTitles();
  }, []);

///////////////////// RESEARCH DATA RETRIEVAL //////////////////////
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

///////////////////// COUNTRY AND CITY API RETRIEVAL //////////////////////
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

///////////////////// SELECTING AND ADDING CONFERENCE //////////////////////
useEffect(() => {
    let filtered = conferences;

    // Filter by Search Query
    if (searchQuery) {
      filtered = filtered.filter((conference) => {
        const titleMatch = conference.conference_title
          .toLowerCase()
          .includes(searchQuery.toLowerCase());
        const venueMatch = conference.conference_venue
          .toLowerCase()
          .includes(searchQuery.toLowerCase());

        return titleMatch || venueMatch;
      });
    }
    setFilteredConferences(filtered);
    setCurrentPage(1); // Reset to the first page on filter change
  }, [
    searchQuery,
    conferences,
  ]);

  // Handle change in search query
  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value.toLowerCase());
  };

  // Get the paginated conference details
  const paginatedConferences = filteredConferences.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Handle pagination change
  const handleChangePage = (event, newPage) => {
    setCurrentPage(newPage);
  };

  const handleConferenceSelection = () => {
    // Split the venue into parts
    const venueParts = selectedVenue?.split(",") || []; // Ensure safe splitting
    const city = venueParts[0]?.trim(); // First part as city (if exists)
    const country = venueParts[1]?.trim() || venueParts[0]?.trim(); // Second part as country, fallback to the first part
    
    setSingleCountry(country);                                
    setSingleCity(venueParts.length > 1 ? city : ""); // Set city only if it exists

    handleCloseModal();
  }

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

      // Check if the conference date is valid and in the future
      const today = new Date();
      const approvedDate = new Date(dateApproved);
      if (dateApproved && approvedDate <= today) {
        alert(
          "Conference Date must be in the future"
        );
        return;
      }

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

      setSelectedTitle(conferenceTitle);
      setSelectedVenue(`${singleCity}, ${singleCountry}`)
      setSelectedDate(dateApproved)
      
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

///////////////////// ADD AND EDIT PUBLICATION //////////////////////
  const handleSavePublication = async () => {

    if (selectedVenue) {
      const venue = selectedVenue.split(",").map(item => item.trim());
      setSingleCity(venue.length > 1 ? venue[0] : "");
      setSingleCountry(venue[1]);
    }

    try {
      // Validate required fields
      // Determine required fields based on publicationFormat
      let requiredFields;

      if (publicationFormat === "journal") {
        requiredFields = {
          "Publication Name": publicationName,
          "Publication Format": publicationFormat,
          "Indexing Status": indexingStatus,
        };
      } else if (publicationFormat === "proceeding") {
        requiredFields = {
          "Publication Name": publicationName,
          "Publication Format": publicationFormat,
          "Indexing Status": indexingStatus,
          "Conference Title": selectedTitle,
          "Conference Venue": selectedVenue,
          "Conference Date": selectedDate,
        };
      } else {
        alert("Invalid indexing status. Please select either 'journal' or 'proceeding'.");
        return;
      }

      const missingFields = Object.entries(requiredFields)
        .filter(([_, value]) => {
          if (Array.isArray(value)) {
            return value.length === 0;
          }
          return !value;
        })
        .map(([key]) => key);

        const approvedDate = new Date(datePublished);
        const today = new Date();

        // Normalize both dates to midnight
        approvedDate.setHours(0, 0, 0, 0);
        today.setHours(0, 0, 0, 0);

        

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
      formData.append("publication_name", publicationName);
      formData.append("journal", publicationFormat);
      formData.append("date_published", datePublished);
      formData.append("scopus", indexingStatus);
      formData.append("conference_title", selectedTitle);
      formData.append("city", singleCity);
      formData.append("country", singleCountry);
      formData.append("conference_date", selectedDate);

      // Send the conference data
      const response = await axios.post(`/track/publication/${id}`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      console.log("Response:", response.data);
      alert("Publication added successfully!");
      handleFormCleanup();

      window.location.reload();
      
    } catch (error) {
      console.error("Error adding publication:", error);
      if (error.response) {
        console.error("Error response:", error.response.data);
        alert(
          `Failed to add publication: ${
            error.response.data.error || "Please try again."
          }`
        );
      } else {
        alert("Failed to add publication. Please try again.");
      }
    }
  };

  const handleSaveDetails = () => {
    // Check if there are any changes by comparing the current state with initial data
    const hasChanges =
      publicationName != initialValues?.publication_name ||
      publicationFormat != initialValues?.journal ||
      datePublished != initialValues?.date_published ||
      indexingStatus != initialValues?.scopus ||
      selectedTitle != initialValues?.conference_title ||
      selectedDate != initialValues?.conference_date ||
      selectedVenue != initialValues?. conference_venue;

    console.log("Initial Data:", initialValues);

    if (!hasChanges) {
      alert("No changes are made. Please modify publication data before saving.");
    } else {
      handleEditPublication();
    }
  };

  const handleEditPublication = async () => {
    try {
      // Validate required fields
      // Determine required fields based on publicationFormat
      let requiredFields;

      if (publicationFormat === "journal") {
        requiredFields = {
          "Publication Name": publicationName,
          "Publication Format": publicationFormat,
          "Indexing Status": indexingStatus,
        };
      } else if (publicationFormat === "proceeding") {
        requiredFields = {
          "Publication Name": publicationName,
          "Publication Format": publicationFormat,
          "Indexing Status": indexingStatus,
          "Conference Title": selectedTitle,
          "Conference Venue": selectedVenue,
          "Conference Date": selectedDate,
        };
      } else {
        alert("Invalid indexing status. Please select either 'journal' or 'proceeding'.");
        return;
      }

      const missingFields = Object.entries(requiredFields)
        .filter(([_, value]) => {
          if (Array.isArray(value)) {
            return value.length === 0;
          }
          return !value;
        })
        .map(([key]) => key);

        const approvedDate = new Date(datePublished);
        const today = new Date();

        // Normalize both dates to midnight
        approvedDate.setHours(0, 0, 0, 0);
        today.setHours(0, 0, 0, 0);

        

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
      formData.append("publication_name", publicationName);
      formData.append("journal", publicationFormat);
      formData.append("date_published", datePublished);
      formData.append("scopus", indexingStatus);
      formData.append("conference_title", selectedTitle);
      formData.append("city", singleCity);
      formData.append("country", singleCountry);
      formData.append("conference_date", selectedDate);

      // Send the conference data
      const response = await axios.put(`/track/publication/${id}`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      console.log("Response:", response.data);
      alert("Publication updated successfully!");
      handleFormCleanup();

      window.location.reload();
      
    } catch (error) {
      console.error("Error updating publication:", error);
      if (error.response) {
        console.error("Error response:", error.response.data);
        alert(
          `Failed to update publication: ${
            error.response.data.error || "Please try again."
          }`
        );
      } else {
        alert("Failed to update publication. Please try again.");
      }
    }
  }

  // Revert variables to initial values if editing cancelled
  const toggleEdit = () =>{
    if (isEditing){
      setPublicationName(initialValues.publication_name)
      setPublicationFormat(initialValues.journal);
      setDatePublished(initialValues.date_published);
      setIndexingStatus(initialValues.scopus);
      setSelectedTitle(initialValues.conference_title);
      setSelectedDate(initialValues.conference_date);
      setSelectedVenue(initialValues.conference_venue);
    }
    setIsEditing(!isEditing); // Switch view state from view to edit; vice versa
  };

///////////////////// TRACKING PART //////////////////////
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

  // Handle pull out status update
  const handlePullOut = async (newStatus) => {
    try {
      // Make the status update request
      const response = await axios.post(`/track/research_status/pullout/${id}`);

      if (response.status === 200 || response.status === 201) {
        // Toggle refresh to trigger timeline update
        setRefreshTimeline((prev) => !prev);
      }
    } catch (err) {
      console.error("Error updating status:", err);
      setError(err.response?.data?.message || "Failed to update status");
    }
  };

///////////////////// PRE-POST MODAL HANDLING //////////////////////
  const handleResetCon = () => {
    setSelectedTitle("");
    setSelectedVenue("");
    setSelectedDate("");
  }

  const handleOpenModal = () => {
    setOpenModal(true);
  };

  const handleOpenModalPub = () => {
    setOpenModalPub(true);
  };

  const handleOpenModalCon = () => {
    setOpenModalCon(true);
  };

  const handleCloseModal = () => {
    setOpenModalPub(false);

    setSearchQuery("");
    setOpenModalCon(false);

    setOpenModal(false);

    handleFormCleanup();
  };
  
  const handleFormCleanup = () => {
    setPublicationName("");
    setPublicationFormat("");
    setDatePublished("");
    setIndexingStatus("");

    setConferenceTitle("");
    setSingleCountry("");
    setSingleCity("");
    setDateApproved("");

    setSelectedTitle("");
    setSelectedVenue("");
    setSelectedDate("");
  }

  // Utility function to create responsive TextField styles
  const createTextFieldStyles = (customFlex = 2) => ({
    flex: customFlex,
    '& .MuiInputBase-input': {
      fontSize: { 
        xs: '0.6em',   // Mobile
        sm: '0.7rem',   // Small devices
        md: '0.8rem',    // Medium devices
        lg: '0.9rem'        // Large devices
      },
    }
  });

  // Utility function to create responsive label styles
  const createInputLabelProps = () => ({
    sx: {
      fontSize: { 
        xs: '0.55rem',   // Mobile
        sm: '0.65rem',   // Small devices
        md: '0.75rem',    // Medium devices
        lg: '0.85rem'     // Large devices
      }
    }
  });

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
            marginTop: { xs: "3.5rem", sm: "4rem", md: "5rem" },
            height: {
              xs: "calc(100vh - 3.5rem)",
              sm: "calc(100vh - 4rem)",
              md: "calc(100vh - 6rem)",
            },
          }}
        >
          {/* Header with back button */}
          <Box
            sx={{
              position: "relative",
              width: "100%",
              height: {
                xs: "clamp(2rem, 3vh, 3rem)",
                sm: "clamp(3rem, 8vh, 4rem)",
                md: "clamp(3rem, 14vh, 4rem)",
                lg: "clamp(4rem, 20vh, 5rem)"
              },
              backgroundColor: "#0A438F",
              backgroundSize: "cover",
              backgroundPosition: "center",
              display: "flex",
              alignItems: "center",
              zIndex: 1
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
                onClick={() => navpage(-1)}
                sx={{
                  color: "#fff",
                  transform: {
                    xs: "scale(0.8)",
                    sm: "scale(1)",
                    md: "scale(1.2)"
                  }
                }}
              >
                <ArrowBackIosIcon />
              </IconButton>
              <Typography
                variant='h3'
                sx={{
                  py: 5,
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
                  zIndex: 2
                }}
              >
                Update Tracking Info
              </Typography>
            </Box>
          </Box>


          {/*Main Content */}
          <Box
            sx={{
              padding: 3,
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
              <Grid2
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  height: "100%",
                }}
                size={8}
              >
                <Box
                  sx={{
                    border: "1.5px solid #0A438F",
                    marginLeft: 10,
                    marginRight: 5,
                    padding: 3,
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
                              <Grid2 container display='flex' flexDirection='column' sx={{padding: 1}}>
                              <Typography
                                  variant="h3"
                                  textAlign="left"
                                  fontWeight="700"
                                  sx={{ mb: "0.5rem", color: "#08397C", width: "90%", fontSize: {
                                    xs: "clamp(1rem, 2vw, 1rem)",
                                    sm: "clamp(1.5rem, 3.5vw, 1.5rem)",
                                    md: "clamp(2rem, 4vw, 2rem)",
                                  } }}
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
                                  variant='h7' 
                                  sx={{ mb: "0.5rem", fontSize: {
                                    xs: "clamp(0.7rem, 2vw, 0.7rem)",
                                    sm: "clamp(0.8rem, 3.5vw, 0.8rem)",
                                    md: "clamp(1rem, 4vw, 1rem)",
                                  }, }} 
                                  alignSelf='left'
                                  fontWeight='700'
                                >
                                  {Array.isArray(item.authors)
                                    ? item.authors
                                        .map((author) => `${(author.name)}`)
                                        .join(", ")
                                    : "No authors available"}
                                </Typography>
                                <Typography
                                  variant='h7' 
                                  sx={{ mb: "1rem", color:"#8B8B8B", fontSize: {
                                    xs: "clamp(0.7rem, 2vw, 0.7rem)",
                                    sm: "clamp(0.7rem, 3.5vw, 0.7rem)",
                                    md: "clamp(0.8rem, 4vw, 0.8rem)",
                                  }}} 
                                  alignSelf='left'
                                  fontWeight='500'
                                >
                                  {item.year}
                                </Typography>
                              </Grid2>                              
                              <Divider variant="left" sx={{ mb: "0.5rem"}}/>
                            </Box>
                          ))
                        ) : (
                          <div>
                            <p>No research information available.</p>
                          </div>
                        )}
                      </Grid2>
                      {/* Publication Part */} 
                      <Box padding={1}>                 
                          
                        {isPaperEmpty ? (
                          <Typography
                            variant='h6'
                            sx={{ color: "#d40821" }}
                          >
                            No Publication Available
                          </Typography>
                        ) : (
                          <Box>
                            <Box>
                              {pubData && pubData.dataset && pubData.dataset.length > 0 ? (
                                <Box
                                  sx={{
                                    display: "flex",
                                    flexDirection: "column",
                                    position: "relative",
                                    width: "100%",
                                    borderRadius: 2,
                                    height: "auto",
                                  }}
                                >
                                  <Grid2 display='flex' flexDirection='row'>
                                    <Grid2 size={6}>
                                        <Typography variant="h6" color='#d40821' fontWeight="700" sx={{ mb: "1rem", fontSize: { xs: "0.8rem", md: "1rem", lg: "1.1rem" } }}>
                                            Publication:
                                        </Typography>
                                    </Grid2>
                                    <Grid2 size={6}>
                                      {publicationFormat !== 'journal' && (
                                        <Typography variant="h6" color='#d40821' fontWeight="700" sx={{ mb: "1rem", fontSize: { xs: "0.8rem", md: "1rem", lg: "1.1rem" } }}>
                                            Conference:
                                        </Typography>
                                      )}
                                    </Grid2>
                                  </Grid2>
                                  <Grid2 display='flex' flexDirection='row'>
                                    <Grid2 size={6}>
                                      <Grid2 item sx={{ mb: "1rem", mr: "3rem"}}>
                                        {isEditing ? (
                                          <TextField
                                            fullWidth
                                            label='Publication Name'
                                            name='publicationName'
                                            value={publicationName || "None"}
                                            variant='outlined'
                                            onChange={(e) => setPublicationName(e.target.value)}
                                            sx={createTextFieldStyles()}
                                            InputLabelProps={createInputLabelProps()}
                                            />
                                          ) : (
                                            <Typography variant="h7" sx={{ mb: "1rem", fontSize: { xs: "0.7rem", md: "0.8rem", lg: "0.9rem" } }}>
                                                <strong>Publication Name:</strong> {publicationName || "None"}
                                            </Typography>
                                          )}
                                      </Grid2>
                                      <Grid2 item sx={{ mb: "1rem", mr: "3rem"}}>
                                        {isEditing ? (
                                          <TextField
                                            fullWidth
                                            label='Date Published'
                                            name='date_published'
                                            type="date"
                                            value={datePublished ? new Date(datePublished).toLocaleDateString('en-CA') : ''}
                                            variant='outlined'
                                            sx={createTextFieldStyles()}
                                            InputLabelProps={{
                                              ...createInputLabelProps(),
                                              shrink: true
                                            }}
                                            onChange={(e) => setDatePublished(e.target.value)}
                                            />
                                          ) : (
                                            <Typography variant="h7" sx={{ mb: "1rem", fontSize: { xs: "0.7rem", md: "0.8rem", lg: "0.9rem" } }}>
                                                <strong>Date Published:</strong> {datePublished || "None"}
                                            </Typography>
                                          )}
                                      </Grid2>
                                      <Grid2 item sx={{ mb: "1rem", mr: "3rem" }}>
                                        {isEditing ? (
                                          <FormControl fullWidth variant='outlined'>
                                            <InputLabel sx={{fontSize: { xs: "0.75rem", md: "0.75rem", lg: "0.8rem" }}}>Format</InputLabel>
                                              <Select
                                                label='Format'
                                                sx={createTextFieldStyles()}
                                                value={publicationFormat || ''}
                                                onChange={(e) => setPublicationFormat(e.target.value)}
                                              >
                                                <MenuItem value='journal'>Journal</MenuItem>
                                                <MenuItem value='proceeding'>Proceeding</MenuItem>
                                              </Select>
                                          </FormControl>
                                        ) : (
                                          <Typography variant="h7" sx={{ mb: "1rem", fontSize: { xs: "0.7rem", md: "0.8rem", lg: "0.9rem" } }}>
                                            <strong>Format:</strong>{" "}
                                            {publicationFormat 
                                              ? publicationFormat.charAt(0).toUpperCase() + publicationFormat.slice(1).toLowerCase() 
                                              : "None"}
                                          </Typography>
                                        )}
                                        
                                      </Grid2>
                                      <Grid2 item sx={{ mb: "1rem", mr: "3rem" }}>
                                      {isEditing ? (
                                        <FormControl fullWidth variant='outlined' >
                                          <InputLabel sx={{fontSize: { xs: "0.75rem", md: "0.75rem", lg: "0.8rem" }}}>Indexing Status</InputLabel>
                                            <Select
                                              label='Indexing Status'
                                              sx={createTextFieldStyles()}
                                              value={indexingStatus || ''}
                                              onChange={(e) => setIndexingStatus(e.target.value)}
                                            >
                                              <MenuItem value='SCOPUS'>Scopus</MenuItem>
                                              <MenuItem value='NON-SCOPUS'>Non-Scopus</MenuItem>
                                            </Select>
                                        </FormControl>
                                        ) : (
                                          <Typography variant="h7" sx={{ mb: "1rem", fontSize: { xs: "0.7rem", md: "0.8rem", lg: "0.9rem" } }}>
                                            <strong>Indexing Status:</strong>{" "}
                                            {indexingStatus 
                                              ? indexingStatus.charAt(0).toUpperCase() + indexingStatus.slice(1).toLowerCase() 
                                              : "None"}
                                          </Typography>
                                        )} 
                                      </Grid2>
                                    </Grid2>

                                    {publicationFormat !== 'journal' && (
                                      <Grid2 size={6}>
                                        <Grid2 item sx={{ mb: '1rem', mr: '2rem' }}>
                                          {isEditing ? (
                                            <Box display="flex" flexDirection="column">
                                              <Typography variant="h7" sx={{ mb: '1rem', fontSize: { xs: "0.7rem", md: "0.8rem", lg: "0.9rem" } }}>
                                                <strong>Title:</strong> {selectedTitle || 'None'}
                                              </Typography>
                                              <Typography variant="h7" sx={{ mb: '1rem', fontSize: { xs: "0.7rem", md: "0.8rem", lg: "0.9rem" } }}>
                                                <strong>Date:</strong> {selectedDate || 'None'}
                                              </Typography>
                                              <Typography variant="h7" sx={{ mb: '1rem', fontSize: { xs: "0.7rem", md: "0.8rem", lg: "0.9rem" } }}>
                                                <strong>Venue:</strong> {selectedVenue || 'None'}
                                              </Typography>
                                              <Box
                                                sx={{
                                                  display: 'flex',
                                                  alignItems: 'center',
                                                  border: '1px dashed #0A438F',
                                                  borderRadius: 1,
                                                  m: 0.5,
                                                  cursor: 'pointer',
                                                  justifyContent: 'center',
                                                  gap: 2,
                                                }}
                                              >
                                                <Button
                                                  variant="text"
                                                  color="primary"
                                                  sx={{
                                                    color: '#08397C',
                                                    fontFamily: 'Montserrat, sans-serif',
                                                    fontWeight: 600,
                                                    textTransform: 'none',
                                                    fontSize: { xs: "0.5rem", md: "0.65rem", lg: "0.8rem" },
                                                    alignSelf: 'center',
                                                    maxHeight: '2rem',
                                                    '&:hover': {
                                                      color: '#052045',
                                                    },
                                                  }}
                                                  onClick={handleOpenModalCon}
                                                >
                                                  Change Conference
                                                </Button>
                                              </Box>
                                              <Box
                                                sx={{
                                                  display: 'flex',
                                                  alignItems: 'center',
                                                  border: '1px dashed #0A438F',
                                                  borderRadius: 1,
                                                  m: 0.5,
                                                  cursor: 'pointer',
                                                  justifyContent: 'center',
                                                  gap: 2,
                                                }}
                                              >
                                                <Button
                                                  variant="text"
                                                  color="primary"
                                                  sx={{
                                                    width: '100%',
                                                    color: '#08397C',
                                                    fontFamily: 'Montserrat, sans-serif',
                                                    fontWeight: 600,
                                                    textTransform: 'none',
                                                    fontSize: { xs: "0.5rem", md: "0.65rem", lg: "0.8rem" },
                                                    alignSelf: 'center',
                                                    maxHeight: '2rem',
                                                    '&:hover': {
                                                      color: '#052045',
                                                    },
                                                  }}
                                                  onClick={handleOpenModal}
                                                >
                                                  + Add Conference
                                                </Button>
                                              </Box>
                                              <Box
                                                sx={{
                                                  display: 'flex',
                                                  alignItems: 'center',
                                                  border: '1px dashed #CA031B',
                                                  borderRadius: 1,
                                                  m: 0.5,
                                                  cursor: 'pointer',
                                                  justifyContent: 'center',
                                                  gap: 2,
                                                }}
                                              >
                                                <Button
                                                  variant="text"
                                                  color="primary"
                                                  sx={{
                                                    width: '100%',
                                                    color: '#CA031B',
                                                    fontFamily: 'Montserrat, sans-serif',
                                                    fontWeight: 600,
                                                    textTransform: 'none',
                                                    fontSize: { xs: "0.5rem", md: "0.65rem", lg: "0.8rem" },
                                                    alignSelf: 'center',
                                                    maxHeight: '2rem',
                                                    '&:hover': {
                                                      color: '#A30417',
                                                    },
                                                  }}
                                                  onClick={handleResetCon}
                                                >
                                                  Reset
                                                </Button>
                                              </Box>
                                            </Box>
                                          ) : (
                                            <Box display="flex" flexDirection="column">
                                              <Typography variant="h7" sx={{ mb: '1rem', fontSize: { xs: "0.7rem", md: "0.8rem", lg: "0.9rem" } }}>
                                                <strong>Title:</strong> {selectedTitle || 'None'}
                                              </Typography>
                                              <Typography variant="h7" sx={{ mb: '1rem', fontSize: { xs: "0.7rem", md: "0.8rem", lg: "0.9rem" } }}>
                                                <strong>Date:</strong> {selectedDate || 'None'}
                                              </Typography>
                                              <Typography variant="h7" sx={{ mb: '1rem', fontSize: { xs: "0.7rem", md: "0.8rem", lg: "0.9rem" } }}>
                                                <strong>Venue:</strong> {selectedVenue || 'None'}
                                              </Typography>
                                            </Box>
                                          )}
                                        </Grid2>
                                      </Grid2>
                                    )}
                                  </Grid2>
                                  <Box
                                    sx={{
                                      display: "flex",
                                      alignItems: "flex-start",
                                      gap: 3
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
                                        fontSize: { xs: "0.55rem", md: "0.75rem", lg: "0.9rem" },
                                        marginTop: '1rem',
                                        paddingLeft: '1.5rem',
                                        paddingRight: '1.5rem',
                                        borderRadius: "100px",
                                        maxHeight: "3rem",
                                        "&:hover": {
                                          backgroundColor: "#072d61",
                                        },
                                      }}
                                      onClick={toggleEdit}
                                    >
                                      {isEditing ? "Cancel" : "Edit"}
                                    </Button>

                                    {isEditing && (
                                      <Button
                                        variant='contained'
                                        color='primary'
                                        onClick={handleSaveDetails}
                                        sx={{
                                          backgroundColor: "#CA031B",
                                          color: "#FFF",
                                          fontFamily: "Montserrat, sans-serif",
                                          fontWeight: 600,
                                          textTransform: "none",
                                          fontSize: { xs: "0.55rem", md: "0.75rem", lg: "0.9rem" },
                                          marginTop: '1rem',
                                          paddingLeft: '1.5rem',
                                          paddingRight: '1.5rem',
                                          borderRadius: "100px",
                                          maxHeight: "3rem",
                                          "&:hover": {
                                            backgroundColor: "#A30417",
                                            color: "#FFF",
                                          },
                                        }}
                                      >
                                        Save
                                      </Button>
                                    )}
                                  </Box>
                                </Box>                       
                              ) : (
                                <Box display='flex' flexDirection='column' justifyContent='center'>
                                  <Typography variant="h6" color='#d40821' fontWeight="700" sx={{fontSize: { xs: "0.8rem", md: "1rem", lg: "1.1rem" }}}>
                                      Publication:
                                  </Typography>
                                  <Grid2 display='flex' flexDirection='column' padding='1rem'>
                                    <Typography variant="h7" sx={{ mb: "1rem", fontSize: { xs: "0.7rem", md: "0.8rem", lg: "0.9rem" } }}>
                                        <strong>Name:</strong> {publicationName || "None"}
                                    </Typography>
                                    <Typography variant="h7" sx={{ mb: "1rem", fontSize: { xs: "0.7rem", md: "0.8rem", lg: "0.9rem" }  }}>
                                        <strong>Format:</strong> {publicationFormat || "None"}
                                    </Typography>
                                    <Typography variant="h7" sx={{ mb: "1rem", fontSize: { xs: "0.7rem", md: "0.8rem", lg: "0.9rem" }  }}>
                                        <strong>Date:</strong> {datePublished || "None"}
                                    </Typography>
                                    <Typography variant="h7" sx={{fontSize: { xs: "0.7rem", md: "0.8rem", lg: "0.9rem" } }}>
                                        <strong>Indexing Status:</strong> {indexingStatus || "None"}
                                    </Typography>
                                  </Grid2>
                                  <Grid2 container size={4} justifyContent='flex-start' margin="1rem">
                                      <Box
                                        sx={{
                                          display: 'flex',
                                          alignItems: 'center',
                                          border: '1px dashed #0A438F',
                                          borderRadius: 1,
                                          cursor: 'pointer',
                                          justifyContent: 'center',
                                          gap: 2,
                                        }}
                                      >
                                        <Button
                                          variant="text"
                                          color="primary"
                                          sx={{
                                            width: '100%',
                                            color: '#08397C',
                                            fontFamily: 'Montserrat, sans-serif',
                                            fontWeight: 600,
                                            textTransform: 'none',
                                            fontSize: { xs: "0.7rem", md: "0.8rem", lg: "0.9rem" },
                                            padding: '1rem',
                                            alignSelf: 'center',
                                            maxHeight: '2rem',
                                            '&:hover': {
                                              color: '#052045',
                                            },
                                          }}
                                          onClick={handleOpenModalPub}
                                        >
                                          + Add Publication
                                      </Button>
                                    </Box>
                                  </Grid2>
                                  <Divider orientation='horizontal' flexItem  sx={{mt: "1rem", mb: "1rem"}}/>
                                  {publicationFormat !== "journal" && ( // Render only if the selected type is not "Journal"
                                    <>
                                      <Typography variant="h6" color='#d40821' fontWeight="700" sx={{fontSize: { xs: "0.8rem", md: "1rem", lg: "1.1rem" }}}>
                                        Conference:
                                      </Typography>
                                      <Grid2 display='flex' flexDirection='column' padding='1rem'>
                                        <Typography variant="h7" sx={{ mb: "1rem", fontSize: { xs: "0.7rem", md: "0.8rem", lg: "0.9rem" } }}>
                                          <strong>Title:</strong> {selectedTitle || "None"}
                                        </Typography>
                                        <Typography variant="h7" sx={{ mb: "1rem", fontSize: { xs: "0.7rem", md: "0.8rem", lg: "0.9rem" } }}>
                                          <strong>Venue:</strong> {selectedVenue || "None"}
                                        </Typography>
                                        <Typography variant="h7" sx={{ mb: "1rem", fontSize: { xs: "0.7rem", md: "0.8rem", lg: "0.9rem" } }}>
                                          <strong>Date:</strong> {selectedDate || "None"}
                                        </Typography>
                                      </Grid2>
                                      <Grid2 display='flex' paddingLeft='1rem' justifyContent='flex-start' gap={3}>
                                        <Box
                                          sx={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            border: '1px dashed #0A438F',
                                            borderRadius: 1,
                                            cursor: 'pointer',
                                            justifyContent: 'center',
                                            gap: 2,
                                          }}
                                        >
                                          <Button
                                            variant="text"
                                            color="primary"
                                            sx={{
                                              width: '100%',
                                              color: '#08397C',
                                              fontFamily: 'Montserrat, sans-serif',
                                              fontWeight: 600,
                                              textTransform: 'none',
                                              fontSize: { xs: "0.6rem", md: "0.7rem", lg: "0.9rem" },
                                              padding: '1rem',
                                              alignSelf: 'center',
                                              maxHeight: '2rem',
                                              '&:hover': {
                                                color: '#052045',
                                              },
                                            }}
                                            onClick={handleOpenModalCon}
                                          >
                                            Select Conference
                                          </Button>
                                        </Box>
                                        <Box
                                          sx={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            border: '1px dashed #0A438F',
                                            borderRadius: 1,
                                            cursor: 'pointer',
                                            justifyContent: 'center',
                                            gap: 2,
                                          }}
                                        >
                                          <Button
                                            variant="text"
                                            color="primary"
                                            sx={{
                                              width: '100%',
                                              color: '#08397C',
                                              fontFamily: 'Montserrat, sans-serif',
                                              fontWeight: 600,
                                              textTransform: 'none',
                                              fontSize: { xs: "0.6rem", md: "0.7rem", lg: "0.9rem" },
                                              padding: '1rem',
                                              alignSelf: 'center',
                                              maxHeight: '2rem',
                                              '&:hover': {
                                                color: '#052045',
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
                                          marginTop: 3,
                                        }}
                                      >
                                      </Box>
                                    </>
                                  )}
                                  <Button
                                    variant='contained'
                                    color='primary'
                                    sx={{
                                      display: 'flex',
                                      backgroundColor: "#08397C",
                                      color: "#FFF",
                                      fontFamily: "Montserrat, sans-serif",
                                      fontWeight: 600,
                                      textTransform: "none",
                                      fontSize: { xs: "0.65rem", md: "0.8rem", lg: "1rem" },
                                      marginTop: '1rem',
                                      alignSelf: 'center',
                                      paddingLeft: '3rem',
                                      paddingRight: '3rem',
                                      borderRadius: "100px",
                                      maxHeight: "3rem",
                                      "&:hover": {
                                        backgroundColor: "#052045",
                                        color: "#FFF",
                                      },
                                    }}
                                    onClick={handleSavePublication}
                                  >
                                    Save Publication Details
                                  </Button>
                                </Box>
                              )}
                            </Box>
                          </Box>)}                         
                    </Box>                     
                  </Box>
                </form>
              </Box>
            </Grid2>

              {/* Add Publication Modal */}
              <Modal open={openModalPub}>
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
                      fontSize: {
                        xs: "clamp(1rem, 2vw, 1rem)",
                        sm: "clamp(1.5rem, 3.5vw, 1.5rem)",
                        md: "clamp(2rem, 4vw, 2.25rem)",
                      },
                    }}
                  >
                    Add Publication
                  </Typography>
                  <TextField
                    label='Publication Name'
                    value={publicationName}
                    fullWidth
                    onChange={(e) => setPublicationName(e.target.value)}
                    margin='normal'
                    sx={createTextFieldStyles()}
                    InputLabelProps={createInputLabelProps()}
                  />
                  <FormControl fullWidth variant='outlined' margin='normal'>
                    <InputLabel sx={{fontSize: { xs: "0.75rem", md: "0.75rem", lg: "0.8rem" }}}>Format</InputLabel>
                      <Select
                        label='Format'
                        sx={createTextFieldStyles()}
                        value={publicationFormat}
                        onChange={(e) => setPublicationFormat(e.target.value)}
                      >
                        <MenuItem value='journal' sx={{fontSize: { xs: "0.75rem", md: "0.75rem", lg: "0.8rem" }}}>Journal</MenuItem>
                        <MenuItem value='proceeding' sx={{fontSize: { xs: "0.75rem", md: "0.75rem", lg: "0.8rem" }}}>Proceeding</MenuItem>
                      </Select>
                  </FormControl>
                  <TextField
                    fullWidth
                    label='Date'
                    variant='outlined'
                    type='date'
                    margin='normal'
                    value={datePublished}
                    onChange={(e) => setDatePublished(e.target.value)}
                    sx={createTextFieldStyles()}
                    InputLabelProps={{ ...createInputLabelProps(), shrink: true }}
                  />
                  <FormControl fullWidth variant='outlined' margin='normal'>
                    <InputLabel sx={{fontSize: { xs: "0.75rem", md: "0.75rem", lg: "0.8rem" }}}>Indexing Status</InputLabel>
                      <Select
                        label='Indexing Status'
                        sx={createTextFieldStyles()}
                        value={indexingStatus}
                        onChange={(e) => setIndexingStatus(e.target.value)}
                      >
                        <MenuItem value='SCOPUS' sx={{fontSize: { xs: "0.75rem", md: "0.75rem", lg: "0.8rem" }}}>Scopus</MenuItem>
                        <MenuItem value='NON-SCOPUS' sx={{fontSize: { xs: "0.75rem", md: "0.75rem", lg: "0.8rem" }}}>Non-Scopus</MenuItem>
                      </Select>
                  </FormControl>
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      mt: 5,
                    }}
                  >
                    <Button
                      onClick={() => {
                        setPublicationName("");
                        setPublicationFormat("");
                        setDatePublished("");
                        setIndexingStatus("");
                        setOpenModalPub(false);}}
                      sx={{
                        backgroundColor: "#08397C",
                        color: "#FFF",
                        fontFamily: "Montserrat, sans-serif",
                        fontWeight: 600,
                        fontSize: { xs: "0.875rem", md: "1rem" },
                        padding: { xs: "0.5rem 1rem", md: "1.25rem" },
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
                      onClick={handleCloseModal}
                      sx={{
                        backgroundColor: "#CA031B",
                        color: "#FFF",
                        fontFamily: "Montserrat, sans-serif",
                        fontWeight: 600,
                        textTransform: "none",
                        fontSize: { xs: "0.875rem", md: "1rem" },
                        padding: { xs: "0.5rem 1rem", md: "1.25rem" },
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
              
              {/* Select Conference Modal */}
              <Modal open={openModalCon}>
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
                  <TextField
                    fullWidth
                    variant='outlined'
                    placeholder='Search by Title or Venue'
                    value={searchQuery}
                    onChange={handleSearchChange}
                    InputLabelProps={createInputLabelProps()}
                    sx={{ ...createTextFieldStyles(), flex: 2 }}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position='start'>
                          <Search />
                        </InputAdornment>
                      ),
                    }}
                  />
                  <Box
                    sx={{
                      backgroundColor: "#F7F9FC",
                      borderRadius: 1,
                      mt: 2,
                      overflow: "hidden",
                      display: "flex",
                      flexDirection: "column",
                      height: "auto"
                    }}
                  >
                    <Box sx={{ height: "25em", overflow: "hidden" }}>
                      {loading ? (
                        <Typography>Loading...</Typography>
                      ) : (
                        <Virtuoso
                          data={paginatedConferences}
                          itemContent={(index, conference) => (
                            <Box
                              key={conference.conference_id}
                              sx={{
                                p: 2,
                                cursor: "pointer",
                                minHeight: "calc((100% - 48px) / 5)",
                                display: "flex",
                                flexDirection: "column",
                                justifyContent: "center",
                                borderBottom: "1px solid rgba(0, 0, 0, 0.1)",
                                "&:hover": {
                                  backgroundColor: "rgba(0, 0, 0, 0.04)",
                                },
                              }}
                              onClick={() => {
                                // Set values
                                setSelectedTitle(conference.conference_title);
                                setSelectedVenue(conference.conference_venue);
                                setSelectedDate(conference.conference_date);
                                handleConferenceSelection();
                              }}
                            >
                              <Typography
                                variant='h6'
                                sx={{
                                  fontSize: {
                                    xs: "0.75rem",
                                    md: "0.85rem",
                                    lg: "0.95rem",
                                  },
                                  fontWeight: 500,
                                }}
                              >
                                {conference.conference_title}
                              </Typography>
                              <Typography
                                variant='body2'
                                sx={{
                                  color: "#666",
                                  fontSize: {
                                    xs: "0.6rem",
                                    md: "0.7rem",
                                    lg: "0.8rem",
                                  },
                                }}
                              >
                                {conference.conference_date} 
                              </Typography>
                              <Typography
                                variant='caption'
                                sx={{
                                  color: "#0A438F",
                                  fontWeight: 500,
                                  fontSize: {
                                    xs: "0.6rem",
                                    md: "0.7rem",
                                    lg: "0.8rem",
                                  },
                                }}
                              >
                                {conference.conference_venue}
                              </Typography>
                            </Box>
                          )}
                        />
                      )}
                    </Box>
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "center",
                        py: 1,
                        backgroundColor: "#fff",
                        borderTop: "1px solid #eee",
                      }}
                    >
                      <Pagination
                        count={Math.ceil(
                          filteredConferences.length / itemsPerPage
                        )}
                        page={currentPage}
                        onChange={handleChangePage}
                      />
                    </Box>
                  </Box>
                  <Button
                    onClick={handleCloseModal}
                    sx={{
                      backgroundColor: "#08397C",
                      color: "#FFF",
                      fontFamily: "Montserrat, sans-serif",
                      fontWeight: 600,
                      fontSize: { xs: "0.875rem", md: "1rem" },
                      padding: { xs: "0.5rem 1rem", md: "1.25rem" },
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
                </Box>
              </Modal>

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
                      fontSize: {
                        xs: "clamp(1rem, 2vw, 1rem)",
                        sm: "clamp(1.5rem, 3.5vw, 1.5rem)",
                        md: "clamp(2rem, 4vw, 2.25rem)",
                      },
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
                    sx={createTextFieldStyles()}
                    InputLabelProps={createInputLabelProps()}
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
                    sx={createTextFieldStyles()}
                    InputLabelProps={createInputLabelProps()}
                  >
                    <MenuItem value='' disabled sx={{fontSize: { xs: "0.75rem", md: "0.75rem", lg: "0.8rem" }}}>
                      Select your country
                    </MenuItem>
                    {countries.map((country) => (
                      <MenuItem key={country.country} value={country.country} sx={{fontSize: { xs: "0.75rem", md: "0.75rem", lg: "0.8rem" }}}>
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
                    sx={createTextFieldStyles()}
                    InputLabelProps={createInputLabelProps()}
                  >
                    <MenuItem value='' disabled sx={{fontSize: { xs: "0.75rem", md: "0.75rem", lg: "0.8rem" }}}>
                      Select your city
                    </MenuItem>
                    {Cities.map((city) => (
                      <MenuItem key={city} value={city} sx={{fontSize: { xs: "0.75rem", md: "0.75rem", lg: "0.8rem" }}}>
                        {city}
                      </MenuItem>
                    ))}
                  </TextField>
                  <TextField
                    fullWidth
                    label='Conference Date'
                    variant='outlined'
                    type='date'
                    margin='normal'
                    value={dateApproved}
                    onChange={(e) => setDateApproved(e.target.value)}
                    sx={createTextFieldStyles()}
                    InputLabelProps={{ ...createInputLabelProps(), shrink: true }}
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
                        fontSize: { xs: "0.875rem", md: "1rem" },
                        padding: { xs: "0.5rem 1rem", md: "1.25rem" },
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
                        fontSize: { xs: "0.875rem", md: "1rem" },
                        padding: { xs: "0.5rem 1rem", md: "1.25rem" },
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
                    border: "1.5px solid #0A438F",
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
                <Button
                  variant='contained'
                  color='primary'
                  onClick={handlePullOut}
                  disabled={isButtonDisabled}
                  sx={{
                    backgroundColor: "#08397C",
                    color: "#FFF",
                    fontFamily: "Montserrat, sans-serif",
                    fontWeight: 600,
                    textTransform: "none",
                    fontSize: { xs: "0.65rem", md: "0.8rem", lg: "1rem" },
                    marginTop: '1rem',
                    borderRadius: "100px",
                    maxHeight: "3rem",
                    "&:hover": {
                      backgroundColor: "#072d61",
                      color: "#FFF",
                    },
                  }}
                >
                  PULL OUT PAPER
                </Button>
              </Grid2>
            </Grid2>
          </Box>
        </Box>
      </Box>
    </>
  );
};

export default UpdateTrackingInfo;
