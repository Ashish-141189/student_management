import React, { useState } from "react";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import { Link, useNavigate } from "react-router-dom";
import DashboardIcon from "@mui/icons-material/Dashboard";
import SchoolIcon from "@mui/icons-material/School";
import PersonIcon from "@mui/icons-material/Person";
import BookIcon from "@mui/icons-material/MenuBook";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import ChatIcon from "@mui/icons-material/Chat";
import LogoutIcon from "@mui/icons-material/Logout";
import MenuIcon from "@mui/icons-material/Menu";
import {
  Box,
  Button,
  Menu,
  MenuItem,
  useMediaQuery,
  useTheme,
} from "@mui/material";

export default function TopBar() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  const [anchorEl, setAnchorEl] = useState(null);

  function logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    navigate("/login");
  }

  const handleMenuOpen = (e) => setAnchorEl(e.currentTarget);
  const handleMenuClose = () => setAnchorEl(null);

  return (
    <AppBar position="static" elevation={0} sx={{ bgcolor: "primary.main" }}>
      <Toolbar>
        {/* Left: Dashboard/Home */}
        {token && (
          <IconButton
            color="inherit"
            edge="start"
            onClick={() => navigate("/dashboard")}
            sx={{ mr: 2 }}
          >
            <DashboardIcon />
          </IconButton>
        )}

        {/* Desktop Menu (center) */}
        {token && !isMobile && (
          <Box
            sx={{
              flexGrow: 1,
              display: "flex",
              justifyContent: "center",
              gap: 2,
            }}
          >
            <Button color="inherit" component={Link} to="/students" startIcon={<SchoolIcon />}>
              Students
            </Button>
            <Button color="inherit" component={Link} to="/teachers" startIcon={<PersonIcon />}>
              Teachers
            </Button>
            <Button color="inherit" component={Link} to="/courses" startIcon={<BookIcon />}>
              Courses
            </Button>
            <Button color="inherit" component={Link} to="/finance" startIcon={<AttachMoneyIcon />}>
              Finance
            </Button>
            <Button color="inherit" component={Link} to="/communication" startIcon={<ChatIcon />}>
              Communication
            </Button>
          </Box>
        )}

        {/* Right Side (mobile: logout + hamburger) */}
        {token && isMobile && (
          <Box sx={{ ml: "auto", display: "flex", alignItems: "center" }}>
            <IconButton color="inherit" onClick={logout}>
              <LogoutIcon />
            </IconButton>
            <IconButton color="inherit" onClick={handleMenuOpen}>
              <MenuIcon />
            </IconButton>
          </Box>
        )}

        {/* Right: Desktop Logout */}
        {token && !isMobile && (
          <IconButton color="inherit" onClick={logout}>
            <LogoutIcon />
          </IconButton>
        )}

        {/* Hamburger Menu for Mobile */}
        {isMobile && (
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleMenuClose}
          >
            <MenuItem component={Link} to="/students" onClick={handleMenuClose}>
              <SchoolIcon sx={{ mr: 1 }} /> Students
            </MenuItem>
            <MenuItem component={Link} to="/teachers" onClick={handleMenuClose}>
              <PersonIcon sx={{ mr: 1 }} /> Teachers
            </MenuItem>
            <MenuItem component={Link} to="/courses" onClick={handleMenuClose}>
              <BookIcon sx={{ mr: 1 }} /> Courses
            </MenuItem>
            <MenuItem component={Link} to="/finance" onClick={handleMenuClose}>
              <AttachMoneyIcon sx={{ mr: 1 }} /> Finance
            </MenuItem>
            <MenuItem component={Link} to="/communication" onClick={handleMenuClose}>
              <ChatIcon sx={{ mr: 1 }} /> Communication
            </MenuItem>
          </Menu>
        )}

        {/* Not logged in view */}
        {!token && (
          <Typography variant="h6" sx={{ flexGrow: 1, textAlign: "center" }}>
            Student Management
          </Typography>
        )}
      </Toolbar>
    </AppBar>
  );
}
