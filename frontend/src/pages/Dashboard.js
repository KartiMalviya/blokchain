import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Paper,
  Alert,
  CircularProgress,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  Chip,
} from '@mui/material';
import {
  School as SchoolIcon,
  Verified as VerifiedIcon,
  TrendingUp as TrendingUpIcon,
  AccountBalance as AccountBalanceIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Schedule as ScheduleIcon,
} from '@mui/icons-material';
import { useWallet } from '../contexts/WalletContext';
import { format } from 'date-fns';

const Dashboard = () => {
  const { account, isAuthorized, universityName, getNetworkInfo } = useWallet();
  
  const [networkInfo, setNetworkInfo] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadNetworkInfo = async () => {
      try {
        const info = await getNetworkInfo();
        setNetworkInfo(info);
      } catch (error) {
        console.error('Error loading network info:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadNetworkInfo();
  }, [getNetworkInfo]);

  const stats = [
    {
      title: 'Blockchain Network',
      value: networkInfo?.name || 'Loading...',
      icon: <TrendingUpIcon />,
      color: 'primary',
    },
    {
      title: 'Chain ID',
      value: networkInfo?.chainId || 'Loading...',
      icon: <AccountBalanceIcon />,
      color: 'secondary',
    },
    {
      title: 'Wallet Status',
      value: account ? 'Connected' : 'Not Connected',
      icon: <VerifiedIcon />,
      color: account ? 'success' : 'warning',
    },
    {
      title: 'University Status',
      value: isAuthorized ? 'Authorized' : 'Not Authorized',
      icon: <SchoolIcon />,
      color: isAuthorized ? 'success' : 'error',
    },
  ];

  const recentActivities = [
    {
      type: 'credential_issued',
      title: 'Credential Issued',
      description: 'Bachelor of Science in Computer Science issued to STU123456',
      timestamp: Date.now() - 3600000, // 1 hour ago
      status: 'success',
    },
    {
      type: 'credential_verified',
      title: 'Credential Verified',
      description: 'Master of Business Administration verified for STU789012',
      timestamp: Date.now() - 7200000, // 2 hours ago
      status: 'info',
    },
    {
      type: 'credential_revoked',
      title: 'Credential Revoked',
      description: 'Bachelor of Arts in English revoked for STU345678',
      timestamp: Date.now() - 86400000, // 1 day ago
      status: 'error',
    },
  ];

  const getStatusIcon = (status) => {
    switch (status) {
      case 'success':
        return <CheckCircleIcon color="success" />;
      case 'error':
        return <CancelIcon color="error" />;
      case 'info':
        return <VerifiedIcon color="info" />;
      default:
        return <ScheduleIcon color="action" />;
    }
  };

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 600, mb: 4 }}>
        Dashboard
      </Typography>

      {!account && (
        <Alert severity="info" sx={{ mb: 4 }}>
          Please connect your wallet to view the full dashboard.
        </Alert>
      )}

      {/* Statistics Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {stats.map((stat, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Box
                    sx={{
                      color: `${stat.color}.main`,
                      mr: 2,
                    }}
                  >
                    {stat.icon}
                  </Box>
                  <Typography variant="h6" component="div" sx={{ fontWeight: 600 }}>
                    {stat.title}
                  </Typography>
                </Box>
                <Typography variant="h4" component="div" sx={{ fontWeight: 700 }}>
                  {stat.value}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Grid container spacing={4}>
        {/* System Information */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, mb: 3 }}>
                System Information
              </Typography>
              
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" color="text.secondary">
                  Connected Wallet
                </Typography>
                <Typography variant="body1" sx={{ fontFamily: 'monospace', wordBreak: 'break-all' }}>
                  {account || 'Not connected'}
                </Typography>
              </Box>
              
              {isAuthorized && (
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" color="text.secondary">
                    University Name
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 600 }}>
                    {universityName}
                  </Typography>
                </Box>
              )}
              
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" color="text.secondary">
                  Network
                </Typography>
                <Typography variant="body1">
                  {networkInfo?.name || 'Unknown'} (Chain ID: {networkInfo?.chainId || 'Unknown'})
                </Typography>
              </Box>
              
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" color="text.secondary">
                  Authorization Status
                </Typography>
                <Chip
                  label={isAuthorized ? 'Authorized University' : 'Not Authorized'}
                  color={isAuthorized ? 'success' : 'error'}
                  size="small"
                  sx={{ mt: 1 }}
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Quick Actions */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, mb: 3 }}>
                Quick Actions
              </Typography>
              
              <List>
                <ListItem button component="a" href="/issue">
                  <ListItemIcon>
                    <SchoolIcon color="primary" />
                  </ListItemIcon>
                  <ListItemText
                    primary="Issue Credentials"
                    secondary="Issue new academic credentials"
                  />
                </ListItem>
                
                <Divider />
                
                <ListItem button component="a" href="/verify">
                  <ListItemIcon>
                    <VerifiedIcon color="primary" />
                  </ListItemIcon>
                  <ListItemText
                    primary="Verify Credentials"
                    secondary="Search and verify existing credentials"
                  />
                </ListItem>
                
                <Divider />
                
                <ListItem>
                  <ListItemIcon>
                    <AccountBalanceIcon color="action" />
                  </ListItemIcon>
                  <ListItemText
                    primary="View Contract"
                    secondary="View smart contract on blockchain explorer"
                  />
                </ListItem>
              </List>
            </CardContent>
          </Card>
        </Grid>

        {/* Recent Activity */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, mb: 3 }}>
                Recent Activity
              </Typography>
              
              <List>
                {recentActivities.map((activity, index) => (
                  <React.Fragment key={index}>
                    <ListItem>
                      <ListItemIcon>
                        {getStatusIcon(activity.status)}
                      </ListItemIcon>
                      <ListItemText
                        primary={activity.title}
                        secondary={
                          <Box>
                            <Typography variant="body2" color="text.secondary">
                              {activity.description}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {format(activity.timestamp, 'PPP p')}
                            </Typography>
                          </Box>
                        }
                      />
                    </ListItem>
                    {index < recentActivities.length - 1 && <Divider />}
                  </React.Fragment>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;
