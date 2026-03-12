import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Box,
  Drawer,
  Typography,
  IconButton,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  Inventory as InventoryIcon,
  Menu as MenuIcon,
} from '@mui/icons-material';

declare const __APP_VERSION__: string;

const COLORS = {
  primary: '#635BFF',
  background: '#F6F9FC',
  paper: '#FFFFFF',
  textPrimary: '#3C4257',
  textSecondary: '#697386',
  border: '#E3E8EE',
  activeBg: '#F6F0FF',
};

const drawerWidth = 240;

interface NavItem {
  text: string;
  icon: React.ReactElement;
  path: string;
}

const navItems: NavItem[] = [
  { text: 'Dashboard', icon: <DashboardIcon />, path: '/' },
  { text: 'Items', icon: <InventoryIcon />, path: '/items' },
];

const Sidebar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const [mobileOpen, setMobileOpen] = useState(false);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleNavigation = (path: string) => {
    navigate(path);
    if (isMobile) {
      setMobileOpen(false);
    }
  };

  const isActive = (path: string) => {
    if (path === '/') {
      return location.pathname === path;
    }
    return location.pathname.startsWith(path);
  };

  const Divider = () => (
    <Box
      sx={{
        height: '1px',
        backgroundColor: COLORS.border,
        mx: 0,
      }}
    />
  );

  const NavItemButton: React.FC<{ item: NavItem }> = ({ item }) => {
    const active = isActive(item.path);
    return (
      <Box
        onClick={() => handleNavigation(item.path)}
        sx={{
          display: 'flex',
          alignItems: 'center',
          height: '36px',
          padding: '8px 12px 8px 24px',
          gap: '12px',
          cursor: 'pointer',
          position: 'relative',
          backgroundColor: active ? COLORS.activeBg : 'transparent',
          borderLeft: active ? `2px solid ${COLORS.primary}` : '2px solid transparent',
          paddingLeft: active ? '22px' : '24px',
          transition: 'background 150ms ease',
          '&:hover': {
            backgroundColor: active ? COLORS.activeBg : COLORS.background,
          },
        }}
      >
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: active ? COLORS.primary : COLORS.textSecondary,
            '& .MuiSvgIcon-root': { fontSize: '18px' },
          }}
        >
          {item.icon}
        </Box>
        <Typography
          sx={{
            fontSize: '14px',
            fontWeight: 400,
            color: active ? COLORS.primary : COLORS.textSecondary,
            lineHeight: 1,
          }}
        >
          {item.text}
        </Typography>
      </Box>
    );
  };

  const drawerContent = (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
      }}
    >
      {/* Logo area */}
      <Box sx={{ padding: '20px 24px' }}>
        <Typography
          sx={{
            fontSize: '20px',
            fontWeight: 600,
            color: COLORS.textPrimary,
          }}
        >
          My App
        </Typography>
      </Box>

      <Divider />

      {/* Navigation items */}
      <Box sx={{ flexGrow: 1, pt: 1 }}>
        {navItems.map((item) => (
          <NavItemButton key={item.path} item={item} />
        ))}
      </Box>

      {/* Version */}
      <Typography
        sx={{
          fontSize: '11px',
          color: COLORS.textSecondary,
          textAlign: 'center',
          py: 1,
          opacity: 0.6,
          mt: 'auto',
        }}
      >
        v{__APP_VERSION__}
      </Typography>
    </Box>
  );

  const drawerPaperStyles = {
    width: drawerWidth,
    boxSizing: 'border-box',
    backgroundColor: COLORS.paper,
    borderRight: `1px solid ${COLORS.border}`,
    boxShadow: 'none',
  };

  return (
    <>
      {isMobile && (
        <IconButton
          color="inherit"
          aria-label="open drawer"
          edge="start"
          onClick={handleDrawerToggle}
          sx={{
            position: 'fixed',
            top: 12,
            left: 12,
            zIndex: theme.zIndex.drawer + 2,
            backgroundColor: COLORS.paper,
            boxShadow: 1,
            '&:hover': { backgroundColor: COLORS.background },
          }}
        >
          <MenuIcon sx={{ color: COLORS.textPrimary }} />
        </IconButton>
      )}

      {!isMobile && (
        <Drawer
          variant="permanent"
          sx={{
            width: drawerWidth,
            flexShrink: 0,
            '& .MuiDrawer-paper': drawerPaperStyles,
          }}
          open
        >
          {drawerContent}
        </Drawer>
      )}

      {isMobile && (
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{ keepMounted: true }}
          sx={{ '& .MuiDrawer-paper': drawerPaperStyles }}
        >
          {drawerContent}
        </Drawer>
      )}
    </>
  );
};

export default Sidebar;
