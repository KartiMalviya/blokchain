import React from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  Container,
  Paper,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Chip,
  Avatar,
} from '@mui/material';
import {
  School as SchoolIcon,
  Verified as VerifiedIcon,
  Security as SecurityIcon,
  Storage as StorageIcon,
  AccountTree as BlockchainIcon,   // ✅ replaced Blockchain with AccountTree
  CheckCircle as CheckCircleIcon,
  Launch as LaunchIcon,
} from '@mui/icons-material';
import { Link } from 'react-router-dom';
import { useWallet } from '../contexts/WalletContext';

const Home = () => {
  const { account, isAuthorized } = useWallet();

  const features = [
    {
      icon: <BlockchainIcon sx={{ fontSize: 40, color: '#1976d2' }} />,
      title: 'Blockchain-Based',
      description: 'Immutable and tamper-proof credential storage on Ethereum/Polygon blockchain',
    },
    {
      icon: <SecurityIcon sx={{ fontSize: 40, color: '#1976d2' }} />,
      title: 'Secure & Private',
      description: 'Only hashed data on-chain, detailed documents stored securely on IPFS',
    },
    {
      icon: <VerifiedIcon sx={{ fontSize: 40, color: '#1976d2' }} />,
      title: 'Instant Verification',
      description: 'Real-time credential verification with cryptographic proof',
    },
    {
      icon: <StorageIcon sx={{ fontSize: 40, color: '#1976d2' }} />,
      title: 'IPFS Integration',
      description: 'Decentralized storage for transcripts and detailed documents',
    },
  ];

  const benefits = [
    'Eliminates credential fraud and forgery',
    'Reduces verification time from days to seconds',
    'Lowers administrative costs for institutions',
    'Provides permanent, immutable records',
    'Enables global accessibility and verification',
    'Maintains student privacy and data control',
  ];

  const howItWorks = [
    {
      step: 1,
      title: 'University Issues Credential',
      description: 'Authorized universities issue credentials on-chain with student details and IPFS hash for additional documents.',
    },
    {
      step: 2,
      title: 'Credential Stored on Blockchain',
      description: 'Credential data is hashed and stored immutably on the blockchain with timestamp and university signature.',
    },
    {
      step: 3,
      title: 'Verification Process',
      description: 'Employers or institutions can instantly verify credentials using student ID or credential hash.',
    },
    {
      step: 4,
      title: 'Access Detailed Documents',
      description: 'Additional documents like transcripts are stored on IPFS and accessible via the credential hash.',
    },
  ];

  return (
    <Box sx={{ py: 4 }}>
      {/* Hero Section */}
      <Paper
        elevation={0}
        sx={{
          background: 'linear-gradient(135deg, #1976d2 0%, #1565c0 100%)',
          color: 'white',
          py: 8,
          mb: 6,
          borderRadius: 3,
        }}
      >
        <Container maxWidth="lg">
          <Grid container spacing={4} alignItems="center">
            <Grid item xs={12} md={6}>
              <Typography variant="h3" component="h1" gutterBottom sx={{ fontWeight: 700 }}>
                Academic Credentials Verification
              </Typography>
              <Typography variant="h6" sx={{ mb: 3, opacity: 0.9 }}>
                Secure, transparent, and instant verification of academic credentials using blockchain technology
              </Typography>
              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                <Button
                  component={Link}
                  to="/issue"
                  variant="contained"
                  color="secondary"
                  size="large"
                  startIcon={<SchoolIcon />}
                  sx={{ textTransform: 'none', fontWeight: 600 }}
                >
                  Issue Credentials
                </Button>
                <Button
                  component={Link}
                  to="/verify"
                  variant="outlined"
                  color="inherit"
                  size="large"
                  startIcon={<VerifiedIcon />}
                  sx={{ textTransform: 'none', fontWeight: 600 }}
                >
                  Verify Credentials
                </Button>
              </Box>
            </Grid>
            <Grid item xs={12} md={6}>
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  height: 300,
                }}
              >
                <Avatar
                  sx={{
                    width: 200,
                    height: 200,
                    bgcolor: 'rgba(255, 255, 255, 0.2)',
                    fontSize: 80,
                  }}
                >
                  <SchoolIcon sx={{ fontSize: 80 }} />
                </Avatar>
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Paper>

      {/* Features Section */}
      <Container maxWidth="lg" sx={{ mb: 6 }}>
        <Typography variant="h4" component="h2" gutterBottom align="center" sx={{ mb: 4, fontWeight: 600 }}>
          Key Features
        </Typography>
        <Grid container spacing={4}>
          {features.map((feature, index) => (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <Card
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  textAlign: 'center',
                  p: 3,
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    transition: 'transform 0.3s ease-in-out',
                    boxShadow: '0 8px 25px rgba(0, 0, 0, 0.15)',
                  },
                }}
              >
                <Box sx={{ mb: 2 }}>{feature.icon}</Box>
                <Typography variant="h6" component="h3" gutterBottom sx={{ fontWeight: 600 }}>
                  {feature.title}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {feature.description}
                </Typography>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* How It Works Section */}
      <Container maxWidth="lg" sx={{ mb: 6 }}>
        <Typography variant="h4" component="h2" gutterBottom align="center" sx={{ mb: 4, fontWeight: 600 }}>
          How It Works
        </Typography>
        <Grid container spacing={4}>
          {howItWorks.map((step, index) => (
            <Grid item xs={12} md={6} key={index}>
              <Card sx={{ height: '100%', p: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Avatar
                    sx={{
                      bgcolor: '#1976d2',
                      width: 40,
                      height: 40,
                      mr: 2,
                      fontWeight: 600,
                    }}
                  >
                    {step.step}
                  </Avatar>
                  <Typography variant="h6" component="h3" sx={{ fontWeight: 600 }}>
                    {step.title}
                  </Typography>
                </Box>
                <Typography variant="body2" color="text.secondary">
                  {step.description}
                </Typography>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* Benefits Section */}
      <Container maxWidth="lg" sx={{ mb: 6 }}>
        <Grid container spacing={4} alignItems="center">
          <Grid item xs={12} md={6}>
            <Typography variant="h4" component="h2" gutterBottom sx={{ fontWeight: 600 }}>
              Benefits
            </Typography>
            <List>
              {benefits.map((benefit, index) => (
                <ListItem key={index} sx={{ px: 0 }}>
                  <ListItemIcon>
                    <CheckCircleIcon color="primary" />
                  </ListItemIcon>
                  <ListItemText primary={benefit} />
                </ListItem>
              ))}
            </List>
          </Grid>
          <Grid item xs={12} md={6}>
            <Paper
              elevation={3}
              sx={{
                p: 4,
                background: 'linear-gradient(135deg, #f5f5f5 0%, #e0e0e0 100%)',
                borderRadius: 3,
              }}
            >
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                For Universities
              </Typography>
              <Typography variant="body2" paragraph>
                • Streamlined credential issuance process
              </Typography>
              <Typography variant="body2" paragraph>
                • Reduced administrative overhead
              </Typography>
              <Typography variant="body2" paragraph>
                • Enhanced institutional reputation
              </Typography>
              <Typography variant="body2">
                • Global accessibility for alumni
              </Typography>
            </Paper>
          </Grid>
        </Grid>
      </Container>

      {/* Call to Action */}
      <Container maxWidth="md">
        <Paper
          elevation={3}
          sx={{
            p: 4,
            textAlign: 'center',
            background: 'linear-gradient(135deg, #1976d2 0%, #1565c0 100%)',
            color: 'white',
            borderRadius: 3,
          }}
        >
          <Typography variant="h5" component="h2" gutterBottom sx={{ fontWeight: 600 }}>
            Ready to Get Started?
          </Typography>
          <Typography variant="body1" sx={{ mb: 3, opacity: 0.9 }}>
            Join the future of academic credential verification
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
            {!account ? (
              <Button
                variant="contained"
                color="secondary"
                size="large"
                startIcon={<LaunchIcon />}
                sx={{ textTransform: 'none', fontWeight: 600 }}
              >
                Connect Wallet to Start
              </Button>
            ) : isAuthorized ? (
              <Button
                component={Link}
                to="/issue"
                variant="contained"
                color="secondary"
                size="large"
                startIcon={<SchoolIcon />}
                sx={{ textTransform: 'none', fontWeight: 600 }}
              >
                Issue Credentials
              </Button>
            ) : (
              <Button
                component={Link}
                to="/verify"
                variant="contained"
                color="secondary"
                size="large"
                startIcon={<VerifiedIcon />}
                sx={{ textTransform: 'none', fontWeight: 600 }}
              >
                Verify Credentials
              </Button>
            )}
            <Button
              component={Link}
              to="/dashboard"
              variant="outlined"
              color="inherit"
              size="large"
              startIcon={<LaunchIcon />}
              sx={{ textTransform: 'none', fontWeight: 600 }}
            >
              View Dashboard
            </Button>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
};

export default Home;
