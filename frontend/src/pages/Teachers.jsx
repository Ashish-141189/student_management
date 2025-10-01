// src/pages/Teachers.jsx
import React, { useState, useEffect } from "react";
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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  MenuItem,
  Pagination,
} from "@mui/material";
import { toast } from "react-toastify";
import { Add, Edit, Delete, Search } from "@mui/icons-material";
import API from "../services/api";

function Teachers() {
  const [teachers, setTeachers] = useState([]);
  const [courses, setCourses] = useState([]);
  const [form, setForm] = useState({
    name: "",
    email: "",
    subject: "",
    course: "",
    address: "",
    phone: "",
    department: "",
    qualifications: "",
  });
  const [editingId, setEditingId] = useState(null);
  const [open, setOpen] = useState(false);
  const role = localStorage.getItem("role");

  // Pagination & Search states
  const [page, setPage] = useState(1);
  const rowsPerPage = 10;
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchTeachers();
    fetchCourses();
  }, [page, search]); // ✅ refetch when page/search changes

  async function fetchTeachers() {
    try {
      const res = await API.get(
        `/teachers?page=${page}&limit=${rowsPerPage}&search=${encodeURIComponent(
          search
        )}`
      );
      setTeachers(res.data.teachers || []);
      setTotalPages(res.data.totalPages || 1);
    } catch (err) {
      console.error("Error fetching teachers:", err);
      toast.error("Error fetching teachers");
      setTeachers([]);
    }
  }

  async function fetchCourses() {
    try {
      const res = await API.get("/courses");
       // Try to detect correct structure
      const coursesData = Array.isArray(res.data)
        ? res.data
        : Array.isArray(res.data.courses)
        ? res.data.courses
        : Array.isArray(res.data.data)
        ? res.data.data
        : [];

      setCourses(coursesData);
    } catch (err) {
      console.error("Error fetching courses:", err);
      toast.error("Error fetching courses");
      //setCourses([]);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (role !== "admin") {
      toast.error("Only admins can add or update teachers");
      return;
    }
    try {
      const payload = {
        ...form,
        course: form.course || undefined, // prevent sending empty string
      };

      if (editingId) {
        await API.put(`/teachers/${editingId}`, payload);
      } else {
        await API.post("/teachers", payload);
      }
      resetForm();
      fetchTeachers();
      toast.success("Saved successfully");
      setOpen(false);
    } catch (err) {
      console.error("Error saving teacher:", err);
      toast.error(
        err.response?.data?.errors?.[0]?.msg ||
          err.response?.data?.error ||
          "Error saving teacher"
      );
    }
  }

  async function startEdit(t) {
    if (role !== "admin") {
      toast.error("Only admins can edit teachers");
      return;
    }

    // ✅ ensure courses are loaded before showing modal
    if (!courses.length) {
      await fetchCourses();
    }

    setEditingId(t._id);
    setForm({
      name: t.name || "",
      email: t.email || "",
      subject: t.subject || "",
      course: t.course?._id ? String(t.course._id) : t.course || "", // ✅ FIXED
      address: t.address || "",
      phone: t.phone || "",
      department: t.department || "",
      qualifications: t.qualifications || "",
    });
    setOpen(true);
  }

  async function handleDelete(id) {
    if (role !== "admin") {
      toast.error("Only admins can delete teachers");
      return;
    }
    if (!window.confirm("Are you sure you want to delete this teacher?"))
      return;

    try {
      await API.delete(`/teachers/${id}`);
      fetchTeachers();
      toast.success("Deleted successfully");
    } catch (err) {
      console.error("Error deleting teacher:", err);
      toast.error("Error deleting teacher");
    }
  }

  function resetForm() {
    setForm({
      name: "",
      email: "",
      subject: "",
      course: "",
      address: "",
      phone: "",
      department: "",
      qualifications: "",
    });
    setEditingId(null);
  }

  // helper compare for _id values
  const idEquals = (a, b) => String(a ?? "") === String(b ?? "");

  return (
    <Paper sx={{ p: 3, borderRadius: 3, bgcolor: "#f9fafb" }}>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center">
        <Typography variant="h5" fontWeight="bold">
          👨‍🏫 Teachers
        </Typography>
        {role === "admin" && (
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={async () => {
              resetForm();
              // ✅ ensure courses loaded before opening Add
              if (!courses.length) {
                await fetchCourses();
              }
              setOpen(true);
            }}
            sx={{ borderRadius: 2 }}
          >
            Add Teacher
          </Button>
        )}
      </Box>

      {/* Search */}
      <Box display="flex" alignItems="center" gap={2} mt={2}>
        <TextField
          label="Search by name or email"
          variant="outlined"
          size="small"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          fullWidth
        />
        <Search color="action" />
      </Box>

      {/* Teacher Table */}
      <TableContainer
        component={Paper}
        sx={{ mt: 3, borderRadius: 2, boxShadow: "none" }}
      >
        <Table>
          <TableHead sx={{ bgcolor: "#f0f2f5" }}>
            <TableRow>
              <TableCell>
                <strong>Name</strong>
              </TableCell>
              <TableCell>
                <strong>Email</strong>
              </TableCell>
              <TableCell>
                <strong>Subject</strong>
              </TableCell>
              <TableCell>
                <strong>Course</strong>
              </TableCell>
              <TableCell>
                <strong>Phone</strong>
              </TableCell>
              <TableCell>
                <strong>Department</strong>
              </TableCell>
              <TableCell>
                <strong>Qualifications</strong>
              </TableCell>
              <TableCell>
                <strong>Address</strong>
              </TableCell>
              {role === "admin" && (
                <TableCell align="center">
                  <strong>Actions</strong>
                </TableCell>
              )}
            </TableRow>
          </TableHead>

          <TableBody>
            {teachers.map((t, i) => (
              <TableRow
                key={t._id}
                hover
                sx={{ bgcolor: i % 2 === 0 ? "#ffffff" : "#f7f9fc" }}
              >
                <TableCell>{t.name}</TableCell>
                <TableCell>{t.email}</TableCell>
                <TableCell>{t.subject || "N/A"}</TableCell>
                <TableCell>
                  {t.course?.name ||
                    courses.find((c) => idEquals(c._id, t.course))?.name ||
                    "N/A"}
                </TableCell>
                <TableCell>{t.phone || "N/A"}</TableCell>
                <TableCell>{t.department || "N/A"}</TableCell>
                <TableCell>{t.qualifications || "N/A"}</TableCell>
                <TableCell>{t.address || "N/A"}</TableCell>
                {role === "admin" && (
                  <TableCell align="center">
                    <Box
                      sx={{
                        display: "flex",
                        gap: 1,
                        justifyContent: "center",
                      }}
                    >
                      <IconButton
                        color="primary"
                        size="small"
                        onClick={() => startEdit(t)}
                      >
                        <Edit />
                      </IconButton>
                      <IconButton
                        color="error"
                        size="small"
                        onClick={() => handleDelete(t._id)}
                      >
                        <Delete />
                      </IconButton>
                    </Box>
                  </TableCell>
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Pagination */}
      <Box display="flex" justifyContent="center" mt={2}>
        <Pagination
          count={totalPages}
          page={page}
          onChange={(e, val) => setPage(val)}
          color="primary"
          shape="rounded"
        />
      </Box>

      {/* Add/Edit Form in Modal */}
      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        maxWidth="sm"
        fullWidth
        keepMounted
        disableEnforceFocus
      >
        <DialogTitle sx={{ fontWeight: "bold" }}>
          {editingId ? "Edit Teacher" : "Add Teacher"}
        </DialogTitle>
        <form onSubmit={handleSubmit}>
          <DialogContent
            sx={{
              display: "grid",
              gap: 2,
              mt: 1,
              gridTemplateColumns: "1fr 1fr",
            }}
          >
            <TextField
              label="Name"
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
            <TextField
              label="Email"
              type="email"
              required
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
            <TextField
              label="Subject"
              value={form.subject}
              onChange={(e) => setForm({ ...form, subject: e.target.value })}
            />

            {/* ---------- FIXED COURSE SELECT ---------- */}
            <TextField
              select
              label="Course"
              value={
                form.course &&
                courses.some((c) => String(c._id) === String(form.course))
                  ? form.course
                  : ""
              }
              onChange={(e) => setForm({ ...form, course: e.target.value })}
            >
              <MenuItem value="">Select Course</MenuItem>
              {courses.map((c) => (
                <MenuItem key={c._id} value={String(c._id)}>
                  {c.name}
                </MenuItem>
              ))}
            </TextField>
            {/* ---------------------------------------- */}

            <TextField
              label="Phone"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
            />
            <TextField
              label="Department"
              value={form.department}
              onChange={(e) => setForm({ ...form, department: e.target.value })}
            />
            <TextField
              label="Qualifications"
              value={form.qualifications}
              onChange={(e) =>
                setForm({ ...form, qualifications: e.target.value })
              }
            />
            <TextField
              label="Address"
              value={form.address}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
            />
          </DialogContent>
          <DialogActions sx={{ p: 2 }}>
            <Button onClick={() => setOpen(false)}>Cancel</Button>
            <Button
              type="submit"
              variant="contained"
              sx={{ borderRadius: 2 }}
              disabled={role !== "admin"}
            >
              {editingId ? "Update" : "Add"}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Paper>
  );
}

export default Teachers;
