// src/pages/Students.jsx
import React, { useEffect, useState, useRef } from "react";
import {
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Pagination,
  FormControl,
  InputLabel,
  Select,
  Grid,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  TableContainer,
  Paper,
} from "@mui/material";
import API from "../services/api";

function Students() {
  const [students, setStudents] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [role] = useState(localStorage.getItem("role"));

  // Add/Edit Student modal
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({
    studentId: "",
    name: "",
    email: "",
    phone: "",
    course: "",
    fees: "",
    address: "",
    class: "",
  });

  // Validation errors
  const [errors, setErrors] = useState({});

  // Search & filter
  const [searchTerm, setSearchTerm] = useState("");

  // Sorting
  const [sortBy, setSortBy] = useState("createdAt");
  const [order, setOrder] = useState("desc");

  // Pagination
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const studentsPerPage = 10;

  // Refs for focus restoration
  const addBtnRef = useRef(null);
  const editBtnRef = useRef(null);

  useEffect(() => {
    fetchStudents();
    fetchCourses();
  }, [page, searchTerm, sortBy, order]);

  async function fetchStudents() {
    try {
      setLoading(true);

      let query = `?page=${page}&limit=${studentsPerPage}&sortBy=${sortBy}&order=${order}`;
      if (searchTerm) query += `&search=${searchTerm}`;

      let res;
      if (role === "admin") {
        res = await API.get(`/students${query}`);
      } else if (role === "teacher") {
        res = await API.get(`/students?assigned=true${query}`);
      } else if (role === "student") {
        res = await API.get("/students/me");
        setStudents([res.data]);
        setTotalPages(1);
        return;
      }

      setStudents(res.data.students || []);
      setTotalPages(res.data.totalPages || 1);
    } catch (err) {
      console.error("Error fetching students:", err);
    } finally {
      setLoading(false);
    }
  }

  async function fetchCourses() {
    try {
      const res = await API.get("/courses");
      const data = Array.isArray(res.data) ? res.data : res.data.courses || [];
      setCourses(data);
    } catch (err) {
      console.error("Error fetching courses:", err);
      setCourses([]);
    }
  }

  function validateForm() {
    let newErrors = {};

    if (!form.studentId) {
      newErrors.studentId = "Student ID is required";
    } else if (!/^\d{3,6}$/.test(form.studentId)) {
      newErrors.studentId = "Student ID must be 3–6 digits";
    }

    if (!form.name) newErrors.name = "Name is required";
    if (!form.course) newErrors.course = "Course is required";
    if (!form.class) newErrors.class = "Class is required";

    if (!form.email) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(form.email)) {
      newErrors.email = "Invalid email format";
    }

    if (!form.phone) {
      newErrors.phone = "Phone Number is required";
    } else if (!/^\d{10}$/.test(form.phone)) {
      newErrors.phone = "Phone must be 10 digits";
    }

    if (form.address && form.address.length > 50) {
      newErrors.address = "Address cannot exceed 50 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  async function handleAddStudent() {
    if (!validateForm()) return;

    try {
      await API.post("/students", form);
      closeModal();
      fetchStudents();
    } catch (err) {
      if (
        err.response?.status === 400 &&
        (err.response.data.error?.includes("Student ID") ||
          err.response.data.error?.includes("Admission No"))
      ) {
        setErrors({ studentId: "Student ID must be unique" });
      }
      console.error("Error adding student:", err);
    }
  }

  async function handleUpdateStudent() {
    if (!validateForm()) return;

    try {
      await API.put(`/students/${editingId}`, form);
      closeModal();
      fetchStudents();
    } catch (err) {
      if (
        err.response?.status === 400 &&
        (err.response.data.error?.includes("Student ID") ||
          err.response.data.error?.includes("Admission No"))
      ) {
        setErrors({ studentId: "Student ID must be unique" });
      }
      console.error("Error updating student:", err);
    }
  }

  async function handleDelete(id) {
    try {
      await API.delete(`/students/${id}`);
      fetchStudents();
    } catch (err) {
      console.error("Error deleting student:", err);
    }
  }

  function openEditModal(student) {
    editBtnRef.current = document.activeElement;
    setForm({
      studentId: student.studentId || "",
      name: student.name,
      email: student.email,
      phone: student.phone,
      course: student.course?._id || "",
      fees: student.course?.fees || "",
      address: student.address || "",
      class: student.class || "",
    });
    setEditingId(student._id);
    setOpen(true);
  }

  function openAddModal() {
    setForm({
      studentId: "",
      name: "",
      email: "",
      phone: "",
      course: "",
      fees: "",
      address: "",
      class: "",
    });
    setEditingId(null);
    setOpen(true);
  }

  function closeModal() {
    setOpen(false);
    setEditingId(null);
    setForm({
      studentId: "",
      name: "",
      email: "",
      phone: "",
      course: "",
      fees: "",
      address: "",
      class: "",
    });
    setErrors({});
  }

  return (
    <Paper sx={{ p: 4, borderRadius: 3, bgcolor: "#fdfdfd", boxShadow: 3 }}>
      <Typography variant="h5" fontWeight="bold" sx={{ mb: 3, color: "#333" }}>
        👩‍🎓 Students
      </Typography>

      {/* Top bar */}
      <Grid container spacing={2} alignItems="center" sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={4}>
          <TextField
            label="Search by name"
            variant="outlined"
            size="small"
            fullWidth
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setPage(1);
            }}
            sx={{ bgcolor: "#fff" }}
          />
        </Grid>

        <Grid item xs={6} sm={3} md={2}>
          <FormControl size="small" fullWidth>
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
              <MenuItem value="email">Email</MenuItem>
            </Select>
          </FormControl>
        </Grid>

        <Grid item xs={6} sm={3} md={2}>
          <FormControl size="small" fullWidth>
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

        {role === "admin" && (
          <Grid item xs={12} sm={6} md={4} display="flex" justifyContent="flex-end">
            <Button
              variant="contained"
              color="primary"
              sx={{ minWidth: 180 }}
              onClick={openAddModal}
              ref={addBtnRef}
            >
              + Add New Student
            </Button>
          </Grid>
        )}
      </Grid>

      {/* Student Table */}
      {loading ? (
        <Typography>Loading...</Typography>
      ) : students.length > 0 ? (
        <TableContainer component={Paper} sx={{ mt: 2, borderRadius: 2, boxShadow: "none" }}>
          <Table>
            <TableHead sx={{ bgcolor: "#f0f2f5" }}>
              <TableRow>
                <TableCell>Student ID</TableCell>
                <TableCell>Name</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Phone</TableCell>
                <TableCell>Course</TableCell>
                <TableCell>Fees</TableCell>
                <TableCell>Class</TableCell>
                <TableCell>Created At</TableCell>
                {role === "admin" && <TableCell>Actions</TableCell>}
              </TableRow>
            </TableHead>
            <TableBody>
              {students.map((student) => (
                <TableRow key={student._id} sx={{ "&:hover": { bgcolor: "#f9fafb" } }}>
                  <TableCell>{student.studentId || "N/A"}</TableCell>
                  <TableCell>{student.name}</TableCell>
                  <TableCell>{student.email}</TableCell>
                  <TableCell>{student.phone}</TableCell>
                  <TableCell>{student.course?.name || "N/A"}</TableCell>
                  <TableCell>{student.course?.fees || 0}</TableCell>
                  <TableCell>{student.class || "N/A"}</TableCell>
                  <TableCell>{new Date(student.createdAt).toLocaleDateString()}</TableCell>
                  {role === "admin" && (
                    <TableCell>
                      <Button size="small" color="primary" onClick={() => openEditModal(student)} sx={{ mr: 1 }}>
                        Edit
                      </Button>
                      <Button size="small" color="error" onClick={() => handleDelete(student._id)}>
                        Delete
                      </Button>
                    </TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      ) : (
        <Typography variant="body1" sx={{ mt: 2 }}>
          No students found.
        </Typography>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <Grid container justifyContent="center" sx={{ mt: 3 }}>
          <Pagination
            count={totalPages}
            page={page}
            onChange={(e, value) => setPage(value)}
            color="primary"
            shape="rounded"
          />
        </Grid>
      )}

      {/* Add/Edit Student Modal */}
      <Dialog
        open={open}
        onClose={closeModal}
        fullWidth
        maxWidth="sm"
        TransitionProps={{
          onExited: () => {
            if (editingId && editBtnRef.current) {
              editBtnRef.current.focus();
              editBtnRef.current = null;
            } else if (addBtnRef.current) {
              addBtnRef.current.focus();
            }
          },
        }}
      >
        <DialogTitle>{editingId ? "Edit Student" : "Add New Student"}</DialogTitle>
        <DialogContent sx={{ pt: 1 }}>
          <TextField
            fullWidth
            required
            label="Student ID"
            margin="normal"
            value={form.studentId}
            onChange={(e) => setForm({ ...form, studentId: e.target.value })}
            error={!!errors.studentId}
            helperText={errors.studentId}
          />
          <TextField
            fullWidth
            required
            label="Name"
            margin="normal"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            error={!!errors.name}
            helperText={errors.name}
          />
          <TextField
            fullWidth
            required
            label="Email"
            margin="normal"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            error={!!errors.email}
            helperText={errors.email}
          />
          <TextField
            fullWidth
            required
            label="Phone Number"
            margin="normal"
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
            error={!!errors.phone}
            helperText={errors.phone}
          />
          <TextField
            fullWidth
            label="Address"
            margin="normal"
            value={form.address}
            onChange={(e) => setForm({ ...form, address: e.target.value })}
            error={!!errors.address}
            helperText={errors.address}
            inputProps={{ maxLength: 50 }}
          />
          <TextField
            select
            fullWidth
            required
            label="Course"
            margin="normal"
            value={form.course}
            onChange={(e) => {
              const selectedCourseId = e.target.value;
              const selectedCourse = courses.find((c) => c._id === selectedCourseId);
              setForm({ ...form, course: selectedCourseId, fees: selectedCourse?.fees || 0 });
            }}
            error={!!errors.course}
            helperText={errors.course}
          >
            {(Array.isArray(courses) ? courses : []).map((course) => (
              <MenuItem key={course._id} value={course._id}>
                {course.name}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            fullWidth
            label="Fees"
            margin="normal"
            value={form.fees}
            InputProps={{ readOnly: true }}
          />
          <TextField
            fullWidth
            required
            label="Class"
            margin="normal"
            value={form.class}
            onChange={(e) => setForm({ ...form, class: e.target.value })}
            error={!!errors.class}
            helperText={errors.class}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={closeModal}>Cancel</Button>
          <Button variant="contained" onClick={editingId ? handleUpdateStudent : handleAddStudent}>
            {editingId ? "Update" : "Save"}
          </Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
}

export default Students;
