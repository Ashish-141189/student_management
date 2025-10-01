// src/pages/Dashboard.jsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  CircularProgress,
  Box,
} from "@mui/material";
import {
  School,
  Person,
  MonetizationOn,
  Book,
  Email,
  BarChart,
  Message,
  Group,
} from "@mui/icons-material";

function Dashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState({});
  const [role, setRole] = useState(localStorage.getItem("role"));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token || !role) {
      navigate("/login");
      return;
    }
    fetchStats();
  }, [role]);

  async function fetchStats() {
    setLoading(true);
    try {
      if (role === "admin") {
        const [studentsRes, teachersRes, coursesRes, financeRes] =
          await Promise.all([
            API.get("/students"),
            API.get("/teachers"),
            API.get("/courses"),
            API.get("/finance/transactions"),
          ]);

        const transactionsSum = financeRes.data?.reduce(
          (sum, txn) => sum + (txn.feeAmount || 0),
          0
        );

        setStats({
          students: studentsRes.data?.total || 0,
          teachers: teachersRes.data?.total || 0,
          courses: coursesRes.data?.total || 0,
          transactions: transactionsSum || 0,
        });
      } else if (role === "teacher") {
        const [studentsRes, coursesRes] = await Promise.all([
          API.get("/students"),
          API.get("/courses"),
        ]);
        setStats({
          students: studentsRes.data?.total || 0,
          courses: coursesRes.data?.total || 0,
        });
      } else if (role === "student") {
        const [progressRes, messagesRes] = await Promise.all([
          API.get("/students/progress/me"),
          API.get("/communication/my-emails"),
        ]);
        setStats({
          progress: progressRes.data || {},
          messages: messagesRes.data?.length || 0,
        });
      }
    } catch (err) {
      console.error("Error fetching stats", err);
    } finally {
      setLoading(false);
    }
  }

  function getCards() {
    if (role === "admin") {
      return [
        {
          title: "Students",
          value: stats.students,
          description: "Manage all student records",
          route: "/students",
          icon: <School sx={{ fontSize: 40, color: "#fff" }} />,
          color: "linear-gradient(135deg, #42a5f5, #478ed1)",
        },
        {
          title: "Teachers",
          value: stats.teachers,
          description: "Manage all teachers",
          route: "/teachers",
          icon: <Person sx={{ fontSize: 40, color: "#fff" }} />,
          color: "linear-gradient(135deg, #ab47bc, #8e24aa)",
        },
        {
          title: "Finance",
          value: `₹${stats.transactions || 0}`,
          description: "Track fee collection",
          route: "/finance",
          icon: <MonetizationOn sx={{ fontSize: 40, color: "#fff" }} />,
          color: "linear-gradient(135deg, #66bb6a, #43a047)",
        },
        {
          title: "Courses",
          value: stats.courses,
          description: "Manage all courses",
          route: "/courses",
          icon: <Book sx={{ fontSize: 40, color: "#fff" }} />,
          color: "linear-gradient(135deg, #ffa726, #fb8c00)",
        },
        {
          title: "Communication",
          value: "-",
          description: "Send updates to students/parents",
          route: "/communication",
          icon: <Email sx={{ fontSize: 40, color: "#fff" }} />,
          color: "linear-gradient(135deg, #ef5350, #e53935)",
        },
      ];
    }

    if (role === "teacher") {
      return [
        {
          title: "My Students",
          value: stats.students,
          description: "View your class students",
          route: "/students",
          icon: <Group sx={{ fontSize: 40, color: "#fff" }} />,
          color: "linear-gradient(135deg, #42a5f5, #1976d2)",
        },
        {
          title: "My Courses",
          value: stats.courses,
          description: "Subjects you are teaching",
          route: "/courses",
          icon: <Book sx={{ fontSize: 40, color: "#fff" }} />,
          color: "linear-gradient(135deg, #7e57c2, #5e35b1)",
        },
        {
          title: "Parent Communication",
          value: "-",
          description: "Send emails to parents",
          route: "/communication",
          icon: <Email sx={{ fontSize: 40, color: "#fff" }} />,
          color: "linear-gradient(135deg, #ef5350, #d32f2f)",
        },
      ];
    }

    if (role === "student") {
      return [
        {
          title: "My Progress",
          value: stats.progress?.grade || "N/A",
          description: "Your academic performance",
          route: "/progress",
          icon: <BarChart sx={{ fontSize: 40, color: "#fff" }} />,
          color: "linear-gradient(135deg, #42a5f5, #1e88e5)",
        },
        {
          title: "Messages",
          value: stats.messages,
          description: "Emails from school/teachers",
          route: "/communication",
          icon: <Message sx={{ fontSize: 40, color: "#fff" }} />,
          color: "linear-gradient(135deg, #ab47bc, #8e24aa)",
        },
        {
          title: "Contact School",
          value: "-",
          description: "Send message to school",
          route: "/communication",
          icon: <Email sx={{ fontSize: 40, color: "#fff" }} />,
          color: "linear-gradient(135deg, #ef5350, #e53935)",
        },
      ];
    }

    return [];
  }

  if (loading) {
    return (
      <Box sx={{ padding: "1.5rem", textAlign: "center" }}>
        <CircularProgress />
        <Typography variant="h6" sx={{ marginTop: "0.5rem" }}>
          Loading Dashboard...
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ padding: "1.5rem" }}>
      <Typography variant="h5" gutterBottom fontWeight="600">
        📊 Dashboard ({role})
      </Typography>
      <Grid container spacing={2}>
        {getCards().map((card) => (
          <Grid item xs={12} sm={6} md={4} key={card.title}>
            <Card
              sx={{
                borderRadius: "16px",
                boxShadow: "none",
                border: "none",
                background: card.color,
                color: "#fff",
                p: 2,
                transition: "all 0.3s ease",
                "&:hover": {
                  transform: "scale(1.02)",
                },
                cursor: "pointer",
              }}
              onClick={() => navigate(card.route)}
            >
              <CardContent sx={{ textAlign: "center", p: "12px !important" }}>
                <Box
                  sx={{
                    width: 60,
                    height: 60,
                    mx: "auto",
                    mb: 1,
                    borderRadius: "50%",
                    background: "rgba(255,255,255,0.2)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  {card.icon}
                </Box>
                <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                  {card.title}
                </Typography>
                <Typography
                  variant="h5"
                  sx={{ margin: "6px 0", fontWeight: "bold" }}
                >
                  {card.value}
                </Typography>
                <Typography sx={{ fontSize: "0.85rem", opacity: 0.9 }}>
                  {card.description}
                </Typography>
                <Button
                  variant="contained"
                  size="small"
                  sx={{
                    mt: 1,
                    borderRadius: "6px",
                    background: "rgba(255,255,255,0.2)",
                    color: "#fff",
                    "&:hover": { background: "rgba(255,255,255,0.3)" },
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(card.route);
                  }}
                >
                  Go
                </Button>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}

export default Dashboard;
