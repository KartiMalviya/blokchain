import React from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  Chip,
  Avatar,
  Menu,
  MenuItem,
  IconButton,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  School as SchoolIcon,
  AccountBalance as AccountBalanceIcon,
  Menu as MenuIcon,
  AccountCircle as AccountCircleIcon,
} from '@mui/icons-material';
import { Link, useLocation } from 'react-router-dom';
import { useWallet } from '../contexts/WalletContext';

const Header = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const location = useLocation();
  const {
    account,
    isAuthorized,
    universityName,
    connectWallet,
    disconnectWallet,
    isConnecting,
  } = useWallet();

  const [mobileMenuAnchor, setMobileMenuAnchor] = React.useState(null);
  const [accountMenuAnchor, setAccountMenuAnchor] = React.useState(null);

  const handleMobileMenuOpen = (event) => {
    setMobileMenuAnchor(event.currentTarget);
  };

  const handleMobileMenuClose = () => {
    setMobileMenuAnchor(null);
  };

  const handleAccountMenuOpen = (event) => {
    setAccountMenuAnchor(event.currentTarget);
  };

  const handleAccountMenuClose = () => {
    setAccountMenuAnchor(null);
  };

  const handleDisconnect = () => {
    disconnectWallet();
    handleAccountMenuClose();
  };

  const isActive = (path) => location.pathname === path;

  const navItems = [
    { path: '/', label: 'Home', icon: <SchoolIcon /> },
    { path: '/issue', label: 'Issue Credentials', icon: <AccountBalanceIcon /> },
    { path: '/verify', label: 'Verify Credentials', icon: <SchoolIcon /> },
    { path: '/dashboard', label: 'Dashboard', icon: <AccountBalanceIcon /> },
  ];

  const renderNavItems = () => (
    <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
      {navItems.map((item) => (
        <Button
          key={item.path}
          component={Link}
          to={item.path}
          startIcon={item.icon}
          sx={{
            color: 'white',
            textTransform: 'none',
            fontWeight: isActive(item.path) ? 600 : 400,
            backgroundColor: isActive(item.path) ? 'rgba(255, 255, 255, 0.1)' : 'transparent',
            '&:hover': {
              backgroundColor: 'rgba(255, 255, 255, 0.2)',
            },
          }}
        >
          {item.label}
        </Button>
      ))}
    </Box>
  );

  const renderMobileMenu = () => (
    <>
      <IconButton
        size="large"
        edge="start"
        color="inherit"
        aria-label="menu"
        onClick={handleMobileMenuOpen}
        sx={{ display: { md: 'none' } }}
      >
        <MenuIcon />
      </IconButton>
      <Menu
        anchorEl={mobileMenuAnchor}
        open={Boolean(mobileMenuAnchor)}
        onClose={handleMobileMenuClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'left',
        }}
      >
        {navItems.map((item) => (
          <MenuItem
            key={item.path}
            component={Link}
            to={item.path}
            onClick={handleMobileMenuClose}
            selected={isActive(item.path)}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              {item.icon}
              {item.label}
            </Box>
          </MenuItem>
        ))}
      </Menu>
    </>
  );

  const renderWalletSection = () => {
    if (!account) {
      return (
        <Button
          variant="contained"
          color="secondary"
          onClick={connectWallet}
          disabled={isConnecting}
          sx={{
            textTransform: 'none',
            fontWeight: 600,
            borderRadius: 2,
            px: 3,
          }}
        >
          {isConnecting ? 'Connecting...' : 'Connect Wallet'}
        </Button>
      );
    }

    return (
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        {isAuthorized && (
          <Chip
            label={universityName}
            color="success"
            size="small"
            sx={{ fontWeight: 600 }}
          />
        )}
        <Chip
          label={`${account.slice(0, 6)}...${account.slice(-4)}`}
          variant="outlined"
          color="primary"
          size="small"
          sx={{ fontWeight: 600 }}
        />
        <IconButton
          color="inherit"
          onClick={handleAccountMenuOpen}
          sx={{ color: 'white' }}
        >
          <AccountCircleIcon />
        </IconButton>
        <Menu
          anchorEl={accountMenuAnchor}
          open={Boolean(accountMenuAnchor)}
          onClose={handleAccountMenuClose}
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'right',
          }}
          transformOrigin={{
            vertical: 'top',
            horizontal: 'right',
          }}
        >
          <MenuItem disabled>
            <Typography variant="body2" color="text.secondary">
              Connected: {account}
            </Typography>
          </MenuItem>
          {isAuthorized && (
            <MenuItem disabled>
              <Typography variant="body2" color="text.secondary">
                University: {universityName}
              </Typography>
            </MenuItem>
          )}
          <MenuItem onClick={handleDisconnect}>
            <Typography variant="body2">Disconnect</Typography>
          </MenuItem>
        </Menu>
      </Box>
    );
  };

  return (
    <AppBar
      position="static"
      elevation={0}
      sx={{
        background: 'linear-gradient(135deg, #1976d2 0%, #1565c0 100%)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
      }}
    >
      <Toolbar sx={{ justifyContent: 'space-between' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Avatar
            sx={{
              bgcolor: 'rgba(255, 255, 255, 0.2)',
              width: 40,
              height: 40,
            }}
          >
            <SchoolIcon />
          </Avatar>
          <Typography
            variant="h6"
            component="div"
            sx={{
              fontWeight: 700,
              letterSpacing: '0.5px',
              display: { xs: 'none', sm: 'block' },
            }}
          >
            Academic Credentials
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          {isMobile ? renderMobileMenu() : renderNavItems()}
          {renderWalletSection()}
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Header;
