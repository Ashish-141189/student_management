import React, { useState, useEffect } from "react";
import API from "../services/api";
import {
  Paper,
  Button,
  Box,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  Checkbox,
  InputAdornment,
  Paper as MuiPaper,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import VisibilityIcon from "@mui/icons-material/Visibility";
import { toast } from "react-toastify";

function Communication() {
  const [openParentModal, setOpenParentModal] = useState(false);
  const [openGroupModal, setOpenGroupModal] = useState(false);
  const [openCustomGroupModal, setOpenCustomGroupModal] = useState(false);

  const [emailForm, setEmailForm] = useState({ to: "", subject: "", message: "" });
  const [groupForm, setGroupForm] = useState({ classId: "", subject: "", message: "" });
  const [customGroupForm, setCustomGroupForm] = useState({ groupName: "", subject: "", message: "" });

  const [classes, setClasses] = useState([]);
  const [emails, setEmails] = useState([]);

  // Custom group states
  const [customSelectedClass, setCustomSelectedClass] = useState("");
  const [customStudents, setCustomStudents] = useState([]);
  const [selectedStudentIds, setSelectedStudentIds] = useState([]);
  const [studentSearch, setStudentSearch] = useState("");
  const [loadingStudents, setLoadingStudents] = useState(false);

  // New: View modal states
  const [openViewModal, setOpenViewModal] = useState(false);
  const [selectedEmail, setSelectedEmail] = useState(null);

  useEffect(() => {
    fetchEmails();
    fetchClasses();
  }, []);

  async function fetchEmails() {
    try {
      const res = await API.get("/communication/emails");
      setEmails(res.data || []);
    } catch (err) {
      console.error(err);
    }
  }

  async function fetchClasses() {
    try {
      const res = await API.get("/classes");
      setClasses(res.data || []);
    } catch (err) {
      console.error(err);
    }
  }

  async function sendEmail(e) {
    e.preventDefault();
    try {
      await API.post("/communication/email-parent", emailForm);
      toast.success("Parent email sent");
      setEmailForm({ to: "", subject: "", message: "" });
      setOpenParentModal(false);
      fetchEmails();
    } catch (err) {
      toast.error(err.response?.data?.error || "Error sending email");
    }
  }

  async function sendGroupEmail(e) {
    e.preventDefault();
    try {
      await API.post("/communication/email-students", groupForm);
      toast.success("Group email sent");
      setGroupForm({ classId: "", subject: "", message: "" });
      setOpenGroupModal(false);
      fetchEmails();
    } catch (err) {
      toast.error(err.response?.data?.error || "Error sending group email");
    }
  }

  // Fetch students for custom group when class changes
  useEffect(() => {
    async function fetchStudentsForClass() {
      if (!customSelectedClass) {
        setCustomStudents([]);
        setSelectedStudentIds([]);
        return;
      }
      setLoadingStudents(true);
      try {
        const res = await API.get(`/students?class=${customSelectedClass}`);
        const studentsData = Array.isArray(res.data) ? res.data : res.data.students || res.data;
        setCustomStudents(studentsData || []);
        setSelectedStudentIds([]);
      } catch (err) {
        console.error("Failed to fetch students:", err);
        toast.error("Failed to load students for selected class");
        setCustomStudents([]);
      } finally {
        setLoadingStudents(false);
      }
    }
    fetchStudentsForClass();
  }, [customSelectedClass]);

  const toggleStudentSelection = (studentId) => {
    setSelectedStudentIds((prev) =>
      prev.includes(studentId) ? prev.filter((id) => id !== studentId) : [...prev, studentId]
    );
  };

  async function sendCustomGroupEmail(e) {
    e.preventDefault();
    if (selectedStudentIds.length === 0) {
      toast.error("Please select at least one student to send email.");
      return;
    }
    const recipients = customStudents
      .filter((s) => selectedStudentIds.includes(String(s._id)))
      .map((s) => s.email)
      .filter(Boolean);

    if (recipients.length === 0) {
      toast.error("Selected students don't have valid emails.");
      return;
    }
    const payload = {
      groupName: customGroupForm.groupName,
      subject: customGroupForm.subject,
      message: customGroupForm.message,
      emails: recipients,
      classId: customSelectedClass,
    };
    try {
      await API.post("/communication/custom-email-group", payload);
      toast.success("Custom group email sent");
      setCustomGroupForm({ groupName: "", subject: "", message: "" });
      setCustomSelectedClass("");
      setCustomStudents([]);
      setSelectedStudentIds([]);
      setStudentSearch("");
      setOpenCustomGroupModal(false);
      fetchEmails();
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.error || "Error sending custom group email");
    }
  }

  const filteredCustomStudents = customStudents.filter((s) => {
    const q = studentSearch.trim().toLowerCase();
    if (!q) return true;
    return (
      (s.name || "").toLowerCase().includes(q) ||
      (s.email || "").toLowerCase().includes(q) ||
      (s.phone || "").toLowerCase().includes(q) ||
      (String(s.class) || "").toLowerCase().includes(q)
    );
  });

  // Helper: determine email type
  const getEmailType = (email) => {
    if (email.groupName) return "Custom Group";
    if (email.classId) return "Group";
    return "Individual";
  };

  return (
    <Paper sx={{ p: 3, borderRadius: 3, bgcolor: "#f9fafb" }}>
      <Typography variant="h5" gutterBottom>
        Communication
      </Typography>

      <Box sx={{ display: "flex", gap: 2, mb: 2, flexWrap: "wrap" }}>
        <Button variant="contained" onClick={() => setOpenParentModal(true)}>
          Send Parent Email
        </Button>
        <Button variant="contained" onClick={() => setOpenGroupModal(true)}>
          Send Group Email
        </Button>
        {/* <Button variant="contained" onClick={() => setOpenCustomGroupModal(true)}>
          Create Custom Group Email
        </Button> */}
      </Box>

      {/* ====== Parent Email Modal ====== */}
      <Dialog open={openParentModal} onClose={() => setOpenParentModal(false)} fullWidth maxWidth="sm" disableRestoreFocus>
        <DialogTitle>Send Parent Email</DialogTitle>
        <DialogContent>
          <Box component="form" sx={{ display: "grid", gap: 2, mt: 1 }}>
            <TextField
              label="Parent Email"
              type="email"
              required
              value={emailForm.to}
              onChange={(e) => setEmailForm({ ...emailForm, to: e.target.value })}
            />
            <TextField
              label="Subject"
              required
              value={emailForm.subject}
              onChange={(e) => setEmailForm({ ...emailForm, subject: e.target.value })}
            />
            <TextField
              label="Message"
              multiline
              rows={4}
              required
              value={emailForm.message}
              onChange={(e) => setEmailForm({ ...emailForm, message: e.target.value })}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenParentModal(false)}>Cancel</Button>
          <Button onClick={sendEmail} variant="contained">Send</Button>
        </DialogActions>
      </Dialog>

      {/* ====== Group Email Modal ====== */}
      <Dialog open={openGroupModal} onClose={() => setOpenGroupModal(false)} fullWidth maxWidth="sm" disableRestoreFocus>
        <DialogTitle>Send Group Email</DialogTitle>
        <DialogContent>
          <Box component="form" sx={{ display: "grid", gap: 2, mt: 1 }}>
            <FormControl fullWidth required>
              <InputLabel>Select Class</InputLabel>
              <Select
                value={groupForm.classId}
                label="Select Class"
                onChange={(e) => setGroupForm({ ...groupForm, classId: e.target.value })}
              >
                <MenuItem value="">-- Select Class --</MenuItem>
                {classes.map((cls) => (
                  <MenuItem key={cls} value={cls}>{cls}</MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField
              label="Subject"
              required
              value={groupForm.subject}
              onChange={(e) => setGroupForm({ ...groupForm, subject: e.target.value })}
            />
            <TextField
              label="Message"
              multiline
              rows={4}
              required
              value={groupForm.message}
              onChange={(e) => setGroupForm({ ...groupForm, message: e.target.value })}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenGroupModal(false)}>Cancel</Button>
          <Button onClick={sendGroupEmail} variant="contained">Send</Button>
        </DialogActions>
      </Dialog>

      {/* ====== Custom Group Email Modal ====== */}
      <Dialog open={openCustomGroupModal} onClose={() => setOpenCustomGroupModal(false)} fullWidth maxWidth="md" disableRestoreFocus>
        <DialogTitle>Create Custom Group Email</DialogTitle>
        <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          <TextField
            label="Group Name (optional)"
            value={customGroupForm.groupName}
            onChange={(e) => setCustomGroupForm({ ...customGroupForm, groupName: e.target.value })}
            fullWidth
          />
          <FormControl fullWidth>
            <InputLabel>Select Class</InputLabel>
            <Select
              value={customSelectedClass}
              label="Select Class"
              onChange={(e) => setCustomSelectedClass(e.target.value)}
            >
              <MenuItem value="">-- Select Class --</MenuItem>
              {classes.map((cls) => (
                <MenuItem key={cls} value={cls}>{cls}</MenuItem>
              ))}
            </Select>
          </FormControl>

          {customSelectedClass && (
            <>
              <TextField
                placeholder="Search students..."
                value={studentSearch}
                onChange={(e) => setStudentSearch(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                }}
                fullWidth
              />
              <TableContainer component={MuiPaper} sx={{ maxHeight: 300, overflow: "auto" }}>
                <Table stickyHeader size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell padding="checkbox">
                        <Checkbox
                          indeterminate={
                            selectedStudentIds.length > 0 &&
                            selectedStudentIds.length < customStudents.length
                          }
                          checked={
                            customStudents.length > 0 &&
                            selectedStudentIds.length === customStudents.length
                          }
                          onChange={(e) =>
                            setSelectedStudentIds(
                              e.target.checked ? customStudents.map((s) => String(s._id)) : []
                            )
                          }
                        />
                      </TableCell>
                      <TableCell>Name</TableCell>
                      <TableCell>Class</TableCell>
                      <TableCell>Email</TableCell>
                      <TableCell>Phone</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {loadingStudents ? (
                      <TableRow><TableCell colSpan={5} align="center">Loading...</TableCell></TableRow>
                    ) : filteredCustomStudents.length > 0 ? (
                      filteredCustomStudents.map((s) => (
                        <TableRow key={s._id} hover>
                          <TableCell padding="checkbox">
                            <Checkbox
                              checked={selectedStudentIds.includes(String(s._id))}
                              onChange={() => toggleStudentSelection(String(s._id))}
                            />
                          </TableCell>
                          <TableCell>{s.name || "—"}</TableCell>
                          <TableCell>{s.class || s.className || "—"}</TableCell>
                          <TableCell>{s.email || "—"}</TableCell>
                          <TableCell>{s.phone || "—"}</TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow><TableCell colSpan={5} align="center">No students found</TableCell></TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </>
          )}

          <TextField
            label="Subject"
            required
            value={customGroupForm.subject}
            onChange={(e) => setCustomGroupForm({ ...customGroupForm, subject: e.target.value })}
            fullWidth
          />
          <TextField
            label="Message"
            multiline
            rows={5}
            required
            value={customGroupForm.message}
            onChange={(e) => setCustomGroupForm({ ...customGroupForm, message: e.target.value })}
            fullWidth
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenCustomGroupModal(false)}>Cancel</Button>
          <Button
            onClick={sendCustomGroupEmail}
            variant="contained"
            disabled={selectedStudentIds.length === 0 || !customGroupForm.subject || !customGroupForm.message}
          >
            Send to Selected
          </Button>
        </DialogActions>
      </Dialog>

      {/* ====== Sent Emails Table ====== */}
      <TableContainer component={MuiPaper} sx={{ mt: 3, borderRadius: 2 }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>To</TableCell>
              <TableCell>Subject</TableCell>
              <TableCell>Message</TableCell>
              <TableCell>Email Type</TableCell>
              <TableCell>Sent At</TableCell>
              <TableCell>Action</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {emails.map((email, idx) => (
              <TableRow key={idx}>
                <TableCell>
                  {Array.isArray(email.to)
                    ? email.to.slice(0, 2).join(", ") + (email.to.length > 2 ? "..." : "")
                    : email.to}
                </TableCell>
                <TableCell>{email.subject}</TableCell>
                <TableCell>{(email.message || "").slice(0, 30)}...</TableCell>
                <TableCell>{getEmailType(email)}</TableCell>
                <TableCell>{new Date(email.createdAt).toLocaleString()}</TableCell>
                <TableCell>
                  <Button
                    size="small"
                    variant="outlined"
                    startIcon={<VisibilityIcon />}
                    onClick={() => {
                      setSelectedEmail(email);
                      setOpenViewModal(true);
                    }}
                  >
                    View
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* ====== View Email Modal ====== */}
      <Dialog open={openViewModal} onClose={() => setOpenViewModal(false)} fullWidth maxWidth="sm" disableRestoreFocus>
        <DialogTitle>Email Details</DialogTitle>
        <DialogContent dividers>
          {selectedEmail && (
            <Box sx={{ display: "grid", gap: 1 }}>
              <Typography><strong>Type:</strong> {getEmailType(selectedEmail)}</Typography>
              <Typography><strong>To:</strong> {Array.isArray(selectedEmail.to) ? selectedEmail.to.join(", ") : selectedEmail.to}</Typography>
              {selectedEmail.groupName && <Typography><strong>Group Name:</strong> {selectedEmail.groupName}</Typography>}
              <Typography><strong>Subject:</strong> {selectedEmail.subject}</Typography>
              <Typography sx={{ whiteSpace: "pre-line" }}>
                <strong>Message:</strong> {selectedEmail.message}
              </Typography>
              <Typography><strong>Sent At:</strong> {new Date(selectedEmail.createdAt).toLocaleString()}</Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenViewModal(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
}

export default Communication;
