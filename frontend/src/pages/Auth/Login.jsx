import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  TextField,
  Button,
  Checkbox,
  FormControlLabel,
  Typography,
  Divider,
  Box,
  CircularProgress,
  IconButton,
} from "@mui/material";
import { Visibility, VisibilityOff, ArrowBack } from "@mui/icons-material";
import API from "../../services/api";

export default function SignInForm() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [isChecked, setIsChecked] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await API.post("/auth/login", form);
      const { token, role } = res.data;

      const storage = isChecked ? localStorage : sessionStorage;
      storage.setItem("token", token);
      if (role) storage.setItem("role", role);

      alert("Logged in successfully");
      navigate("/dashboard");
    } catch (err) {
      alert(err.response?.data?.error || "Login failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Box display="flex" flexDirection="column" alignItems="center" mt={6}>
      {/* Back link */}


      <Box
        component="form"
        onSubmit={handleSubmit}
        width="100%"
        maxWidth={400}
        p={4}
        borderRadius={2}
        boxShadow={3}
      >
        <Typography variant="h5" fontWeight="600" mb={1}>
          Sign In
        </Typography>
        <Typography variant="body2" color="text.secondary" mb={3}>
          Enter your email and password to sign in!
        </Typography>

        {/* Email */}
        <TextField
          label="Email"
          type="email"
          fullWidth
          margin="normal"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          required
        />

        {/* Password */}
        <Box position="relative">
          <TextField
            label="Password"
            type={showPassword ? "text" : "password"}
            fullWidth
            margin="normal"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            required
          />
          <IconButton
            onClick={() => setShowPassword(!showPassword)}
            size="small"
            sx={{ p: 0, position: "absolute", right: 8, top: 30 }}
          >
            {showPassword ? <Visibility /> : <VisibilityOff />}
          </IconButton>
        </Box>

        {/* Remember me + Forgot password */}
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          mt={1}
        >
          <FormControlLabel
            control={
              <Checkbox
                checked={isChecked}
                onChange={(e) => setIsChecked(e.target.checked)}
              />
            }
            label="Keep me logged in"
          />
          <Link to="/reset-password" style={{ fontSize: 14, color: "#1976d2" }}>
            Forgot password?
          </Link>
        </Box>

        {/* Submit button */}
        <Button
          type="submit"
          variant="contained"
          color="primary"
          fullWidth
          sx={{ mt: 2 }}
          disabled={loading}
        >
          {loading ? <CircularProgress size={22} /> : "Sign In"}
        </Button>

        {/* Signup link */}
        <Typography variant="body2" textAlign="center" mt={3}>
          Don’t have an account?{" "}
          <Link to="/register" style={{ color: "#1976d2" }}>
            Sign Up
          </Link>
        </Typography>
      </Box>
    </Box>
  );
}
