


"use client"

import { useState, useEffect } from "react"
import { ThemeProvider, createTheme } from "@mui/material/styles"
import CssBaseline from "@mui/material/CssBaseline"
import Container from "@mui/material/Container"
import Typography from "@mui/material/Typography"
import Box from "@mui/material/Box"
import Paper from "@mui/material/Paper"
import Button from "@mui/material/Button"
import Alert from "@mui/material/Alert"
import IconButton from "@mui/material/IconButton"
import CloseIcon from "@mui/icons-material/Close"
import EditIcon from "@mui/icons-material/Edit"
import DeleteIcon from "@mui/icons-material/Delete"
import EmailIcon from "@mui/icons-material/Email"
import CircularProgress from "@mui/material/CircularProgress"

import EmailConfigForm from "../components/EmailConfigForm"
import type { EmailConfig, StatusMessage } from "../types"

const theme = createTheme()

export default function Home() {
  const [configs, setConfigs] = useState<EmailConfig[]>([])
  const [status, setStatus] = useState<StatusMessage | null>(null)
  const [loading, setLoading] = useState(false)
  const [editingConfig, setEditingConfig] = useState<EmailConfig | null>(null)

  useEffect(() => {
    fetchConfigs()
  }, [])

  const fetchConfigs = async () => {
    try {
      const response = await fetch("/api/config")
      if (!response.ok) throw new Error("Failed to fetch configurations")
      const data = await response.json()
      setConfigs(data)
    } catch (error) {
      console.error("Error fetching configs:", error)
      setStatus({
        type: "error",
        message: "Failed to fetch configurations",
      })
    }
  }

  const handleSubmit = async (config: EmailConfig) => {
    setLoading(true)
    try {
      const method = config.id ? "PUT" : "POST"
      const url = config.id ? `/api/config/${config.id}` : "/api/config"

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(config),
      })

      if (!response.ok) throw new Error("Failed to save configuration")

      setStatus({
        type: "success",
        message: `Configuration ${config.id ? "updated" : "added"} successfully`,
      })

      await fetchConfigs()
      setEditingConfig(null)
    } catch (error) {
      console.error("Error saving config:", error)
      setStatus({
        type: "error",
        message: "Failed to save configuration",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this configuration?")) return

    try {
      const response = await fetch(`/api/config/${id}`, {
        method: "DELETE",
      })

      if (!response.ok) throw new Error("Failed to delete configuration")

      setStatus({
        type: "success",
        message: "Configuration deleted successfully",
      })

      await fetchConfigs()
    } catch (error) {
      console.error("Error deleting config:", error)
      setStatus({
        type: "error",
        message: "Failed to delete configuration",
      })
    }
  }

  // pages/index.tsx
  const handleCheckEmails = async (configId: number) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/fetch-pdfs?configId=${configId}`);
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to fetch PDFs');
      }
      
      const data = await response.json();
      setStatus({
        type: 'success',
        message: `Found ${data.length} new PDF(s)`,
      });
    } catch (error) {
      console.error('Error checking emails:', error);
      setStatus({
        type: 'error',
        message: error instanceof Error ? error.message : 'Failed to check emails',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Container maxWidth="lg">
        <Box sx={{ my: 4 }}>
          <Typography variant="h3" component="h1" gutterBottom>
            Email PDF Manager
          </Typography>

          {status && (
            <Alert
              severity={status.type}
              action={
                <IconButton aria-label="close" color="inherit" size="small" onClick={() => setStatus(null)}>
                  <CloseIcon fontSize="inherit" />
                </IconButton>
              }
              sx={{ mb: 2 }}
            >
              {status.message}
            </Alert>
          )}

          <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
            <Typography variant="h5" component="h2" gutterBottom>
              {editingConfig ? "Edit Configuration" : "Add New Configuration"}
            </Typography>
            <EmailConfigForm onSubmit={handleSubmit} initialData={editingConfig || undefined} />
          </Paper>

          <Paper elevation={3} sx={{ p: 3 }}>
            <Typography variant="h5" component="h2" gutterBottom>
              Existing Configurations
            </Typography>
            <Box sx={{ mt: 2 }}>
              {configs.map((config) => (
                <Paper key={config.id} elevation={1} sx={{ p: 2, mb: 2 }}>
                  <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Box>
                      <Typography variant="h6">{config.name}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        {config.username} ({config.type})
                      </Typography>
                    </Box>
                    <Box>
                      <IconButton onClick={() => setEditingConfig(config)} color="primary">
                        <EditIcon />
                      </IconButton>
                      <IconButton onClick={() => handleDelete(config.id!)} color="error">
                        <DeleteIcon />
                      </IconButton>
                      <Button
                        variant="contained"
                        color="primary"
                        startIcon={loading ? <CircularProgress size={20} /> : <EmailIcon />}
                        onClick={() => handleCheckEmails(config.id!)}
                        disabled={loading}
                      >
                        {loading ? "Checking..." : "Check Emails"}
                      </Button>
                    </Box>
                  </Box>
                </Paper>
              ))}
              {configs.length === 0 && (
                <Typography variant="body1" color="text.secondary" align="center" sx={{ py: 2 }}>
                  No configurations yet. Add one above.
                </Typography>
              )}
            </Box>
          </Paper>
        </Box>
      </Container>
    </ThemeProvider>
  )
}

