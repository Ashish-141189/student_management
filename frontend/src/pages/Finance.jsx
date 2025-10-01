// src/pages/Finance.jsx
import React, { useState, useEffect, useRef } from "react";
import API from "../services/api";
import {
  Paper,
  Typography,
  Box,
  Button,
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
  TextField,
  MenuItem,
} from "@mui/material";
import { toast } from "react-toastify";

function Finance() {
  const [transactions, setTransactions] = useState([]);
  const [form, setForm] = useState({
    // NOTE: `studentId` here is the user-visible numeric ID (e.g. 245).
    // `studentMongoId` will hold the actual MongoDB _id for backend operations.
    studentId: "",
    studentMongoId: "",

    studentName: "",
    class: "",
    month: "",
    year: "",
    feeAmount: "",
    paymentMode: "",
  });
  const [editingId, setEditingId] = useState(null);
  const [open, setOpen] = useState(false);
  const role = localStorage.getItem("role");

  const addBtnRef = useRef(null); // Ref for Add Transaction button
  const editBtnRef = useRef(null); // Ref for last clicked Edit button

  // 🔹 Year dropdown lazy loading
  const YEAR_CHUNK = 50;
  const allYears = Array.from({ length: 2999 - 2000 + 1 }, (_, i) => 2000 + i);
  const [displayedYearsCount, setDisplayedYearsCount] = useState(YEAR_CHUNK);

  useEffect(() => {
    fetchTransactions();
  }, []);

  async function fetchTransactions() {
    try {
      const res = await API.get("/finance/transactions");
      setTransactions(res.data);
    } catch {
      toast.error("Error fetching transactions");
    }
  }

  const handleOpen = () => setOpen(true);
  const handleClose = () => {
    // close dialog and reset form. DO NOT restore focus here (that caused the aria-hidden warning).
    setOpen(false);
    setEditingId(null);
    setForm({
      studentId: "",
      studentMongoId: "",
      studentName: "",
      class: "",
      month: "",
      year: "",
      feeAmount: "",
      paymentMode: "",
    });
    // focus restore will be handled in TransitionProps.onExited to avoid aria-hidden focus issues
  };

  async function handleSubmit(e) {
    e.preventDefault();
    if (!["admin", "teacher"].includes(role)) {
      toast.error("Insufficient permissions");
      return;
    }
    try {
      if (editingId) {
        // For edit: send the fields as-is (if you want to send studentMongoId here, ensure backend expects it)
        await API.put(`/finance/transactions/${editingId}`, {
          ...form,
          // send the Mongo id to backend as studentId (if available)
          studentId: form.studentMongoId || form.studentId,
        });
        toast.success("Transaction updated");
      } else {
        // For new transaction: send Mongo _id as `studentId` (backend expects ObjectId ref),
        // also include the numeric display id (so UI can show it easily)
        await API.post("/finance/transactions", {
          ...form,
          studentId: form.studentMongoId || form.studentId,
          displayId: form.studentId, // numeric student id for display
        });
        toast.success("Transaction added");
      }
      handleClose();
      fetchTransactions();
    } catch (err) {
      toast.error(
        err.response?.data?.errors?.[0]?.msg ||
          err.response?.data?.error ||
          "Error saving transaction"
      );
    }
  }

  function startEdit(t) {
    if (!["admin", "teacher"].includes(role)) {
      toast.error("Insufficient permissions");
      return;
    }
    editBtnRef.current = document.activeElement; // store focused edit button

    // t.studentId may be:
    // - an Object (populated Student doc) => use .studentId (numeric) and ._id (mongo)
    // - a string (Mongo _id) => use it as mongo id (no numeric display available)
    let displayStudentId = "";
    let mongoId = "";

    if (t.displayId) {
      displayStudentId = t.displayId;
    } else if (t.studentId && typeof t.studentId === "object") {
      displayStudentId = t.studentId.studentId || "";
      mongoId = t.studentId._id || "";
    } else if (t.studentId && typeof t.studentId === "string") {
      // older records may have only the mongo _id stored
      mongoId = t.studentId;
      displayStudentId = t.displayId || ""; // may be empty
    }

    setEditingId(t._id);
    setForm({
      studentId: displayStudentId || "",
      studentMongoId: mongoId || t.studentMongoId || "",
      studentName: t.studentName || "",
      class: t.class || "",
      month: t.month || "",
      year: t.year || "",
      feeAmount: t.feeAmount || "",
      paymentMode: t.paymentMode || "",
    });
    setOpen(true);
  }

  async function handleDelete(id) {
    if (role !== "admin") {
      toast.error("Only admins can delete");
      return;
    }
    if (!window.confirm("Delete this transaction?")) return;
    try {
      await API.delete(`/finance/transactions/${id}`);
      fetchTransactions();
      toast.success("Transaction deleted");
    } catch {
      toast.error("Error deleting transaction");
    }
  }

  // 🔹 Fetch student details after 3 digits
  async function fetchStudentDetails() {
    if (!form.studentId || String(form.studentId).length < 3) return;

    try {
      // Backend route should accept numeric student id or mongo id, e.g. /students/fetch/:id
      const res = await API.get(`/students/fetch/${form.studentId}`);
      if (res.data) {
        // Backend may return { name, class, fees, studentId, _id, admissionNo, ... }
        const returned = res.data;
        const displayId =
          returned.studentId || returned.admissionNo || form.studentId;
        const mongoId = returned._id || returned.studentMongoId || "";

        setForm((prev) => ({
          ...prev,
          studentName: returned.name || "",
          class: returned.class || returned.section || "",
          feeAmount: returned.fees || returned.fee || "",
          // keep the typed/display id visible to user
          studentId: displayId,
          // store the mongo id separately for backend
          studentMongoId: mongoId,
        }));
      }
    } catch (err) {
      toast.error("Student not found");
    }
  }

  // Helper to show student id in table (avoid rendering objects)
  function renderStudentIdCell(t) {
    if (t.displayId) return String(t.displayId);
    if (t.studentId && typeof t.studentId === "object") {
      return (
        t.studentId.studentId ??
        t.studentId.admissionNo ??
        t.studentId._id ??
        ""
      ).toString();
    }
    return t.studentId ? String(t.studentId) : "";
  }
  return (
    <Paper
      sx={{
        p: 3,
        borderRadius: 3,
        bgcolor: "#f9fafb",
      }}
    >
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 2,
        }}
      >
        <Typography variant="h5">Finance - Fee Collection</Typography>
        <Button
          variant="contained"
          onClick={handleOpen}
          disabled={!["admin", "teacher"].includes(role)}
          ref={addBtnRef}
        >
          Add Transaction
        </Button>
      </Box>

      {/* Transaction Table */}
      <TableContainer
        component={Paper}
        sx={{ mt: 3, borderRadius: 2, boxShadow: "none" }}
      >
        <Table>
          <TableHead sx={{ bgcolor: "#f0f2f5" }}>
            <TableRow>
              <TableCell>Student ID</TableCell>
              <TableCell>Student Name</TableCell>
              <TableCell>Class</TableCell>
              <TableCell>Month</TableCell>
              <TableCell>Year</TableCell>
              <TableCell>Fee Amount</TableCell>
              <TableCell>Payment Mode</TableCell>
              <TableCell>Date</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {transactions.map((t) => (
              <TableRow key={t._id}>
                <TableCell>{renderStudentIdCell(t)}</TableCell>
                <TableCell>{t.studentName}</TableCell>
                <TableCell>{t.class}</TableCell>
                <TableCell>{t.month}</TableCell>
                <TableCell>{t.year}</TableCell>
                <TableCell>{t.feeAmount}</TableCell>
                <TableCell>{t.paymentMode}</TableCell>
                <TableCell>
                  {t.createdAt
                    ? new Date(t.createdAt).toLocaleDateString()
                    : "-"}
                </TableCell>
                <TableCell align="right">
                  <Button
                    size="small"
                    onClick={() => startEdit(t)}
                    disabled={!["admin", "teacher"].includes(role)}
                  >
                    Edit
                  </Button>
                  <Button
                    size="small"
                    color="error"
                    onClick={() => handleDelete(t._id)}
                    disabled={role !== "admin"}
                  >
                    Delete
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Modal for Add/Edit */}
      <Dialog
        open={open}
        onClose={handleClose}
        fullWidth
        maxWidth="sm"
        TransitionProps={{
          onExited: () => {
            // Restore focus safely after dialog fully closes
            if (editBtnRef.current) {
              editBtnRef.current.focus();
              editBtnRef.current = null;
            } else if (addBtnRef.current) {
              addBtnRef.current.focus();
            }
          },
        }}
      >
        <DialogTitle>
          {editingId ? "Edit Transaction" : "Add Transaction"}
        </DialogTitle>
        <DialogContent>
          <Box
            component="form"
            sx={{ display: "grid", gap: 2, mt: 1 }}
            onSubmit={handleSubmit}
          >
            <TextField
              label="Student ID"
              required
              value={form.studentId}
              onChange={(e) => setForm({ ...form, studentId: e.target.value })}
              onBlur={fetchStudentDetails}
              onKeyDown={(e) => {
                if (e.key === "Enter" && e.target.tagName !== "TEXTAREA") {
                  e.preventDefault(); // stop premature form submit
                }
              }}
            />
            <TextField
              label="Student Name"
              required
              value={form.studentName}
              InputProps={{ readOnly: true }}
            />
            <TextField
              label="Class"
              required
              value={form.class}
              InputProps={{ readOnly: true }}
            />

            <TextField
              select
              label="Month"
              required
              value={form.month}
              onChange={(e) => setForm({ ...form, month: e.target.value })}
            >
              <MenuItem value="">
                <em>Select Month</em>
              </MenuItem>
              {[
                "January",
                "February",
                "March",
                "April",
                "May",
                "June",
                "July",
                "August",
                "September",
                "October",
                "November",
                "December",
              ].map((m) => (
                <MenuItem key={m} value={m}>
                  {m}
                </MenuItem>
              ))}
            </TextField>

            {/* 🔹 Year Dropdown with Lazy Loading */}
            <TextField
              select
              label="Year"
              required
              value={form.year}
              onChange={(e) => setForm({ ...form, year: e.target.value })}
              SelectProps={{
                MenuProps: {
                  PaperProps: {
                    style: { maxHeight: 300 },
                    onScroll: (e) => {
                      const el = e.currentTarget;
                      if (
                        el.scrollTop + el.clientHeight >=
                        el.scrollHeight - 8
                      ) {
                        setDisplayedYearsCount((prev) =>
                          Math.min(prev + YEAR_CHUNK, allYears.length)
                        );
                      }
                    },
                  },
                },
              }}
            >
              <MenuItem value="">
                <em>Select Year</em>
              </MenuItem>
              {allYears.slice(0, displayedYearsCount).map((y) => (
                <MenuItem key={y} value={y}>
                  {y}
                </MenuItem>
              ))}
              {form.year &&
                !allYears
                  .slice(0, displayedYearsCount)
                  .includes(Number(form.year)) && (
                  <MenuItem key={form.year} value={form.year}>
                    {form.year}
                  </MenuItem>
                )}
            </TextField>

            <TextField
              label="Fee Amount"
              type="number"
              required
              value={form.feeAmount}
              InputProps={{ readOnly: true }}
            />

            <TextField
              select
              label="Payment Mode"
              required
              value={form.paymentMode}
              onChange={(e) =>
                setForm({ ...form, paymentMode: e.target.value })
              }
            >
              <MenuItem value="">
                <em>Payment Type</em>
              </MenuItem>
              <MenuItem value="Cash">Cash</MenuItem>
              <MenuItem value="Card">Card</MenuItem>
              <MenuItem value="Online">Online</MenuItem>
            </TextField>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            disabled={!["admin", "teacher"].includes(role)}
          >
            {editingId ? "Update" : "Add"}
          </Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
}

export default Finance;
