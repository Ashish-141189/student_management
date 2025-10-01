// src/pages/StudentDetails.jsx
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Typography,
  TextField,
  Button,
  Card,
  CardContent,
} from "@mui/material";
import API from "../services/api";

function StudentDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const role = localStorage.getItem("role");

  useEffect(() => {
    fetchStudent();
  }, [id]);

  async function fetchStudent() {
    try {
      setLoading(true);
      const res = await API.get(`/students/${id}`);
      setStudent(res.data);
    } catch (err) {
      console.error("Error fetching student:", err);
    } finally {
      setLoading(false);
    }
  }

  async function handleSave() {
    try {
      await API.put(`/students/${id}`, student);
      navigate("/students");
    } catch (err) {
      console.error("Error updating student:", err);
    }
  }

  if (loading) return <Typography>Loading...</Typography>;
  if (!student) return <Typography>No student found</Typography>;

  return (
    <div style={{ padding: "2rem" }}>
      <Typography variant="h4" gutterBottom>
        ✏️ Edit Student
      </Typography>

      <Card>
        <CardContent>
          <TextField
            fullWidth
            margin="normal"
            label="Name"
            value={student.name || ""}
            onChange={(e) => setStudent({ ...student, name: e.target.value })}
            disabled={role !== "admin"}
          />
          <TextField
            fullWidth
            margin="normal"
            label="Email"
            value={student.email || ""}
            onChange={(e) => setStudent({ ...student, email: e.target.value })}
            disabled={role !== "admin"}
          />
          <TextField
            fullWidth
            margin="normal"
            label="Grade"
            value={student.grade || ""}
            onChange={(e) => setStudent({ ...student, grade: e.target.value })}
            disabled={role !== "admin" && role !== "teacher"}
          />

          <div style={{ marginTop: "1rem" }}>
            <Button onClick={() => navigate("/students")}>Cancel</Button>
            {role === "admin" && (
              <Button
                variant="contained"
                color="primary"
                onClick={handleSave}
                style={{ marginLeft: "1rem" }}
              >
                Save
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default StudentDetails;
