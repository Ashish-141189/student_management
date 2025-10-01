// src/pages/Courses.jsx
import React, { useState, useEffect } from "react";
import API from "../services/api";
import {
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Pagination,
  Grid,
  Divider,
} from "@mui/material";
import { Edit, Delete } from "@mui/icons-material";
import { toast } from "react-toastify";

function Courses() {
  const [courses, setCourses] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [form, setForm] = useState({
    name: "",
    description: "",
    duration: "",
    credit: "",
    fees: "",
    teacherId: "",
  });
  const [editingId, setEditingId] = useState(null);
  const [open, setOpen] = useState(false);

  // pagination & sorting
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [sortBy, setSortBy] = useState("createdAt");
  const [order, setOrder] = useState("desc");
  const coursesPerPage = 10;

  const role = localStorage.getItem("role");

  useEffect(() => {
    fetchCourses();
    fetchTeachers();
  }, [page, sortBy, order]);

  async function fetchCourses() {
    try {
      const query = `?page=${page}&limit=${coursesPerPage}&sortBy=${sortBy}&order=${order}`;
      const res = await API.get(`/courses${query}`);
      // ✅ Populate teacher in frontend if not already populated
      const coursesData = Array.isArray(res.data)
        ? res.data
        : res.data.courses || [];
      setCourses(coursesData);
      setTotalPages(res.data.totalPages || 1);
    } catch {
      toast.error("Error fetching courses");
    }
  }

  async function fetchTeachers() {
    try {
      const res = await API.get(`/teachers?page=${page}&limit=100`); // fetch all for dropdown
      setTeachers(Array.isArray(res.data) ? res.data : res.data.teachers || []);
    } catch {
      toast.error("Error fetching teachers");
      setTeachers([]);
    }
  }

  function handleOpen(course = null) {
    if (!["admin", "teacher"].includes(role)) {
      toast.error("Insufficient permissions");
      return;
    }
    if (course) {
      setEditingId(course._id);
      setForm({
        name: course.name || "",
        description: course.description || "",
        duration: course.duration || "",
        credit: course.credit || "",
        fees: course.fees || "", // ✅ Prefill fees
        teacherId:
          // ✅ Fix: ensure teacherId is always string id
          course.teacherId?._id || course.teacherId || "",
      });
    } else {
      setEditingId(null);
      setForm({
        name: "",
        description: "",
        duration: "",
        credit: "",
        fees: "",
        teacherId: "",
      });
    }
    setOpen(true);
  }

  function handleClose() {
    setOpen(false);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!["admin", "teacher"].includes(role)) {
      toast.error("Insufficient permissions");
      return;
    }
    try {
      const payload = {
        ...form,
        teacherId: form.teacherId || undefined, // ✅ fix ObjectId error
      };

      if (editingId) {
        await API.put(`/courses/${editingId}`, payload);
      } else {
        await API.post("/courses", payload);
      }

      fetchCourses();
      handleClose();
      toast.success("Course saved successfully");
    } catch (err) {
      toast.error(
        err.response?.data?.errors?.[0]?.msg ||
          err.response?.data?.error ||
          "Error saving course"
      );
    }
  }

  async function handleDelete(id) {
    if (role !== "admin") {
      toast.error("Only admins can delete");
      return;
    }
    if (!window.confirm("Delete this course?")) return;
    try {
      await API.delete(`/courses/${id}`);
      fetchCourses();
      toast.success("Course deleted");
    } catch {
      toast.error("Error deleting");
    }
  }

  return (
    <Paper sx={{ p: 3, borderRadius: 3, bgcolor: "#f9fafb" }}>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h5" fontWeight="bold" sx={{ mb: 3 }}>
          📚 Courses
        </Typography>
        <Button
          variant="contained"
          onClick={() => handleOpen()}
          disabled={!["admin", "teacher"].includes(role)}
        >
          + Add Course
        </Button>
      </Box>

      {/* Sorting Controls */}
      <Grid container spacing={2} mb={2}>
        <Grid item xs={12} sm={6} md={4}>
          <FormControl fullWidth>
            <InputLabel>Sort By</InputLabel>
            <Select
              value={sortBy}
              label="Sort By"
              onChange={(e) => {
                setSortBy(e.target.value);
                setPage(1);
              }}
            >
              <MenuItem value="createdAt">Newest</MenuItem>
              <MenuItem value="name">Name</MenuItem>
              <MenuItem value="duration">Duration</MenuItem>
              <MenuItem value="credit">Credit</MenuItem>
              <MenuItem value="fees">Fees</MenuItem>
              <MenuItem value="teacherId">Teacher</MenuItem>
            </Select>
          </FormControl>
        </Grid>

        <Grid item xs={12} sm={6} md={4}>
          <FormControl fullWidth>
            <InputLabel>Order</InputLabel>
            <Select
              value={order}
              label="Order"
              onChange={(e) => {
                setOrder(e.target.value);
                setPage(1);
              }}
            >
              <MenuItem value="asc">Ascending</MenuItem>
              <MenuItem value="desc">Descending</MenuItem>
            </Select>
          </FormControl>
        </Grid>
      </Grid>

      <Divider sx={{ mb: 2 }} />

      {/* Courses Table */}
      <TableContainer component={Paper} sx={{ mt: 3, borderRadius: 2, boxShadow: "none" }}>
        <Table>
          <TableHead sx={{ backgroundColor: "#f5f5f5" }}>
            <TableRow>
              <TableCell><strong>Name</strong></TableCell>
              <TableCell><strong>Description</strong></TableCell>
              <TableCell><strong>Duration</strong></TableCell>
              <TableCell><strong>Credit</strong></TableCell>
              <TableCell><strong>Fees</strong></TableCell>
              <TableCell><strong>Teacher</strong></TableCell>
              <TableCell><strong>Created At</strong></TableCell>
              <TableCell align="right"><strong>Actions</strong></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {courses.map((c) => (
              <TableRow key={c._id} hover>
                <TableCell>{c.name}</TableCell>
                <TableCell>{c.description || "—"}</TableCell>
                <TableCell>{c.duration || "—"}</TableCell>
                <TableCell>{c.credit || "—"}</TableCell>
                <TableCell>{c.fees || "—"}</TableCell>
                <TableCell>
                  {c.teacherId
                    ? c.teacherId.name || teachers.find(t => t._id === c.teacherId)?.name
                    : "—"}
                </TableCell>
                <TableCell>{new Date(c.createdAt).toLocaleDateString()}</TableCell>
                <TableCell align="right">
                  <IconButton
                    size="small"
                    onClick={() => handleOpen(c)}
                    disabled={!["admin", "teacher"].includes(role)}
                  >
                    <Edit color="primary" />
                  </IconButton>
                  <IconButton
                    size="small"
                    onClick={() => handleDelete(c._id)}
                    disabled={role !== "admin"}
                  >
                    <Delete color="error" />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
            {courses.length === 0 && (
              <TableRow>
                <TableCell colSpan={8} align="center">
                  No courses found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Pagination */}
      {totalPages > 1 && (
        <Box display="flex" justifyContent="center" mt={3}>
          <Pagination
            count={totalPages}
            page={page}
            onChange={(e, value) => setPage(value)}
            color="primary"
            shape="rounded"
          />
        </Box>
      )}

      {/* Modal Form */}
      <Dialog
        open={open}
        onClose={handleClose}
        fullWidth
        maxWidth="sm"
        disableEnforceFocus
        keepMounted
      >
        <DialogTitle>{editingId ? "Edit Course" : "Add Course"}</DialogTitle>
        <DialogContent>
          <Box
            component="form"
            onSubmit={handleSubmit}
            sx={{ display: "grid", gap: 2, mt: 1 }}
          >
            <TextField
              label="Name"
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
            <TextField
              label="Description"
              multiline
              minRows={2}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
            <TextField
              label="Duration"
              required
              value={form.duration}
              onChange={(e) => setForm({ ...form, duration: e.target.value })}
            />
            <TextField
              label="Credit"
              type="number"
              required
              value={form.credit}
              onChange={(e) => setForm({ ...form, credit: e.target.value })}
            />
            <TextField
              label="Fees"
              type="number"
              required
              value={form.fees}
              onChange={(e) => setForm({ ...form, fees: e.target.value })}
            />
            <FormControl fullWidth>
              <InputLabel>Teacher</InputLabel>
              <Select
                value={form.teacherId}
                onChange={(e) => setForm({ ...form, teacherId: e.target.value })}
              >
                <MenuItem value="">Select Teacher</MenuItem>
                {teachers.map((t) => (
                  <MenuItem key={t._id} value={t._id}>
                    {t.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained">
            {editingId ? "Update" : "Add"}
          </Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
}

export default Courses;
