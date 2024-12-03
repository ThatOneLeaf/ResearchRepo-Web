import React, { useEffect, useState } from "react";
import Navbar from "./navbar";
import Footer from "./footer";
import {
  Box,
  Button,
  FormControl,
  IconButton,
  InputAdornment,
  InputLabel,
  MenuItem,
  Modal,
  Select,
  TextField,
  Typography,
  FormControlLabel,
  Radio,
  RadioGroup,
  FormLabel,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TableContainer,
  Tooltip,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import homeBg from "../assets/home_bg.png";
import ArrowBackIosIcon from "@mui/icons-material/ArrowBackIos";
import { Search } from "@mui/icons-material";
import { Virtuoso } from "react-virtuoso";
import axios from "axios";
import FileUploadIcon from "@mui/icons-material/FileUpload";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import ErrorIcon from "@mui/icons-material/Error";
import EditIcon from "@mui/icons-material/Edit";

const ManageUsers = () => {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const [openModal, setOpenModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [newRole, setNewRole] = useState("");
  const [roles, setRoles] = useState([]);
  const [accountStatus, setAccountStatus] = useState("");
  const [initialData, setInitialData] = useState(null);
  const [openAddModal, setOpenAddModal] = useState(false);
  const [selectedUserType, setSelectedUserType] = useState("");
  const [newUsers, setNewUsers] = useState([]);
  const [colleges, setColleges] = useState([]);
  const [programs, setPrograms] = useState([]);
  const [parsedUsers, setParsedUsers] = useState([]);
  const [programsByCollege, setProgramsByCollege] = useState({});
  const [selectedRole, setSelectedRole] = useState("");
  const [selectedCollege, setSelectedCollege] = useState("");
  const [selectedProgram, setSelectedProgram] = useState("");
  const [hasFile, setHasFile] = useState(false);
  const [manualEntry, setManualEntry] = useState({
    email: "",
    firstName: "",
    middleInitial: "",
    surname: "",
    suffix: "",
  });
  const [duplicateEmails, setDuplicateEmails] = useState([]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await axios.get("/accounts/users");
      setUsers(response.data.researchers);
      setFilteredUsers(response.data.researchers);
    } catch (error) {
      console.error("Error fetching users:", error);
      alert("Error fetching users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchRoles = async () => {
      try {
        const response = await axios.get(`/accounts/fetch_roles`);
        setRoles(response.data.roles);
      } catch (error) {
        console.error("Error fetching roles:", error);
      }
    };

    const fetchColleges = async () => {
      try {
        const response = await axios.get("/deptprogs/college_depts");
        setColleges(response.data.colleges);
      } catch (error) {
        console.error("Error fetching colleges:", error);
      }
    };

    Promise.all([fetchRoles(), fetchUsers(), fetchColleges()]);
  }, []);

  const handleSearchChange = (e) => {
    const query = e.target.value.toLowerCase();
    setSearchQuery(query);
    setFilteredUsers(
      users.filter(
        (user) =>
          user.email.toLowerCase().includes(query) ||
          user.researcher_id.toLowerCase().includes(query)
      )
    );
  };
  const handleOpenModal = (user) => {
    setSelectedUser(user);

    // Set the initial data for comparison in handleSaveChanges
    setInitialData({
      role_name: user.role_name,
      accountStatus: user.acc_status,
    });

    // Find and set the role_id for the selected user
    const matchingRole = roles.find(
      (role_id) => role_id.role_name === user.role_name
    );
    if (matchingRole) {
      setNewRole(matchingRole.role_id); // Set the newRole state with the role_id
    } else {
      setNewRole(""); // Fallback in case no matching role is found
    }

    console.log("Selected User:", user);
    console.log("Matching Role (if found):", matchingRole);

    setAccountStatus(user.acc_status); // Set account status for the selected user
    setOpenModal(true);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
    setSelectedUser(null);
  };

  // Function to get role by role_id
  const getRoleById = (roleId) => {
    return roles.find((role) => role.role_id === roleId);
  };

  const handleSaveChanges = async () => {
    const newRoleName = getRoleById(newRole);
    console.log("newRoleName:", newRoleName.role_name);

    const hasChanges =
      newRoleName.role_name !== initialData?.role_name ||
      accountStatus !== initialData?.accountStatus;

    if (!hasChanges) {
      alert("No changes detected. Please modify user's details before saving.");
    } else {
      updateChanges();
    }
  };

  const updateChanges = async () => {
    try {
      await axios.put(`/accounts/update_acc/${selectedUser.researcher_id}`, {
        role_id: newRole, // Corrected key to 'role_id'
        acc_status: accountStatus,
      });

      const selectedRole = roles.find((role) => role.role_id === newRole);
      const roleName = selectedRole ? selectedRole.role_name : "N/A"; // Default to "N/A" if not found
      console.log("Selected Role Name: ", roleName);

      // Update users state to reflect changes without re-fetching
      const updatedUsers = users.map((user) =>
        user.researcher_id === selectedUser.researcher_id
          ? { ...user, role_name: roleName, acc_status: accountStatus }
          : user
      );

      // Update the state to trigger a re-render
      setUsers(updatedUsers);
      setFilteredUsers(updatedUsers);

      console.log("New Role ID: ", newRole); // Optional for debugging
    } catch (error) {
      console.error("Error saving changes:", error);
    } finally {
      setOpenModal(false);
    }
  };

  const handleOpenAddModal = () => {
    setOpenAddModal(true);
  };

  const handleCloseAddModal = () => {
    setOpenAddModal(false);
    setSelectedRole("");
    setSelectedCollege("");
    setSelectedProgram("");
    setParsedUsers([]);
    setHasFile(false);
    setDuplicateEmails([]);
    setManualEntry({
      email: "",
      firstName: "",
      middleInitial: "",
      surname: "",
      suffix: "",
    });

    // Reset file input
    const fileInput = document.querySelector('input[type="file"]');
    if (fileInput) {
      fileInput.value = "";
    }
  };

  const checkDuplicateEmail = async (email) => {
    try {
      // Check for duplicates in current table
      const tableCount = parsedUsers.filter(
        (user) => user.email === email
      ).length;
      if (tableCount > 1) return true;

      // Check database for existing email
      const response = await axios.get(`/accounts/check_email?email=${email}`);
      return response.data.exists;
    } catch (error) {
      console.error("Error checking email:", error);
      return false;
    }
  };

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const text = e.target.result;
        const rows = text.split("\n");
        const headers = rows[0]
          .toLowerCase()
          .split(",")
          .map((h) => h.trim());

        // Get current table state
        const currentTableEmails = new Map(
          parsedUsers.map((user) => [
            user.email,
            !duplicateEmails.includes(user.email),
          ])
        );

        const newDuplicates = [];
        const newUsers = [];
        const processedEmails = new Set();

        // Process each row
        for (const row of rows.slice(1)) {
          const values = row.split(",").map((v) => v.trim());
          const email = values[headers.indexOf("email")]?.trim();

          if (!email) continue;

          // Skip if already processed in this import
          if (processedEmails.has(email)) {
            if (!newDuplicates.includes(email)) {
              newDuplicates.push(email);
            }
            continue;
          }

          // Check if email exists in current table
          if (currentTableEmails.has(email)) {
            // If it's a valid entry (not marked as duplicate), skip without marking as duplicate
            if (currentTableEmails.get(email)) {
              continue;
            }
          }

          // Check database for existing email
          const isDuplicate = await checkDuplicateEmail(email);
          if (isDuplicate) {
            if (!newDuplicates.includes(email)) {
              newDuplicates.push(email);
            }
            continue;
          }

          // Add new user if email is unique
          processedEmails.add(email);
          newUsers.push({
            id: Date.now() + newUsers.length,
            email: email,
            firstName: values[headers.indexOf("first_name")]?.trim(),
            middleInitial: values[headers.indexOf("middle_initial")]?.trim(),
            surname: values[headers.indexOf("surname")]?.trim(),
            suffix: values[headers.indexOf("suffix")]?.trim() || "",
          });
        }

        // Update states
        setParsedUsers((prevUsers) => [...prevUsers, ...newUsers]);
        setDuplicateEmails((prev) => [...new Set([...prev, ...newDuplicates])]);

        if (newDuplicates.length > 0) {
          alert(
            `Warning: The following emails are duplicates or already exist and will be ignored:\n${newDuplicates.join(
              "\n"
            )}`
          );
        }
      };
      reader.readAsText(file);
    }

    // Reset file input
    event.target.value = "";
  };

  const handleRoleChange = (userId, newRole) => {
    setParsedUsers((users) =>
      users.map((user) =>
        user.id === userId ? { ...user, roleId: newRole } : user
      )
    );
  };

  const handleCollegeChange = async (newCollege) => {
    setSelectedCollege(newCollege);
    setSelectedProgram(""); // Reset program when college changes

    try {
      const response = await axios.get(`/deptprogs/programs/${newCollege}`);
      setPrograms(response.data.programs);
    } catch (error) {
      console.error("Error fetching programs:", error);
    }
  };

  const handleProgramChange = (userId, newProgram) => {
    setParsedUsers((users) =>
      users.map((user) =>
        user.id === userId ? { ...user, programId: newProgram } : user
      )
    );
  };

  const fetchProgramsForCollege = async (collegeId) => {
    try {
      const response = await axios.get(`/deptprogs/programs/${collegeId}`);
      setProgramsByCollege((prev) => ({
        ...prev,
        [collegeId]: response.data.programs,
      }));
    } catch (error) {
      console.error("Error fetching programs:", error);
    }
  };

  // Add this function to handle form submission
  const handleAddUsers = async () => {
    try {
      // Validate selections
      if (!selectedRole || !selectedCollege || !selectedProgram) {
        alert("Please select role, college, and program");
        return;
      }

      // Check if we have any users to add
      if (parsedUsers.length === 0) {
        alert("Please add at least one user");
        return;
      }

      // Create FormData object
      const formData = new FormData();

      // Get the original CSV file if it exists
      const fileInput = document.querySelector('input[type="file"]');
      if (fileInput?.files[0]) {
        formData.append("file", fileInput.files[0]);
      }

      // Add the parsed users data with common selections
      const enrichedUsers = parsedUsers
        .filter((user) => !duplicateEmails.includes(user.email))
        .map((user) => ({
          email: user.email.trim(),
          firstName: user.firstName.trim(),
          middleInitial: user.middleInitial ? user.middleInitial.trim() : "",
          surname: user.surname.trim(),
          suffix: user.suffix ? user.suffix.trim() : "",
          roleId: selectedRole,
          collegeId: selectedCollege,
          programId: selectedProgram,
        }));

      if (enrichedUsers.length === 0) {
        alert("No valid users to add. All emails are duplicates.");
        return;
      }

      formData.append("users", JSON.stringify(enrichedUsers));

      // Make the API call
      const response = await axios.post("/accounts/bulk", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      // Handle success and download credentials file
      if (response.data) {
        const blob = new Blob([response.data], { type: "text/csv" });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `accounts_${new Date().toISOString()}.csv`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);

        alert("Users added successfully! Downloading credentials file...");
        handleCloseAddModal();
        fetchUsers();
      }
    } catch (error) {
      console.error("Error adding users:", error);
      alert(error.response?.data?.error || "Error adding users");
    }
  };

  const handleAddRow = async () => {
    // Check required fields
    if (!manualEntry.email || !manualEntry.firstName || !manualEntry.surname) {
      alert("Email, First Name, and Surname are required");
      return;
    }

    // Check if email exists in current table
    const emailExistsInTable = parsedUsers.some(
      (user) => user.email === manualEntry.email
    );
    if (emailExistsInTable) {
      alert(`Email ${manualEntry.email} already exists in the current entries`);
      return;
    }

    // Check if email exists in database
    const isDuplicate = await checkDuplicateEmail(manualEntry.email);
    if (isDuplicate) {
      alert(`Email ${manualEntry.email} already exists in the database`);
      return;
    }

    // If email is unique, add the new row
    setParsedUsers([...parsedUsers, { ...manualEntry, id: Date.now() }]);

    // Reset manual entry form
    setManualEntry({
      email: "",
      firstName: "",
      middleInitial: "",
      surname: "",
      suffix: "",
    });
  };

  const handleDeleteRow = async (id) => {
    // Remove the row
    const updatedUsers = parsedUsers.filter((user) => user.id !== id);
    setParsedUsers(updatedUsers);

    // Recalculate duplicates
    const newDuplicates = [];
    for (const user of updatedUsers) {
      // Check for duplicates in current table
      const tableCount = updatedUsers.filter(
        (u) => u.email === user.email
      ).length;
      const isDuplicate =
        tableCount > 1 || (await checkDuplicateEmail(user.email));
      if (isDuplicate && !newDuplicates.includes(user.email)) {
        newDuplicates.push(user.email);
      }
    }
    setDuplicateEmails(newDuplicates);
  };

  // Add this function to check if there are any valid (non-duplicate) users
  const hasValidUsers = () => {
    const validUsers = parsedUsers.filter(
      (user) => !duplicateEmails.includes(user.email)
    );
    return validUsers.length > 0;
  };

  // Update the DuplicateWarning component to show appropriate message
  const DuplicateWarning = ({ duplicateEmails }) => {
    if (duplicateEmails.length === 0) return null;

    const allDuplicates = duplicateEmails.length === parsedUsers.length;

    return (
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1,
          color: "error.main",
          mt: 2,
        }}
      >
        <ErrorIcon fontSize='small' />
        <Typography variant='body2'>
          {allDuplicates
            ? "All emails already exist in the database. No new users will be added."
            : `${duplicateEmails.length} duplicate email${
                duplicateEmails.length === 1 ? "" : "s"
              } found among the users to be added. 
              ${
                duplicateEmails.length === 1 ? "This will" : "These will"
              } be ignored during import: ${duplicateEmails.join(", ")}`}
        </Typography>
      </Box>
    );
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
            <Box sx={{ display: "flex", ml: "5rem", zIndex: 3 }}>
              <IconButton
                onClick={() => navigate(-1)}
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
                  lineHeight: 1.25,
                  alignSelf: "center",
                  zIndex: 2,
                }}
              >
                Manage Users
              </Typography>
            </Box>
          </Box>
          {/*Main Content */}
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            }}
          >
            {/* Search Bar */}
            <Box
              sx={{
                width: "80%", // Center search bar and button
                display: "flex",
                paddingTop: 3,
                paddingBottom: 3,
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <TextField
                variant='outlined'
                placeholder='Search by User ID or Email'
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
              <Button
                variant='contained'
                color='primary'
                onClick={handleOpenAddModal}
                sx={{
                  backgroundColor: "#F40824",
                  color: "#FFF",
                  fontFamily: "Montserrat, sans-serif",
                  fontWeight: 600,
                  textTransform: "none",
                  fontSize: { xs: "0.875rem", md: "1.375rem" },
                  padding: { xs: "0.5rem 1rem", md: "1.5rem" },
                  marginLeft: "2rem",
                  borderRadius: "100px",
                  maxHeight: "3rem",
                }}
              >
                Add Users
              </Button>
            </Box>

            {/* Virtuoso Table */}
            <Box sx={{ width: "80%" }}>
              {loading ? (
                <Box sx={{ display: "flex", justifyContent: "center" }}>
                  <Typography>Loading users...</Typography>
                </Box>
              ) : (
                <Virtuoso
                  style={{ height: "500px" }}
                  totalCount={filteredUsers.length}
                  components={{
                    Header: () => (
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "space-between",
                          backgroundColor: "#0A438F",
                          color: "#FFF",
                          padding: "10px",
                          fontWeight: 700,
                          position: "sticky",
                          top: 0,
                          zIndex: 1000,
                        }}
                      >
                        <Box sx={{ flex: 1 }}>User ID</Box>
                        <Box sx={{ flex: 2 }}>Email</Box>
                        <Box sx={{ flex: 2 }}>Role</Box>
                        <Box sx={{ flex: 1 }}>Modify</Box>
                      </Box>
                    ),
                  }}
                  itemContent={(index) => {
                    const user = filteredUsers[index];
                    return (
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "space-between",
                          padding: "10px",
                          borderBottom: "1px solid #ccc",
                        }}
                      >
                        <Box sx={{ flex: 1 }}>{user.researcher_id}</Box>
                        <Box sx={{ flex: 2 }}>{user.email}</Box>
                        <Box sx={{ flex: 2 }}>{user.role_name || "N/A"}</Box>
                        <Box sx={{ flex: 1 }}>
                          <IconButton onClick={() => handleOpenModal(user)}>
                            <EditIcon color='primary' />
                          </IconButton>
                        </Box>
                      </Box>
                    );
                  }}
                />
              )}
            </Box>
            {selectedUser && (
              <Modal open={openModal} onClose={handleCloseModal}>
                <Box
                  sx={{
                    position: "absolute",
                    top: "50%",
                    left: "50%",
                    transform: "translate(-50%, -50%)",
                    width: "30rem",
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
                    Edit User
                  </Typography>
                  <TextField
                    label='User ID'
                    value={selectedUser.researcher_id}
                    disabled
                    fullWidth
                    margin='normal'
                  />
                  <TextField
                    label='Mapúa MCL Live Account'
                    value={selectedUser.email}
                    disabled
                    fullWidth
                    margin='normal'
                  />
                  <FormControl fullWidth margin='normal'>
                    <InputLabel>Role</InputLabel>
                    <Select
                      value={newRole} // This should hold role_id
                      onChange={(e) => setNewRole(e.target.value)} // Update newRole with role_id
                      label='Role'
                      disabled={
                        selectedUser?.institution !==
                          "Mapúa Malayan Colleges Laguna" ||
                        ["01", "02", "03"].includes(selectedUser?.role_id) // Disable for specific role IDs
                      }
                    >
                      {roles
                        .filter(
                          (role) =>
                            !["01", "02", "03"].includes(role.role_id) || // Keep other roles
                            ["01", "02", "03"].includes(newRole) // Always include if the selected role is restricted
                        )
                        .map((role) => (
                          <MenuItem key={role.role_id} value={role.role_id}>
                            {role.role_name} {/* Display role_name */}
                          </MenuItem>
                        ))}
                    </Select>
                  </FormControl>
                  <FormControl component='fieldset' margin='normal'>
                    <FormLabel
                      component='legend'
                      variant='h6'
                      fontWeight='700'
                      sx={{ mb: "0.5rem", color: "#d40821" }}
                    >
                      Account Status
                    </FormLabel>
                    <RadioGroup
                      value={accountStatus} // Use state variable here
                      onChange={(e) => setAccountStatus(e.target.value)}
                    >
                      <FormControlLabel
                        value='ACTIVATED'
                        control={<Radio />}
                        label='Activated'
                      />
                      <FormControlLabel
                        value='DEACTIVATED'
                        control={<Radio />}
                        label='Deactivated'
                      />
                    </RadioGroup>
                  </FormControl>
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
                      onClick={handleSaveChanges}
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
                      Save
                    </Button>
                  </Box>
                </Box>
              </Modal>
            )}
          </Box>
        </Box>
      </Box>

      {/* Add User Modal */}
      <Modal
        open={openAddModal}
        onClose={handleCloseAddModal}
        aria-labelledby='add-users-modal'
      >
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: "auto",
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
            Add Users
          </Typography>

          {/* Common Dropdowns */}
          <Box sx={{ display: "flex", gap: 2, mb: 3 }}>
            <FormControl sx={{ minWidth: 200 }}>
              <InputLabel>Role</InputLabel>
              <Select
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value)}
                label='Role'
              >
                {roles.map((role) => (
                  <MenuItem key={role.role_id} value={role.role_id}>
                    {role.role_name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl sx={{ minWidth: 200 }}>
              <InputLabel>College</InputLabel>
              <Select
                value={selectedCollege}
                onChange={(e) => handleCollegeChange(e.target.value)}
                label='College'
              >
                {colleges.map((college) => (
                  <MenuItem key={college.college_id} value={college.college_id}>
                    {college.college_name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl sx={{ minWidth: 200 }}>
              <InputLabel>Program</InputLabel>
              <Select
                value={selectedProgram}
                onChange={(e) => setSelectedProgram(e.target.value)}
                label='Program'
                disabled={!selectedCollege}
              >
                {programs.map((program) => (
                  <MenuItem key={program.program_id} value={program.program_id}>
                    {program.program_name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                border: "2px dashed #0A438F",
                borderRadius: 1,
                m: 1,
                cursor: "pointer",
                justifyContent: "center",
                gap: 2,
              }}
            >
              <Button
                variant='text'
                color='primary'
                component='label'
                startIcon={<FileUploadIcon />}
                sx={{
                  padding: "1rem",
                  color: "#08397C",
                  fontFamily: "Montserrat, sans-serif",
                  fontWeight: 600,
                  textTransform: "none",
                  fontSize: { xs: "0.875rem", md: "1rem" },
                  alignSelf: "center",
                  maxHeight: "2rem",
                  "&:hover": {
                    color: "#052045",
                  },
                }}
              >
                Import from CSV
                <input
                  type='file'
                  accept='.csv'
                  hidden
                  onChange={handleFileUpload}
                />
              </Button>
            </Box>
          </Box>

          {/* Users Table */}
          <TableContainer
            sx={{
              mb: 3,
              width: "80rem",
              maxHeight: "400px", // Add fixed height
              overflow: "auto", // Make scrollable
            }}
          >
            <Table stickyHeader>
              {" "}
              {/* Make header sticky */}
              <TableHead>
                <TableRow sx={{ backgroundColor: "#f5f5f5" }}>
                  <TableCell>
                    <Typography variant='subtitle2' sx={{ fontWeight: 700 }}>
                      Email
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant='subtitle2' sx={{ fontWeight: 700 }}>
                      First Name
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant='subtitle2' sx={{ fontWeight: 700 }}>
                      Middle Initial
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant='subtitle2' sx={{ fontWeight: 700 }}>
                      Surname
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant='subtitle2' sx={{ fontWeight: 700 }}>
                      Suffix
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant='subtitle2' sx={{ fontWeight: 700 }}>
                      Action
                    </Typography>
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {/* Existing Users */}
                {parsedUsers.map((user) => (
                  <TableRow
                    key={user.id}
                    sx={{
                      backgroundColor: duplicateEmails.includes(user.email)
                        ? "#ffebee"
                        : "inherit",
                      "&:hover": {
                        backgroundColor: duplicateEmails.includes(user.email)
                          ? "#ffcdd2"
                          : "inherit",
                      },
                    }}
                  >
                    <TableCell>
                      <Box
                        sx={{ display: "flex", alignItems: "center", gap: 1 }}
                      >
                        {user.email}
                        {duplicateEmails.includes(user.email) && (
                          <Tooltip title='Duplicate email'>
                            <ErrorIcon color='error' fontSize='small' />
                          </Tooltip>
                        )}
                      </Box>
                    </TableCell>
                    <TableCell>{user.firstName}</TableCell>
                    <TableCell>{user.middleInitial}</TableCell>
                    <TableCell>{user.surname}</TableCell>
                    <TableCell>{user.suffix}</TableCell>
                    <TableCell>
                      <IconButton
                        onClick={() => handleDeleteRow(user.id)}
                        color='error'
                      >
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
                {/* Manual Entry Row */}
                <TableRow>
                  <TableCell>
                    <TextField
                      size='small'
                      value={manualEntry.email}
                      onChange={(e) =>
                        setManualEntry({
                          ...manualEntry,
                          email: e.target.value,
                        })
                      }
                      placeholder='Email'
                    />
                  </TableCell>
                  <TableCell>
                    <TextField
                      size='small'
                      value={manualEntry.firstName}
                      onChange={(e) =>
                        setManualEntry({
                          ...manualEntry,
                          firstName: e.target.value,
                        })
                      }
                      placeholder='First Name'
                    />
                  </TableCell>
                  <TableCell>
                    <TextField
                      size='small'
                      value={manualEntry.middleInitial}
                      onChange={(e) =>
                        setManualEntry({
                          ...manualEntry,
                          middleInitial: e.target.value,
                        })
                      }
                      placeholder='MI'
                    />
                  </TableCell>
                  <TableCell>
                    <TextField
                      size='small'
                      value={manualEntry.surname}
                      onChange={(e) =>
                        setManualEntry({
                          ...manualEntry,
                          surname: e.target.value,
                        })
                      }
                      placeholder='Surname'
                    />
                  </TableCell>
                  <TableCell>
                    <TextField
                      size='small'
                      value={manualEntry.suffix}
                      onChange={(e) =>
                        setManualEntry({
                          ...manualEntry,
                          suffix: e.target.value,
                        })
                      }
                      placeholder='Suffix'
                    />
                  </TableCell>
                  <TableCell>
                    <IconButton onClick={handleAddRow} color='primary'>
                      <AddIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>

          {/* Footer area with warning and buttons */}
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
              mt: 3,
            }}
          >
            {/* Warning message on the left */}
            <Box sx={{ flex: 1 }}>
              <DuplicateWarning duplicateEmails={duplicateEmails} />
            </Box>

            {/* Action buttons on the right */}
            <Box
              sx={{
                display: "flex",
                gap: 2,
              }}
            >
              <Button
                onClick={handleCloseAddModal}
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
                onClick={handleAddUsers}
                sx={{
                  backgroundColor: "#CA031B",
                  color: "#FFF",
                  fontFamily: "Montserrat, sans-serif",
                  fontWeight: 600,
                  textTransform: "none",
                  fontSize: { xs: "0.875rem", md: "1.275rem" },
                  padding: { xs: "0.5rem 1rem", md: "1.5rem" },
                  borderRadius: "100px",
                  maxHeight: "3rem",
                  "&:hover": {
                    backgroundColor: "#A30417",
                    color: "#FFF",
                  },
                }}
                disabled={
                  !hasValidUsers() || // Disable if no valid users
                  !selectedRole ||
                  !selectedCollege ||
                  !selectedProgram ||
                  parsedUsers.length === 0
                }
              >
                Add Users
              </Button>
            </Box>
          </Box>
        </Box>
      </Modal>
    </>
  );
};

export default ManageUsers;
