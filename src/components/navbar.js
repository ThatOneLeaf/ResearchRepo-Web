// src/components/Navbar.js

import MenuIcon from "@mui/icons-material/Menu";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import PriorityHighIcon from "@mui/icons-material/PriorityHigh";
import LogoutIcon from "@mui/icons-material/Logout";
import LoginIcon from "@mui/icons-material/Login";
import { isMobile } from "react-device-detect";
import {
  AppBar,
  Box,
  Button,
  Divider,
  IconButton,
  Menu,
  MenuItem,
  Toolbar,
  Typography,
  useMediaQuery,
  useTheme,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  ListItemIcon,
  CircularProgress,
} from "@mui/material";
import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import navLogo from "../assets/MMCL_Logo_Nav.png";
import LoginModal from "./loginmodal";
import { useAuth } from "../context/AuthContext";
import { useModalContext } from "../context/modalcontext";
import api from "../services/api";

const Navbar = () => {
  const { user, logout } = useAuth();
  const theme = useTheme();
  const isLoggedIn = !!user;
  const isSizeMobile = useMediaQuery("(max-width:600px)");

  const [anchorElNav, setAnchorElNav] = useState(null);
  const [anchorElUser, setAnchorElUser] = useState(null);

  const [open, setOpen] = React.useState(false);
  const anchorRef = React.useRef < HTMLButtonElement > null;
  const [openConfirmDialog, setOpenConfirmDialog] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const {
    isLoginModalOpen,
    openLoginModal,
    closeLoginModal,
    openSignupModal,
    closeSignupModal,
    openPassresetModal,
    closePassresetModal,
  } = useModalContext();

  // Add this style object for active buttons
  const activeButtonStyle = {
    position: "relative",
    color: "#CA031B", // Match the underline color
    "&:after": {
      content: '""',
      position: "absolute",
      bottom: 0, // Aligns the underline closely below the text
      left: 0,
      width: "100%",
      height: "3px", // Thickness of the underline
      backgroundColor: "#CA031B",
    },
    "&:hover": {
      color: "#a8031b", // Darker shade on hover
    },
  };

  // Update buttonSettings to include active state
  const buttonSettings = {
    color: "#001C43",
    fontFamily: "Montserrat, sans-serif",
    fontWeight: 600,
    fontSize: {
      sm: "0.25rem",
      md: "0.5rem",
      lg: "0.6rem",
    },
    "&:hover": {
      backgroundColor: "rgba(202, 3, 27, 0.04)",
    },
  };

  {
    /*****************Event Handlers******************/
  }

  {
    /*Logged Out*/
  }
  const handleResearchThrust = () => {
    navigate("/researchthrust");
  };

  const handleLogin = () => {
    openLoginModal();
  };

  {
    /*Logged In*/
  }
  const handleOpenNavMenu = (event) => {
    setAnchorElNav(event.currentTarget);
  };

  const handleCloseNavMenu = () => {
    setAnchorElNav(null);
  };

  const handleOpenUserMenu = (event) => {
    setAnchorElUser(event.currentTarget);
  };

  const handleCloseUserMenu = () => {
    setAnchorElUser(null);
  };

  const handleProfile = () => {
    navigate("/profile");
  };

  const handleAboutUs = () => {
    navigate("/aboutus");
  };

  const handleHelp = () => {
    navigate("/help");
  };

  const handleCollection = () => {
    navigate("/collection");
  };

  const handleManageUsers = () => {
    navigate("/manage-users");
  };

  const handleManageCollege = () => {
    navigate("/managecollege");
  };

  const handleManageProgram = () => {
    navigate("/manageprogram");
  };

  const handleViewAuditLog = () => {
    navigate("/auditlog");
  };

  const handleReports = () => {
    navigate("/dash");
  };

  const handleProgDash = () => {
    navigate("/progdash");
  };

  const handleResesearchTrack = () => {
    navigate("/researchtracking");
  };

  const handleNavigateHome = () => {
    navigate("/home");
  };

  const handleKnowledgeGraph = () => {
    navigate("/knowledgegraph");
  };

  const handleBackup = () => {
    navigate("/backup");
  };

  const confirmLogout = async () => {
    setOpenConfirmDialog(true);
  };

  const handleLogout = async () => {
    setIsSubmitting(true);
    try {
      const response = await api({
        method: "post",
        url: "/auth/logout",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        withCredentials: true,
      });

      if (response.status === 200) {
        // Clear the token from storage
        localStorage.removeItem("token");
        // Update auth context state
        logout();
        // Close any open menus
        handleCloseUserMenu();
        // Navigate to home
        navigate("/home", { replace: true });
      }

      setIsSubmitting(false);
    } catch (error) {
      console.error("Logout error:", error);
      // Still perform logout actions even if the server request fails
      localStorage.removeItem("token");
      logout();
      handleCloseUserMenu();
      navigate("/home", { replace: true });
    }
  };

  // Helper function to get path from label
  const getPathFromLabel = (label) => {
    const pathMap = {
      Collections: "/collection",
      "Research Thrusts": "/researchthrust",
      Dashboard: "/dash",
      "Knowledge Graph": "/knowledgegraph",
      "Manage Users": "/manage-users",
      "Manage Colleges": "/managecollege",
      "Manage Programs": "/manageprogram",
      "View Audit Logs": "/auditlog",
      "Backup and Restore": "/backup",
      "Research Tracking": "/researchtracking",
      "Knowledge Graph": "/knowledgegraph",
      Home: "/home",
      "Institutional Performance Dashboard": "/progdash",
      "About Us": "/aboutus",
      Help: "/help",
    };
    return pathMap[label] || "/";
  };

  // Define which menu items are available for each role
  const getNavbarItems = (forMobile = false) => {
    if (!user)
      return forMobile
        ? [
            { label: "Home", onClick: handleNavigateHome },
            { label: "Log in", onClick: handleLogin },
          ]
        : [];

    const commonItems = [];

    if (user.role !== "01") {
      commonItems.push(
        { label: "Collections", onClick: handleCollection },
        { label: "Knowledge Graph", onClick: handleKnowledgeGraph }
      );
    }

    // For mobile view, add these common items
    if (forMobile) {
      if (user.role !== "06") {
        commonItems.push(
          { label: "About Us", onClick: handleAboutUs },
          { label: "Help", onClick: handleHelp }
        );
      }
    }

    // If mobile or size is mobile and we want mobile items
    if ((isMobile || isSizeMobile) && !forMobile) {
      // On mobile, only return common items for desktop view
      return commonItems;
    }

    // Role-specific items
    const roleSpecificItems = {
      "01": [
        // System Administrator
        { label: "Manage Users", onClick: handleManageUsers },
        { label: "Manage Colleges", onClick: handleManageCollege },
        { label: "Manage Programs", onClick: handleManageProgram },
        { label: "View Audit Logs", onClick: handleViewAuditLog },
        { label: "Backup and Restore", onClick: handleBackup },
        ...commonItems,
      ],
      "02": [
        // Director
        { label: "Dashboard", onClick: handleReports },
        { label: "Research Tracking", onClick: handleResesearchTrack },
        ...commonItems,
      ],
      "03": [
        // Head Executive
        { label: "Dashboard", onClick: handleReports },
        ...commonItems,
      ],
      "04": [
        // College Administrator
        { label: "Dashboard", onClick: handleReports },
        ...commonItems,
      ],
      "05": [
        // Program Administrator
        {
          label: "Institutional Performance Dashboard",
          onClick: handleProgDash,
        },
        { label: "Research Tracking", onClick: handleResesearchTrack },
        ...commonItems,
      ],
      "06": [
        // Researcher
        ...commonItems,
      ],
    };

    const items =
      roleSpecificItems[user.role]?.map((item) => ({
        ...item,
        isActive: location.pathname === getPathFromLabel(item.label),
      })) || commonItems;

    return items;
  };

  useEffect(() => {
    let prevRatio = window.devicePixelRatio;

    const handleZoomChange = () => {
      if (window.devicePixelRatio !== prevRatio) {
        handleCloseNavMenu();
        handleCloseUserMenu();
        prevRatio = window.devicePixelRatio;
      }
    };

    window.addEventListener("resize", handleZoomChange);

    return () => {
      window.removeEventListener("resize", handleZoomChange);
    };
  }, []);

  const mobileMenuItems = getNavbarItems(true);

  return (
    <AppBar
      position='fixed'
      sx={{
        backgroundColor: "#FFF",
        height: {
          xs: "3rem",
          sm: "3.5rem",
          md: "4rem",
        },
        zIndex: theme.zIndex.appBar,
      }}
    >
      <Toolbar
        sx={{
          height: "100%",
          display: "flex",
          flexWrap: "nowrap",
          justifyContent: "space-between",
          alignItems: "center",
          px: { xs: 2, sm: 2, md: 3 },
        }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            flexGrow: { xs: 1, md: 0 },
          }}
        >
          <IconButton
            onClick={null}
            sx={{
              p: 0,
              width: { xs: "3rem", sm: "3rem", md: "3.5rem", lg: "3.75rem" },
              height: "100%",
            }}
          >
            <img
              src={navLogo}
              alt='Logo'
              style={{
                width: "100%",
                height: "100%",
                objectFit: "contain",
                padding: "0.5rem",
              }}
            />
          </IconButton>
          <Divider
            orientation='vertical'
            flexItem
            sx={{
              mx: { xs: 1.5, md: 2 },
              borderColor: "#CA031B",
              height: { xs: "2rem", md: "2rem" },
              borderWidth: { xs: "1px", sm: "1px", md: "1.5px" },
              alignSelf: "center",
            }}
          />
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "left",
              cursor: "pointer",
            }}
            onClick={null}
          >
            <Typography
              variant='h6'
              sx={{
                fontFamily: "Montserrat, sans-serif",
                fontWeight: 600,
                color: "#CA031B",
                fontSize: {
                  sm: "0.5rem",
                  sm: "0.6rem",
                  md: "0.7rem",
                  lg: "0.8rem",
                },
              }}
            >
              Institutional
            </Typography>
            <Typography
              variant='h6'
              sx={{
                fontFamily: "Montserrat, sans-serif",
                fontWeight: 600,
                color: "#001C43",
                fontSize: {
                  sm: "0.5rem",
                  sm: "0.6rem",
                  md: "0.7rem",
                  lg: "0.8rem",
                },
                lineHeight: { xs: "1.2", md: "1.2" },
              }}
            >
              Research Repository
            </Typography>
          </Box>
        </Box>

        {/*Navigation Buttons*/}
        <Box sx={{ display: { xs: "none", md: "flex" }, gap: 3 }}>
          {!isLoggedIn ? (
            <Box
              sx={{
                display: { xs: "none", md: "flex" },
                alignItems: "center",
                gap: { md: 1, lg: 2 },
              }}
            >
              <Button onClick={handleNavigateHome} sx={buttonSettings}>
                Home
              </Button>
              <Button onClick={handleResearchThrust} sx={buttonSettings}>
                Research Thrusts
              </Button>
              <Divider
                orientation='vertical'
                flexItem
                sx={{
                  ml: 1,
                  borderColor: "#CA031B",
                  height: { xs: "0.8rem", md: "1rem" },
                  borderWidth: { xs: "1px", sm: "1px", md: "1.5px" },
                  alignSelf: "center",
                }}
              />
              <Button
                onClick={handleLogin}
                sx={{
                  ...buttonSettings,
                  color: "#CA031B",
                  fontSize: "0.7rem",
                  fontWeight: 700,
                }}
              >
                <LoginIcon />
                &nbsp; Log in
              </Button>
            </Box>
          ) : (
            <Box sx={{ display: "flex", gap: 1 }}>
              {getNavbarItems().map((item, index) => (
                <Button
                  key={index}
                  onClick={item.onClick}
                  sx={{
                    ...buttonSettings,
                    ...(item.isActive ? activeButtonStyle : {}),
                  }}
                >
                  {item.label}
                </Button>
              ))}
              <Divider
                orientation='vertical'
                flexItem
                sx={{
                  ml: 1,
                  borderColor: "#CA031B",
                  height: { xs: "2rem", md: "2rem" },
                  borderWidth: { xs: "1px", sm: "1px", md: "1.5px" },
                  alignSelf: "center",
                }}
              />
              <Button
                onClick={handleOpenUserMenu}
                sx={{
                  color: "#CA031B",
                  fontSize: { xs: "2rem", md: "2rem", lg: "2.5rem" },
                }}
              >
                <AccountCircleIcon fontSize='inherit' />
                <Typography
                  variant='h6'
                  sx={{
                    alignSelf: "center",
                    fontFamily: "Montserrat, sans-serif",
                    ml: 1,
                    color: "#001C43",
                    fontSize: {
                      sm: "0.3rem",
                      md: "0.4rem",
                      lg: "0.5rem",
                    },
                  }}
                >
                  <strong style={{ fontSize: "0.7rem" }}>
                    {user?.first_name} {user?.last_name}
                  </strong>{" "}
                  <br />
                  {user?.role_name} <br />{" "}
                  {(user?.role === "04" ||
                    user?.role === "05" ||
                    user?.college ||
                    user?.program) && (
                    <>
                      {user?.college} - {user?.program}
                    </>
                  )}
                </Typography>
              </Button>
            </Box>
          )}
        </Box>

        <Box sx={{ display: { xs: "flex", md: "none" } }}>
          <IconButton
            size='large'
            aria-label='menu'
            aria-controls='menu-appbar'
            aria-haspopup='true'
            onClick={handleOpenNavMenu}
            sx={{ color: "#CA031B", pb: "1rem" }}
          >
            <MenuIcon />
          </IconButton>

          <Menu
            id='menu-appbar'
            anchorEl={anchorElNav}
            anchorOrigin={{
              vertical: "bottom",
              horizontal: "center",
            }}
            keepMounted
            transformOrigin={{
              vertical: "top",
              horizontal: "center",
            }}
            open={Boolean(anchorElNav)}
            onClose={handleCloseNavMenu}
            onSelect={handleCloseNavMenu}
            sx={{
              "& .MuiPaper-root": {
                backgroundColor: "#CA031B",
                width: "auto", // Adjust width as needed
              },
            }}
          >
            {isLoggedIn && (
              <>
                <Button
                  onClick={handleProfile}
                  sx={{
                    color: "#FFF",
                    fontSize: { xs: "2rem", md: "2rem", lg: "3rem" },
                    paddingLeft: 2,
                    paddingRight: 2,
                  }}
                >
                  <AccountCircleIcon fontSize='inherit' />
                  <Typography
                    variant='h6'
                    sx={{
                      fontFamily: "Montserrat, sans-serif",
                      ml: 1,
                      color: "#FFF",
                      fontSize: {
                        xs: "0.55em",
                        sm: "0.6rem",
                        md: "0.65rem",
                        lg: "0.7rem",
                      },
                    }}
                  >
                    <strong style={{ fontSize: "0.7rem" }}>
                      {user?.first_name} {user?.last_name}
                    </strong>{" "}
                    <br />
                    {user?.role_name} <br />{" "}
                    {(user?.role === "04" ||
                      user?.role === "05" ||
                      user?.college ||
                      user?.program) && (
                      <>
                        {user?.college} - {user?.program}
                      </>
                    )}
                  </Typography>
                </Button>
                <Divider sx={{ borderColor: "#FFFFF" }} />
              </>
            )}
            {mobileMenuItems.map((menuItem, index) => (
              <MenuItem
                key={index}
                onClick={() => {
                  menuItem.onClick();
                  handleCloseNavMenu(); // Close the menu
                }}
              >
                <Typography
                  textAlign='center'
                  sx={{
                    fontSize: {
                      sm: "0.7rem",
                      md: "0.9rem",
                      lg: "1rem",
                    },
                    color: "#FFF",
                  }}
                >
                  {menuItem.label}
                </Typography>
              </MenuItem>
            ))}

            {isLoggedIn && (
              <>
                <Divider sx={{ borderColor: "#FFFFF" }} />
                <MenuItem
                  key='Log out'
                  onClick={() => {
                    handleCloseNavMenu(); // Ensure the menu closes
                    confirmLogout();
                  }}
                >
                  <ListItemIcon>
                    <LogoutIcon sx={{ color: "#FFF" }} />
                  </ListItemIcon>
                  <Typography
                    textAlign='center'
                    sx={{ color: "#FFF", fontWeight: 800 }}
                  >
                    Log out
                  </Typography>
                </MenuItem>
              </>
            )}
          </Menu>
        </Box>

        {/*User Menu*/}
        <Menu
          anchorEl={anchorElUser}
          anchorOrigin={{
            vertical: "bottom",
            horizontal: "center",
          }}
          keepMounted
          transformOrigin={{
            vertical: "top",
            horizontal: "center",
          }}
          open={Boolean(anchorElUser)}
          onClose={handleCloseUserMenu}
          onClick={handleCloseUserMenu}
          sx={{ "& .MuiPaper-root": { backgroundColor: "#CA031B" } }}
        >
          <MenuItem onClick={handleProfile}>
            <Typography
              color='common.white'
              sx={{ fontSize: { sm: "0.7rem", md: "0.9rem", lg: "1rem" } }}
            >
              Profile
            </Typography>
          </MenuItem>
          {user?.role !== "01" && (
            <>
              <MenuItem onClick={handleAboutUs}>
                <Typography
                  color='common.white'
                  sx={{
                    fontSize: { sm: "0.7rem", md: "0.9rem", lg: "1rem" },
                  }}
                >
                  About Us
                </Typography>
              </MenuItem>
              <MenuItem onClick={handleHelp}>
                <Typography
                  color='common.white'
                  sx={{
                    fontSize: { sm: "0.7rem", md: "0.9rem", lg: "1rem" },
                  }}
                >
                  Help
                </Typography>
              </MenuItem>
            </>
          )}
          <Divider />
          <MenuItem onClick={confirmLogout}>
            <ListItemIcon>
              <LogoutIcon sx={{ color: "#FFF" }} />
            </ListItemIcon>
            <Typography
              textAlign='center'
              sx={{
                color: "#FFF",
                fontWeight: 800,
                fontSize: { sm: "0.7rem", md: "0.9rem", lg: "1rem" },
              }}
            >
              Log out
            </Typography>
          </MenuItem>
        </Menu>
      </Toolbar>

      {/* Confirmation Dialog */}
      <Dialog
        open={openConfirmDialog}
        onClose={() => setOpenConfirmDialog(false)}
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
            <PriorityHighIcon />
          </Box>
          &nbsp;Confirm Logout
        </DialogTitle>
        <DialogContent>
          <Typography
            sx={{
              fontFamily: "Montserrat, sans-serif",
              color: "#666",
              mt: 1,
            }}
          >
            Are you sure you want to log out?
          </Typography>
        </DialogContent>
        <DialogActions sx={{ padding: "1rem" }}>
          <Button
            onClick={() => setOpenConfirmDialog(false)}
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
            Cancel
          </Button>
          <Button
            onClick={() => {
              setOpenConfirmDialog(false);
              handleLogout();
            }}
            variant='contained'
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
            {isSubmitting ? (
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <CircularProgress size={20} color='#08397C' />
                Log out
              </Box>
            ) : (
              "Log out"
            )}
          </Button>
        </DialogActions>
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
                Logging out...
              </Typography>
            </Box>
          </Box>
        )}
      </Dialog>
      <LoginModal />
    </AppBar>
  );
};

export default Navbar;
