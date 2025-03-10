import React, { useEffect, useState } from "react";
import {
  Box,
  Button,
  TextField,
  Typography,
  Grid2,
  Select,
  FormControl,
  InputLabel,
  Modal,
  MenuItem,
  Autocomplete,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import { useLocation } from "react-router-dom";
import api from "../services/api";
import AutoCompleteTextBox from "../components/Intellibox";
import InfoIcon from "@mui/icons-material/Info";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import Tooltip from "@mui/material/Tooltip";
import { useModalContext } from "../context/modalcontext";
import { toast } from "react-hot-toast";
import {
  fetchAndCacheFilterData,
  getCitiesForCountry,
  searchCountries,
  searchCities,
} from "../utils/trackCache";

const AddSubmission = () => {
  const location = useLocation();
  const { id } = location.state || {}; // Default to an empty object if state is undefined

  const [publicationTitle, setPublicationTitle] = useState("");
  const [dateSubmitted, setDateSubmitted] = useState("");
  const [publicationFormat, setPublicationFormat] = useState("");

  const [conferenceTitle, setConferenceTitle] = useState("");
  const [singleCountry, setSingleCountry] = useState("");
  const [singleCity, setSingleCity] = useState("");
  const [countries, setCountries] = useState([]);
  const [countriesAPI, setCountriesAPI] = useState([]);
  const [citiesAPI, setCitiesAPI] = useState([]);
  const [pub_names, setPubNames] = useState([]);
  const [conf_title, setConfTitle] = useState([]);
  const [publicationFormats, setPublicationFormats] = useState([]);
  const [Cities, setCities] = useState([]);
  const [datePresentation, setDatePresentation] = useState("");
  const [conferenceVenues, setConferenceVenues] = useState([]);

  const [countrySearchText, setCountrySearchText] = useState("");
  const [citySearchText, setCitySearchText] = useState("");

  const { isAddSubmitModalOpen, closeAddSubmitModal, openAddSubmitModal } =
    useModalContext();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);
  const [isSuccessDialogOpen, setIsSuccessDialogOpen] = useState(false);

  const loadInitialData = async () => {
    try {
      const cachedData = await fetchAndCacheFilterData();
      if (cachedData) {
        setCountriesAPI(cachedData.countries);
        setConferenceVenues(cachedData.venues);
        setPubNames(cachedData.publicationNames);
        setConfTitle(cachedData.conferenceTitles);
        setPublicationFormats(cachedData.publicationFormats);
      }
    } catch (error) {
      console.error("Error loading initial data:", error);
      toast.error("Failed to load form data");
    }
  };

  // Use effect to load initial data
  useEffect(() => {
    loadInitialData();
  }, []);

  ///////////////////// COUNTRY AND CITY API RETRIEVAL //////////////////////
  useEffect(() => {
    if (countriesAPI.length > 0 && conferenceVenues.length > 0) {
      // Get unique countries from conference venues
      const venueCountries = new Set(
        conferenceVenues.map((venue) => venue.country)
      );

      const filteredCountries = countriesAPI.filter((country) =>
        venueCountries.has(country.country)
      );

      console.log("Filtered countries:", filteredCountries);
      setCountries(filteredCountries);
    }
  }, [countriesAPI, conferenceVenues]);

  const fetchCities = (country, shouldClearCity = true) => {
    // Get cities from countries API for the selected country
    const selectedCountry = countries.find((c) => c.country === country);
    if (selectedCountry) {
      setCitiesAPI(selectedCountry.cities);

      // Get cities from conference venues for the selected country
      const venueCities = conferenceVenues
        .filter((venue) => venue.country === country)
        .map((venue) => venue.city);

      // Filter API cities to only include those that are in our venues
      const filteredCities = selectedCountry.cities.filter((city) =>
        venueCities.includes(city)
      );

      console.log("Available cities for", country, ":", filteredCities);
      setCities(filteredCities);
    }
  };

  // Modified country selection handling
  const handleCountryChange = (event, newValue) => {
    setSingleCity("");
    setSingleCountry(newValue);
    if (newValue) {
      fetchCities(newValue);
      console.log(newValue);
    }
  };

  ///////////////////// STATUS UPDATE PUBLICATION //////////////////////
  const handleBack = () => {
    if (isSubmitting) {
      return;
    }
    let hasChanges;
    hasChanges = publicationFormat || dateSubmitted;

    if (publicationFormat === "PC") {
      hasChanges =
        hasChanges ||
        conferenceTitle ||
        singleCountry ||
        singleCity ||
        datePresentation;
    } else {
      hasChanges = hasChanges || publicationTitle;
    }

    if (hasChanges) {
      setIsConfirmDialogOpen(true);
    } else {
      handleFormCleanup();
      closeAddSubmitModal();
    }
  };

  const checkFields = () => {
    // Validate required fields
    // Determine required fields based on publicationFormat
    let requiredFields = {
      "Publication Type": publicationFormat,
      "Date of Submission": dateSubmitted,
    };

    if (publicationFormat === "PC") {
      requiredFields = {
        ...requiredFields,
        "Conference Title": conferenceTitle,
        Country: singleCountry,
        City: singleCity,
        "Date of Presentation": datePresentation,
      };
    } else {
      requiredFields = {
        ...requiredFields,
        "Publication Title": publicationTitle,
      };
    }
    const missingFields = Object.entries(requiredFields)
      .filter(([_, value]) => {
        if (Array.isArray(value)) {
          return value.length === 0;
        }
        return !value;
      })
      .map(([key]) => key);

    const approvedDate = new Date(dateSubmitted);
    const today = new Date();

    // Normalize both dates to midnight
    approvedDate.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);

    if (missingFields.length > 0) {
      return true;
    }

    return false;
  };

  const handleSavePublication = async () => {
    try {
      const missingFields = checkFields();

      if (missingFields) {
        alert(
          `Please fill in all required fields: ${missingFields.join(", ")}`
        );
        return;
      }

      setIsSubmitting(true);

      const formData = new FormData();

      // Get user_id from localStorage
      const userId = localStorage.getItem("user_id");
      formData.append("user_id", userId);

      // Add all required fields to formData
      formData.append("publication_name", publicationTitle);
      formData.append("pub_format_id", publicationFormat);
      formData.append("date_submitted", dateSubmitted);
      formData.append("conference_title", conferenceTitle);
      formData.append("city", singleCity);
      formData.append("country", singleCountry);
      formData.append("conference_date", datePresentation);

      // Send the conference data
      const response = await api.post(`/track/form/submitted/${id}`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      setIsSuccessDialogOpen(true);
    } catch (error) {
      toast.error(
        error.response?.data?.error || "Error submitting publication"
      );
      console.error("Error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  ///////////////////// PRE-POST MODAL HANDLING //////////////////////
  const handleFormCleanup = () => {
    setPublicationTitle("");
    setPublicationFormat("");
    setDateSubmitted("");

    setConferenceTitle("");
    setSingleCountry("");
    setSingleCity("");
    setDatePresentation("");
  };

  // Utility function to create responsive TextField styles
  const createTextFieldStyles = (customFlex = 2) => ({
    flex: customFlex,
    "& .MuiInputBase-input": {
      fontSize: {
        xs: "0.6em", // Mobile
        sm: "0.7rem", // Small devices
        md: "0.8rem", // Medium devices
        lg: "0.9rem", // Large devices
      },
    },
  });

  // Utility function to create responsive label styles
  const createInputLabelProps = () => ({
    sx: {
      fontSize: {
        xs: "0.55rem", // Mobile
        sm: "0.65rem", // Small devices
        md: "0.75rem", // Medium devices
        lg: "0.85rem", // Large devices
      },
    },
  });

  // Handle change event
  const handleChange = (e) => {
    setPublicationFormat(e.target.value); // Update state with selected value
    console.log("Selected Publication Format ID:", e.target.value); // Log the selected value
  };

  return (
    <>
      {/* Add Publication Modal */}
      <Modal
        open={isAddSubmitModalOpen}
        onClose={isSubmitting ? undefined : handleBack}
      >
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
            mb={3}
            sx={{
              textAlign: { xs: "left", md: "bottom" },
              fontSize: {
                xs: "clamp(1rem, 2vw, 1rem)",
                sm: "clamp(1.5rem, 3.5vw, 1.5rem)",
                md: "clamp(2rem, 4vw, 2.25rem)",
              },
            }}
          >
            Submit Publication
          </Typography>
          <FormControl fullWidth variant='outlined' margin='dense'>
            <InputLabel
              sx={{
                fontSize: {
                  xs: "0.75rem",
                  md: "0.75rem",
                  lg: "0.8rem",
                },
              }}
            >
              Publication Type
            </InputLabel>
            <Select
              label='Publication Type'
              sx={createTextFieldStyles()} // Assuming this is a custom style function
              value={publicationFormat || ""}
              onChange={handleChange} // Call handleChange when user selects an option
            >
              <MenuItem
                value=''
                disabled
                sx={{
                  fontSize: {
                    xs: "0.75rem",
                    md: "0.75rem",
                    lg: "0.8rem",
                  },
                }}
              >
                Select type
              </MenuItem>
              {publicationFormats.map((format) => (
                <MenuItem
                  key={format.pub_format_id}
                  value={format.pub_format_id}
                  sx={{
                    fontSize: {
                      xs: "0.75rem",
                      md: "0.75rem",
                      lg: "0.8rem",
                    },
                  }}
                >
                  {format.pub_format_name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          {publicationFormat === "JL" && (
            <Box>
              <AutoCompleteTextBox
                fullWidth
                data={pub_names}
                value={publicationTitle}
                label='Publication Title'
                id='publication-name'
                onItemSelected={(value) => setPublicationTitle(value)} // Update state when a suggestion is selected
                sx={{
                  ...createTextFieldStyles(),
                  "& .MuiInputLabel-root": {
                    fontSize: {
                      xs: "0.75rem",
                      md: "0.75rem",
                      lg: "0.8rem",
                    },
                  },
                }}
                InputLabelProps={createInputLabelProps()}
                placeholder='ex: PLOS One'
              />
            </Box>
          )}

          {publicationFormat === "PC" && (
            <Box>
              <AutoCompleteTextBox
                fullWidth
                data={conf_title}
                label='Conference Title'
                value={conferenceTitle}
                id='conf-name'
                onItemSelected={(value) => setConferenceTitle(value)}
                sx={{
                  ...createTextFieldStyles(),
                  "& .MuiInputLabel-root": {
                    fontSize: {
                      xs: "0.75rem",
                      md: "0.75rem",
                      lg: "0.8rem",
                    },
                  },
                }}
                InputLabelProps={createInputLabelProps()}
                placeholder='ex: Proceedings of the International Conference on Artificial Intelligence'
              />
              <TextField
                fullWidth
                label='Date of Presentation'
                variant='outlined'
                type='date'
                margin='dense'
                value={datePresentation}
                onChange={(e) => setDatePresentation(e.target.value)}
                inputProps={{
                  min: new Date(new Date().setDate(new Date().getDate() + 1))
                    .toISOString()
                    .split("T")[0], // Sets tomorrow as the minimum date
                }}
                sx={createTextFieldStyles()}
                InputLabelProps={{
                  ...createInputLabelProps(),
                  shrink: true,
                }}
              />
              <Grid2 container spacing={4}>
                <Grid2 size={6}>
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 1,
                    }}
                  >
                    <Autocomplete
                      fullWidth
                      options={
                        countrySearchText
                          ? countriesAPI.map((c) => c.country)
                          : countries
                              .filter((c) =>
                                conferenceVenues.some(
                                  (v) => v.country === c.country
                                )
                              )
                              .map((c) => c.country)
                      }
                      value={singleCountry}
                      onChange={handleCountryChange}
                      onInputChange={(event, newInputValue) => {
                        setCountrySearchText(newInputValue);
                      }}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          label='Country'
                          margin='dense'
                          sx={createTextFieldStyles()}
                          InputLabelProps={createInputLabelProps()}
                        />
                      )}
                    />
                    <Tooltip
                      title="Can't find your country? Type to search from all available countries"
                      placement='right'
                    >
                      <InfoIcon
                        sx={{
                          color: "#08397C",
                          fontSize: "1.2rem",
                          cursor: "help",
                        }}
                      />
                    </Tooltip>
                  </Box>
                </Grid2>
                <Grid2 size={6}>
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 1,
                    }}
                  >
                    <Autocomplete
                      fullWidth
                      options={
                        citySearchText
                          ? countries.find((c) => c.country === singleCountry)
                              ?.cities || []
                          : Cities
                      }
                      value={singleCity}
                      onChange={(event, newValue) => {
                        setSingleCity(newValue);
                      }}
                      onInputChange={(event, newInputValue) => {
                        setCitySearchText(newInputValue);
                      }}
                      disabled={!singleCountry}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          label='City'
                          margin='dense'
                          sx={createTextFieldStyles()}
                          InputLabelProps={createInputLabelProps()}
                        />
                      )}
                    />
                    <Tooltip
                      title="Can't find your city? Type to search from all available cities"
                      placement='right'
                    >
                      <InfoIcon
                        sx={{
                          color: "#08397C",
                          fontSize: "1.2rem",
                          cursor: "help",
                        }}
                      />
                    </Tooltip>
                  </Box>
                </Grid2>
              </Grid2>
            </Box>
          )}
          <TextField
            fullWidth
            label='Date of Submission'
            variant='outlined'
            type='date'
            margin='dense'
            value={dateSubmitted}
            onChange={(e) => setDateSubmitted(e.target.value)}
            inputProps={{
              max: new Date().toISOString().split("T")[0], // This sets today as the maximum date
            }}
            sx={createTextFieldStyles()}
            InputLabelProps={{
              ...createInputLabelProps(),
              shrink: true,
            }}
          />
          <Box
            sx={{
              display: "flex",
              mt: 3,
              gap: 2,
            }}
          >
            <Button
              onClick={handleBack}
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
              onClick={handleSavePublication}
              disabled={checkFields() || isSubmitting}
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
              {isSubmitting ? (
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <CircularProgress size={20} color='#08397C' />
                  Submitting Publication...
                </Box>
              ) : (
                "Submit"
              )}
            </Button>
          </Box>
          {/* Add loading overlay */}
          {isSubmitting && (
            <Box
              sx={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: "rgba(255, 255, 255, 0.7)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                zIndex: 9999,
              }}
            >
              <Box sx={{ textAlign: "center" }}>
                <CircularProgress />
                <Typography sx={{ mt: 2, fontSize: "1.25rem" }}>
                  Submitting Publication...
                </Typography>
              </Box>
            </Box>
          )}

          {/* Save Progress */}
          <Dialog
            open={isConfirmDialogOpen}
            onClose={() => setIsConfirmDialogOpen(false)}
            PaperProps={{
              sx: {
                borderRadius: "15px",
                padding: "1rem",
              },
            }}
          >
            <DialogTitle
              sx={{
                fontFamily: "Montserrat, sans-serif",
                fontWeight: 600,
                color: "#08397C",
              }}
            >
              Unsaved Progress
            </DialogTitle>
            <DialogContent>
              <Typography
                sx={{
                  fontFamily: "Montserrat, sans-serif",
                  color: "#666",
                }}
              >
                You have unsaved progress. Do you want to save your progress?
              </Typography>
            </DialogContent>
            <DialogActions sx={{ padding: "1rem" }}>
              <Button
                onClick={() => {
                  setIsConfirmDialogOpen(false);
                  handleFormCleanup(); // Set flag to clear fields
                  closeAddSubmitModal();
                }}
                sx={{
                  backgroundColor: "#CA031B",
                  color: "#FFF",
                  fontFamily: "Montserrat, sans-serif",
                  fontWeight: 600,
                  textTransform: "none",
                  borderRadius: "100px",
                  padding: "0.75rem",
                  "&:hover": {
                    backgroundColor: "#A30417",
                  },
                }}
              >
                Discard
              </Button>
              <Button
                onClick={() => {
                  setIsConfirmDialogOpen(false);
                  closeAddSubmitModal();
                }}
                sx={{
                  backgroundColor: "#08397C",
                  color: "#FFF",
                  fontFamily: "Montserrat, sans-serif",
                  fontWeight: 600,
                  textTransform: "none",
                  borderRadius: "100px",
                  padding: "0.75rem",
                  "&:hover": {
                    backgroundColor: "#072d61",
                  },
                }}
              >
                Save Progress
              </Button>
            </DialogActions>
          </Dialog>

          {/* Add Success Dialog */}
          <Dialog
            open={isSuccessDialogOpen}
            onClose={() => {
              setIsSuccessDialogOpen(false);
              handleFormCleanup();
            }}
            PaperProps={{
              sx: {
                borderRadius: "15px",
                padding: "1rem",
              },
            }}
          >
            <DialogTitle
              sx={{
                fontFamily: "Montserrat, sans-serif",
                fontWeight: 600,
                color: "#008000",
                display: "flex",
                alignItems: "center",
                gap: 1,
              }}
            >
              <Box
                component='span'
                sx={{
                  backgroundColor: "#E8F5E9",
                  borderRadius: "75%",
                  padding: "10px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <CheckCircleIcon />
              </Box>
              Success
            </DialogTitle>
            <DialogContent>
              <Typography
                sx={{
                  fontFamily: "Montserrat, sans-serif",
                  color: "#666",
                  mt: 1,
                }}
              >
                Publication has been submitted successfully.
              </Typography>
            </DialogContent>
            <DialogActions sx={{ padding: "1rem" }}>
              <Button
                onClick={() => {
                  setIsSuccessDialogOpen(false);
                  handleFormCleanup();
                  window.location.reload();
                }}
                sx={{
                  backgroundColor: "#08397C",
                  color: "#FFF",
                  fontFamily: "Montserrat, sans-serif",
                  fontWeight: 600,
                  textTransform: "none",
                  borderRadius: "100px",
                  padding: "0.75rem",
                  "&:hover": {
                    backgroundColor: "#072d61",
                  },
                }}
              >
                Close
              </Button>
            </DialogActions>
          </Dialog>
        </Box>
      </Modal>
    </>
  );
};

export default AddSubmission;
