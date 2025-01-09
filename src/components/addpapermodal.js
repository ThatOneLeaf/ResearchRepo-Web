import React, { useEffect, useState } from "react";
import {
  Box,
  Button,
  Grid2,
  Modal,
  TextField,
  Typography,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  IconButton,
  Autocomplete,
  Tooltip,
} from "@mui/material";
import axios from "axios";
import { useModalContext } from "../context/modalcontext";
import FileUploader from "./FileUploader";
import sdgGoalsData from "../data/sdgGoals.json";
import { useAuth } from "../context/AuthContext";
import AutorenewIcon from "@mui/icons-material/Autorenew";
import { filterCache, fetchAndCacheFilterData } from "../utils/filterCache";

const AddPaperModal = ({ isOpen, handleClose, onPaperAdded }) => {
  const [colleges, setColleges] = useState([]);
  const [programs, setPrograms] = useState([]);
  const [selectedCollege, setSelectedCollege] = useState("");
  const [selectedProgram, setSelectedProgram] = useState("");
  const [researchType, setResearchType] = useState("FD");
  const [schoolYear, setSchoolYear] = useState("");
  const [term, setTerm] = useState("");
  const [title, setTitle] = useState("");
  const [groupCode, setGroupCode] = useState("");
  const [abstract, setAbstract] = useState("");
  const [adviser, setAdviser] = useState(null);
  const [adviserInputValue, setAdviserInputValue] = useState("");
  const [authorInputValue, setAuthorInputValue] = useState("");
  const [panels, setPanels] = useState([]);
  const [panelInputValue, setPanelInputValue] = useState("");
  const [keywords, setKeywords] = useState([]); // Change to array for multiple keywords
  const [authors, setAuthors] = useState([]); // Change to array for multiple authors
  const [authorOptions, setAuthorOptions] = useState([]);
  const [adviserOptions, setAdviserOptions] = useState([]);
  const [panelOptions, setPanelOptions] = useState([]);
  const { isAddPaperModalOpen, closeAddPaperModal, openAddPaperModal } =
    useModalContext();
  const [file, setFile] = useState(null);
  const [extendedAbstract, setExtendedAbstract] = useState(null);
  const [selectedSDGs, setSelectedSDGs] = useState([]);
  const { user } = useAuth();
  const [researchAreas, setResearchAreas] = useState([]);
  const [selectedResearchAreas, setSelectedResearchAreas] = useState([]);
  const [isModelPredicting, setIsModelPredicting] = useState(false);
  const [researchTypes, setResearchTypes] = useState([]);

  // Create array of school years (last 10 years)
  const currentYear = new Date().getFullYear();
  const schoolYears = Array.from({ length: 10 }, (_, i) => {
    const year = currentYear - i;
    return `${year}-${year + 1}`;
  });

  // Create array of terms with their corresponding values
  const terms = [
    { display: "1st", value: "1" },
    { display: "2nd", value: "2" },
    { display: "3rd", value: "3" },
  ];

  // Fetch research types from the API
  useEffect(() => {
    const fetchResearchTypes = async () => {
      const cached = filterCache.get();
      if (cached.researchTypes) {
        setResearchTypes(cached.researchTypes);
      }
    };

    fetchResearchTypes();
  }, []);

  // Add console logs to debug user data
  useEffect(() => {
    console.log("Current user:", user);
    console.log("Is modal open:", isAddPaperModalOpen);
    console.log("User role:", user?.role);
    console.log("User researcher data:", user?.researcher);
  }, [user, isAddPaperModalOpen]);

  // Fetch colleges when modal opens
  useEffect(() => {
    if (isAddPaperModalOpen) {
      const loadFilterData = async () => {
        try {
          // Try to get from cache first
          const cached = filterCache.get();
          if (cached) {
            setColleges(cached.colleges);
            setPrograms(cached.programs);
            return;
          }

          // If not in cache, fetch and cache
          const data = await fetchAndCacheFilterData();
          setColleges(data.colleges);
          setPrograms(data.programs);
        } catch (error) {
          console.error("Error loading filter data:", error);
        }
      };

      loadFilterData();
    }
  }, [isAddPaperModalOpen]);

  // Update your handleCollegeChange to use cached programs
  const handleCollegeChange = (event) => {
    const selectedCollegeId = event.target.value;
    setSelectedCollege(selectedCollegeId);

    // Filter programs from cache instead of fetching
    const cached = filterCache.get();
    if (cached) {
      const filteredPrograms = cached.programs.filter(
        (program) => program.college_id === selectedCollegeId
      );
      setPrograms(filteredPrograms);
    } else {
      // Fallback to API call if cache is missing
      fetchProgramsByCollege(selectedCollegeId);
    }

    setSelectedProgram(""); // Reset selected program
  };

  // Keep fetchProgramsByCollege as fallback
  const fetchProgramsByCollege = async (collegeId) => {
    if (collegeId) {
      try {
        const response = await axios.get(`/deptprogs/programs/${collegeId}`);
        setPrograms(response.data.programs);
      } catch (error) {
        console.error("Error fetching programs by college:", error);
      }
    } else {
      setPrograms([]);
    }
  };

  const handleAuthorSearch = async (query) => {
    if (query.length > 2) {
      try {
        const response = await axios.get("/accounts/search_user", {
          params: { query },
        });
        setAuthorOptions(response.data.users);
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    }
  };
  const handleAdviserSearch = async (query) => {
    if (query.length > 2) { 
        try {
            const response = await axios.get(`/accounts/search_user/${selectedCollege}`, { 
                params: {
                    query
                },
            });
            setAdviserOptions(response.data.users);
            console.log('advisers: ', response.data.users);
        } catch (error) {
            console.error("Error fetching users:", error);
        }
    } else {
        setAdviserOptions([]);
    }
};


  const handlePanelSearch = async (query) => {
    if (query.length > 2) {
      try {
        const response = await axios.get("/accounts/search_user", {
          params: { query },
        });
        setPanelOptions(response.data.users);
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    } else {
      setPanelOptions([]);
    }
  };

  const onSelectFileHandler = (e) => {
    setFile(e.target.files[0]);
  };

  const onSelectFileHandlerEA = (e) => {
    setExtendedAbstract(e.target.files[0]);
  };

  const onDeleteFileHandler = () => {
    setFile(null);
  };

  const onDeleteFileHandlerEA = () => {
    setExtendedAbstract(null);
  };

  const handleKeywordsChange = (event, newValue) => {
    setKeywords(newValue);
  };

  const handleAddPaper = async () => {
    try {
      // Validate required fields
      const requiredFields = {
        "Group Code": groupCode,
        "School Year": schoolYear,
        Term: term,
        Title: title,
        Abstract: abstract,
        "SDG Goals": selectedSDGs,
        Keywords: keywords,
        Authors: authors,
        "Full Manuscript": file,
        "Research Areas": selectedResearchAreas,
      };

      // Conditionally include Adviser and Panels if researchType is "Integrative"
      if (researchType === "Integrative") {
        requiredFields.Adviser = adviser;
        requiredFields.Panels = panels;
      }

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

      console.log("File:", file);
      console.log("Extended Abstract:", extendedAbstract);

      const formData = new FormData();

      // Get user_id from localStorage
      const userId = localStorage.getItem("user_id");
      formData.append("user_id", userId);

      // Add all required fields to formData
      formData.append("research_id", groupCode);
      formData.append("college_id", selectedCollege);
      formData.append("program_id", selectedProgram);
      formData.append("title", title);
      formData.append("abstract", abstract);
      formData.append("school_year", schoolYear);
      formData.append("term", term);
      formData.append("research_type", researchType);
      formData.append("adviser_id", adviser?.user_id || "");
      formData.append("sdg", selectedSDGs.map((sdg) => sdg.id).join(";"));
      formData.append("file", file);
      formData.append("extended_abstract", extendedAbstract);

      // Add authors without order
      authors.forEach((author) => {
        formData.append("author_ids", author.user_id);
      });

      // Add panel IDs
      panels.forEach((panel) => {
        formData.append("panel_ids", panel.user_id);
      });

      // Add keywords
      formData.append("keywords", keywords.join(";"));

      // Add research areas
      formData.append(
        "research_areas",
        selectedResearchAreas.map((area) => area.research_area_id).join(";")
      );

      // Send the paper data
      const response = await axios.post("/paper/add_paper", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      console.log("Response:", response.data);
      alert("Paper added successfully!");
      if (onPaperAdded) {
        onPaperAdded();
      }
      closeAddPaperModal();
    } catch (error) {
      console.error("Error adding paper:", error);
      if (error.response) {
        console.error("Error response:", error.response.data);
        alert(
          `Failed to add paper: ${
            error.response.data.error || "Please try again."
          }`
        );
      } else {
        alert("Failed to add paper. Please try again.");
      }
    }
  };

  // Reset form state when modal opens
  useEffect(() => {
    if (!isAddPaperModalOpen) {
      setGroupCode("");
      setSelectedCollege("");
      setSelectedProgram("");
      setResearchType("FD");
      setSchoolYear(""); // Reset school year
      setTerm(""); // Reset term
      setTitle("");
      setAbstract("");
      setAdviser(null);
      setAdviserInputValue("");
      setAuthorInputValue("");
      setPanelInputValue("");
      setSelectedSDGs([]);
      setKeywords([]);
      setPanels([]);
      setFile(null);
      setExtendedAbstract(null);
      setAuthors([]);
    }
  }, [isAddPaperModalOpen]);

  // Initialize research type
  useEffect(() => {
    setResearchType("FD");
  }, []); // Run once when component mounts

  // Modify the program admin initialization effect
  useEffect(() => {
    const initializeProgramAdminDetails = async () => {
      if (isAddPaperModalOpen && user?.role === "05" && user?.college) {
        try {
          // Try to get from cache first
          const cached = filterCache.get();
          if (cached) {
            setColleges(cached.colleges);
            setPrograms(
              cached.programs.filter(
                (program) => program.college_id === user.college
              )
            );
          } else {
            // If not in cache, fetch and cache the data
            const data = await fetchAndCacheFilterData();
            setColleges(data.colleges);
            setPrograms(
              data.programs.filter(
                (program) => program.college_id === user.college
              )
            );
          }

          // Set the college/department
          setSelectedCollege(user.college || "");

          // Set the program
          if (user.program) {
            setSelectedProgram(user.program);
          }
        } catch (error) {
          console.error("Error initializing program admin details:", error);
        }
      }
    };

    initializeProgramAdminDetails();
  }, [isAddPaperModalOpen, user]);

  // Style for disabled Select components
  const disabledSelectStyle = {
    backgroundColor: "#f5f5f5",
    "& .MuiSelect-select": {
      color: "#666",
      fontStyle: "italic",
    },
    "& .MuiOutlinedInput-notchedOutline": {
      borderColor: "#ccc",
    },
    "&:hover .MuiOutlinedInput-notchedOutline": {
      borderColor: "#ccc",
    },
    "&.Mui-disabled": {
      backgroundColor: "#f5f5f5",
      cursor: "not-allowed",
    },
  };

  // Utility function to create responsive TextField styles
  const createTextFieldStyles = (customFlex = 2) => ({
    flex: customFlex,
    "& .MuiInputBase-input": {
      fontSize: {
        xs: "0.6em", // Mobile
        sm: "0.7rem", // Small devices
        md: "0.8rem", // Medium devices
        lg: "0.8rem", // Large devices
      },
    },
  });

  // Utility function to create responsive label styles
  const createInputLabelProps = () => ({
    sx: {
      fontSize: {
        xs: "0.45rem", // Mobile
        sm: "0.55rem", // Small devices
        md: "0.65rem", // Medium devices
        lg: "0.75rem", // Large devices
      },
    },
  });

  // Add this function to handle research type changes
  const handleResearchTypeChange = (event) => {
    setResearchType(event.target.value);
  };

  const fetchResearchAreas = async () => {
    try {
      const cached = filterCache.get();
      if (cached.researchAreas) {
        const formattedAreas = cached.researchAreas.map((area) => ({
          research_area_id: area.id,
          research_area_name: area.name,
        }));
        setResearchAreas(formattedAreas);
      }
    } catch (error) {
      console.error("Error fetching research areas:", error);
    }
  };

  const predictResearchAreas = async () => {
    if (!title || !abstract || !keywords.length) {
      alert(
        "Please fill in title, abstract, and keywords before predicting research areas"
      );
      return;
    }

    setIsModelPredicting(true);
    try {
      const response = await axios.post("/paper/predict_research_areas", {
        title,
        abstract,
        keywords: keywords.join(", "),
      });

      if (response.data.predicted_areas) {
        // Find matching research areas from the full list
        const predictedAreas = response.data.predicted_areas
          .map((prediction) => {
            const matchingArea = researchAreas.find(
              (area) => area.research_area_name === prediction.name
            );
            return matchingArea;
          })
          .filter((area) => area !== undefined); // Remove any unmatched areas

        console.log("Predicted areas:", predictedAreas); // Debug log
        setSelectedResearchAreas(predictedAreas);
      }
    } catch (error) {
      console.error("Error predicting research areas:", error);
      alert(
        "Failed to predict research areas. Please try again or select manually."
      );
    } finally {
      setIsModelPredicting(false);
    }
  };

  // Add this useEffect to fetch research areas when component mounts
  useEffect(() => {
    fetchResearchAreas();
  }, []);

  // Add this CSS for the spinner animation
  const spinnerStyles = {
    "@keyframes spin": {
      "0%": { transform: "rotate(0deg)" },
      "100%": { transform: "rotate(360deg)" },
    },
  };

  return (
    <Modal
      open={isAddPaperModalOpen}
      onClose={closeAddPaperModal}
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        overflow: "auto",
      }}
    >
      <Box
        sx={{
          bgcolor: "background.paper",
          boxShadow: 24,
          p: 5,
          borderRadius: 2,
          width: "auto",
          margin: "2rem",
          maxHeight: "90vh",
          overflowY: "auto",
          position: "relative",
          "&:focus": {
            outline: "none",
          },
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
          Add New Paper
        </Typography>
        <Grid2 container spacing={2}>
          <Grid2 size={2}>
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Research Type</InputLabel>
              <Select
                value={researchType}
                onChange={(event) => {
                  const newResearchType = event.target.value;
                  handleResearchTypeChange(event);
                  if (newResearchType !== "FD") {
                    setAdviser(""); // Clear adviser selection
                    setAdviserInputValue(""); // Clear adviser input field
                    setPanels([]); // Clear panels selection
                    setPanelInputValue(""); // Clear panel input field
                  }
                }}
                label='Research Type'
                defaultValue='FD'
              >
                {researchTypes.map((type) => (
                  <MenuItem key={type.id} value={type.id}>
                    {type.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid2>
          <Grid2 size={2}>
            <TextField
              fullWidth
              label='Group Code'
              variant='outlined'
              value={groupCode}
              onChange={(e) => setGroupCode(e.target.value)}
              inputProps={{ maxLength: 15 }} // Limits input to 15 characters
              sx={createTextFieldStyles()}
              InputLabelProps={createInputLabelProps()}
            />
          </Grid2>
          <Grid2 size={3}>
            <FormControl fullWidth variant='outlined'>
              <InputLabel
                sx={{
                  color: user?.role === "05" ? "#666" : "inherit",
                  "&.Mui-disabled": { color: "#666" },
                }}
              >
                Department
              </InputLabel>
              <Select
                value={selectedCollege || ""}
                onChange={handleCollegeChange}
                label='Department'
                disabled={user?.role === "05"}
                sx={{
                  ...disabledSelectStyle,
                  fontSize: { xs: "0.75rem", md: "0.75rem", lg: "0.8rem" },
                }}
              >
                {colleges.map((college) => (
                  <MenuItem
                    key={college.college_id}
                    value={college.college_id}
                    sx={{
                      fontSize: { xs: "0.75rem", md: "0.75rem", lg: "0.8rem" },
                    }}
                  >
                    {college.college_name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid2>
          <Grid2 size={3}>
            <FormControl fullWidth variant='outlined'>
              <InputLabel
                sx={{
                  color: user?.role === "05" ? "#666" : "inherit",
                  "&.Mui-disabled": { color: "#666" },
                }}
              >
                Program
              </InputLabel>
              <Select
                value={selectedProgram || ""}
                onChange={(e) => setSelectedProgram(e.target.value)}
                label='Program'
                disabled={user?.role === "05"}
                sx={{
                  ...disabledSelectStyle,
                  fontSize: { xs: "0.75rem", md: "0.75rem", lg: "0.8rem" },
                }}
              >
                {programs.map((program) => (
                  <MenuItem
                    key={program.program_id}
                    value={program.program_id}
                    sx={{
                      fontSize: { xs: "0.75rem", md: "0.75rem", lg: "0.8rem" },
                    }}
                  >
                    {program.program_name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid2>
          <Grid2 size={1}>
            <FormControl fullWidth variant='outlined'>
              <InputLabel>School Year</InputLabel>
              <Select
                value={schoolYear}
                onChange={(e) => setSchoolYear(e.target.value)}
                label='School Year'
                sx={createTextFieldStyles()}
              >
                {schoolYears.map((year) => (
                  <MenuItem key={year} value={year.split("-")[0]}>
                    {" "}
                    {/* Only store first year */}
                    {year}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid2>
          <Grid2 size={1}>
            <FormControl fullWidth variant='outlined'>
              <InputLabel>Term</InputLabel>
              <Select
                value={term}
                onChange={(e) => setTerm(e.target.value)}
                label='Term'
                sx={createTextFieldStyles()}
              >
                {terms.map((termOption) => (
                  <MenuItem key={termOption.value} value={termOption.value}>
                    {termOption.display}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid2>
          <Grid2 size={4}>
            <Autocomplete
              multiple
              options={authorOptions}
              getOptionLabel={(option) =>
                `${option.first_name || ""} ${option.last_name || ""} (${
                  option.email || ""
                })`
              }
              componentsProps={{
                popper: {
                  sx: {
                    "& .MuiAutocomplete-listbox": {
                      fontSize: { xs: "0.75rem", md: "0.75rem", lg: "0.8rem" },
                    },
                  },
                },
              }}
              value={authors}
              onChange={(event, newValue) => setAuthors(newValue)}
              inputValue={authorInputValue}
              onInputChange={(event, newInputValue) => {
                setAuthorInputValue(newInputValue);
                handleAuthorSearch(newInputValue);
              }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label='Authors'
                  variant='outlined'
                  helperText='Type at least 3 characters to search and select author/s'
                  sx={createTextFieldStyles()}
                  InputLabelProps={createInputLabelProps()}
                />
              )}
            />
          </Grid2>
          <Grid2 size={3}>
            <Autocomplete
              freeSolo
              options={adviserOptions}
              getOptionLabel={(option) =>
                `${option.first_name || ""} ${option.last_name || ""} (${
                  option.email || ""
                })`
              }
              componentsProps={{
                popper: {
                  sx: {
                    "& .MuiAutocomplete-listbox": {
                      fontSize: { xs: "0.75rem", md: "0.75rem", lg: "0.8rem" },
                    },
                  },
                },
              }}
              value={adviser}
              onChange={(event, newValue) => setAdviser(newValue)}
              inputValue={adviserInputValue}
              onInputChange={(event, newInputValue) => {
                if (researchType === "FD") {
                  setAdviserInputValue(newInputValue); // Update input normally
                  handleAdviserSearch(newInputValue); // Perform search
                } else {
                  setAdviserInputValue(""); // Ensure input is cleared for specific research types
                }
              }}
              disabled={researchType !== "FD"}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label='Adviser'
                  variant='outlined'
                  helperText={
                    researchType !== "FD"
                      ? null
                      : "Type at least 3 characters to search for an adviser"
                  }
                  sx={researchType !== "FD" ? disabledSelectStyle : null}
                  InputLabelProps={createInputLabelProps()}
                />
              )}
            />
          </Grid2>
          <Grid2 size={5}>
            <Autocomplete
              multiple
              options={panelOptions}
              getOptionLabel={(option) =>
                `${option.first_name || ""} ${option.last_name || ""} (${
                  option.email || ""
                })`
              }
              componentsProps={{
                popper: {
                  sx: {
                    "& .MuiAutocomplete-listbox": {
                      fontSize: { xs: "0.75rem", md: "0.75rem", lg: "0.8rem" },
                    },
                  },
                },
              }}
              value={panels}
              onChange={(event, newValue) => setPanels(newValue)}
              inputValue={panelInputValue}
              onInputChange={(event, newInputValue) => {
                if (researchType === "FD") {
                  setPanelInputValue(newInputValue); // Update input field
                  handlePanelSearch(newInputValue); // Perform panel search
                } else {
                  setPanelInputValue(""); // Clear input field
                }
              }}
              disabled={researchType !== "FD"}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label='Panels'
                  variant='outlined'
                  helperText={
                    researchType !== "FD"
                      ? null
                      : "Type at least 3 characters to search and select multiple panel members"
                  }
                  sx={researchType !== "FD" ? disabledSelectStyle : null}
                  InputLabelProps={createInputLabelProps()}
                />
              )}
            />
          </Grid2>
          <Grid2 size={12}>
            <TextField
              fullWidth
              label='Title'
              variant='outlined'
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              sx={createTextFieldStyles()}
              InputLabelProps={createInputLabelProps()}
            />
          </Grid2>
          <Grid2 size={6}>
            <Autocomplete
              multiple
              disableCloseOnSelect
              options={sdgGoalsData.sdgGoals}
              getOptionLabel={(option) => `${option.id} - ${option.title}`}
              value={selectedSDGs}
              onChange={(event, newValue) => setSelectedSDGs(newValue)}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label='SDG Goals'
                  variant='outlined'
                  helperText='Select one or more SDG goals'
                  sx={createTextFieldStyles()}
                  InputLabelProps={createInputLabelProps()}
                />
              )}
              renderOption={(props, option) => (
                <li {...props}>
                  <Typography variant='body2'>
                    <strong>{option.id}</strong> - {option.title}
                  </Typography>
                </li>
              )}
            />
          </Grid2>
          <Grid2 size={6}>
            <Autocomplete
              multiple
              freeSolo
              options={[]} // Empty array since keywords are free-form
              value={keywords}
              onChange={handleKeywordsChange}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label='Keywords'
                  variant='outlined'
                  helperText='Type and press Enter to add multiple keywords'
                  sx={createTextFieldStyles()}
                  InputLabelProps={createInputLabelProps()}
                />
              )}
            />
          </Grid2>
          <Grid2 size={6}>
            <TextField
              fullWidth
              label='Abstract'
              multiline
              rows={3}
              variant='outlined'
              value={abstract}
              onChange={(e) => setAbstract(e.target.value)}
              sx={createTextFieldStyles()}
              InputLabelProps={createInputLabelProps()}
            />
          </Grid2>
          <Grid2 size={6}>
            <FormControl fullWidth sx={{ mb: 2 }}>
              <Autocomplete
                multiple
                disableCloseOnSelect
                id='research-areas'
                options={researchAreas}
                getOptionLabel={(option) => option.research_area_name}
                value={selectedResearchAreas}
                onChange={(event, newValue) =>
                  setSelectedResearchAreas(newValue)
                }
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label='Research Areas'
                    variant='outlined'
                    helperText='Select research areas'
                    sx={createTextFieldStyles()}
                    InputLabelProps={createInputLabelProps()}
                  />
                )}
              />
            </FormControl>
          </Grid2>
          <Grid2 size={6}>
            <Typography variant='body2' sx={{ mb: 1 }}>
              Upload Full Manuscript
            </Typography>
            <FileUploader
              label='Upload Full Manuscript'
              onSelectFile={onSelectFileHandler}
              onDeleteFile={onDeleteFileHandler}
              file={file}
            />
          </Grid2>
          <Grid2 size={6}>
            <Typography variant='body2' sx={{ mb: 1 }}>
              Upload Extended Abstract
            </Typography>
            <FileUploader
              label='Upload Extended Abstract'
              onSelectFile={onSelectFileHandlerEA}
              onDeleteFile={onDeleteFileHandlerEA}
              file={extendedAbstract}
            />
          </Grid2>
        </Grid2>
        <Box
          sx={{
            display: "flex",
            alignItems: "flex-start",
            mt: 3,
            gap: 2,
          }}
        >
          <Button
            onClick={closeAddPaperModal}
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
            Back
          </Button>
          <Button
            onClick={handleAddPaper}
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
            Add Paper
          </Button>
        </Box>
      </Box>
    </Modal>
  );
};

export default AddPaperModal;
