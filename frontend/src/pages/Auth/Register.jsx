import { useState } from "react";
import {
  Box,
  Button,
  Checkbox,
  FormControl,
  FormControlLabel,
  IconButton,
  InputAdornment,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Typography,
} from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import API from "../../services/api";

export default function Register() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "student",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isChecked, setIsChecked] = useState(false);
  const navigate = useNavigate();

  async function submit(e) {
    e.preventDefault();
    if (!isChecked) {
      toast.error("You must agree to the terms to register.");
      return;
    }

    try {
      const res = await API.post("/auth/register", form);
      localStorage.setItem("token", res.data.token);
      if (res.data.role) localStorage.setItem("role", res.data.role);
      toast.success("Registered and logged in");
      navigate("/dashboard");
    } catch (err) {
      toast.error(err.response?.data?.error || "Registration failed");
    }
  }

  return (
    <Box
      sx={{
        maxWidth: 420,
        mx: "auto",
        p: 4,
        mt: 6,
        boxShadow: 3,
        borderRadius: 2,
        backgroundColor: "background.paper",
      }}
    >
      {/* Header */}
      <Box sx={{ mb: 3, textAlign: "left" }}>
        <Typography variant="h5" fontWeight={600}>
          Create an Account
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Please fill in the form to register
        </Typography>
      </Box>

      {/* Form */}
      <form onSubmit={submit}>
        {/* Name */}
        <TextField
          label="Full Name"
          variant="outlined"
          fullWidth
          margin="normal"
          required
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
        />

        {/* Email */}
        <TextField
          label="Email"
          type="email"
          variant="outlined"
          fullWidth
          margin="normal"
          required
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
        />

        {/* Password */}
        <TextField
          label="Password"
          type={showPassword ? "text" : "password"}
          variant="outlined"
          fullWidth
          margin="normal"
          required
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton
                  onClick={() => setShowPassword(!showPassword)}
                  edge="end"
                >
                  {showPassword ? <VisibilityOff /> : <Visibility />}
                </IconButton>
              </InputAdornment>
            ),
          }}
        />

        {/* Role */}
        <FormControl fullWidth margin="normal">
          <InputLabel id="role-select-label">Role</InputLabel>
          <Select
            labelId="role-select-label"
            value={form.role}
            label="Role"
            onChange={(e) => setForm({ ...form, role: e.target.value })}
          >
            <MenuItem value="student">Student</MenuItem>
            <MenuItem value="teacher">Teacher</MenuItem>
            <MenuItem value="admin">Admin</MenuItem>
          </Select>
        </FormControl>

        {/* Terms & Conditions */}
        <FormControlLabel
          control={
            <Checkbox
              checked={isChecked}
                sx={{ p: 0 }} 
              onChange={(e) => setIsChecked(e.target.checked)}
            />
          }
          label={
            <Typography variant="body2" color="text.secondary">
              I agree to the <span style={{ color: "#1976d2" }}>Terms</span> and{" "}
              <span style={{ color: "#1976d2" }}>Privacy Policy</span>
            </Typography>
          }
          sx={{ alignItems: "flex-center", mt: 1 }}
        />

        {/* Submit Button */}
        <Button
          type="submit"
          fullWidth
          variant="contained"
          color="primary"
          size="large"
          sx={{ mt: 3 }}
        >
          Register
        </Button>

        {/* Sign In Link */}
        <Typography
          variant="body2"
          align="center"
          sx={{ mt: 2, color: "text.secondary" }}
        >
          Already have an account?{" "}
          <Link to="/login" style={{ color: "#1976d2" }}>
            Sign In
          </Link>
        </Typography>
      </form>
    </Box>
  );
}
