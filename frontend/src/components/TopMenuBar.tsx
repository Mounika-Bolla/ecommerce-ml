import { ShoppingBagOutlined } from '@mui/icons-material'
import { AppBar, Box, Button, Toolbar, Typography } from '@mui/material'
import { NavLink, useLocation } from 'react-router'

export default function TopMenuBar() {
  const location = useLocation()

  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/'
    return location.pathname.startsWith(path)
  }

  return (
    <AppBar
      position='fixed'
      elevation={0}
      sx={{
        background: 'rgba(251, 251, 253, 0.8)',
        backdropFilter: 'saturate(180%) blur(20px)',
        borderBottom: '1px solid rgba(0, 0, 0, 0.08)',
      }}
    >
      <Toolbar sx={{ justifyContent: 'space-between', maxWidth: 1200, mx: 'auto', width: '100%' }}>
        {/* Logo */}
        <Box
          component={NavLink}
          to='/'
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            textDecoration: 'none',
            color: 'inherit',
          }}
        >
          <ShoppingBagOutlined sx={{ fontSize: 28, color: '#1d1d1f' }} />
          <Typography
            variant='h6'
            sx={{
              fontWeight: 600,
              color: '#1d1d1f',
              letterSpacing: '-0.5px',
            }}
          >
            E-Commerce ML
          </Typography>
        </Box>

        {/* Navigation */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Button
            component={NavLink}
            to='/'
            sx={{
              color: isActive('/') && !isActive('/demand') ? '#0066cc' : '#1d1d1f',
              fontWeight: isActive('/') && !isActive('/demand') ? 600 : 400,
              fontSize: '0.875rem',
              '&:hover': { backgroundColor: 'rgba(0, 0, 0, 0.04)' },
            }}
          >
            🎯 Recommendations
          </Button>
          <Button
            component={NavLink}
            to='/demand'
            sx={{
              color: isActive('/demand') ? '#0066cc' : '#1d1d1f',
              fontWeight: isActive('/demand') ? 600 : 400,
              fontSize: '0.875rem',
              '&:hover': { backgroundColor: 'rgba(0, 0, 0, 0.04)' },
            }}
          >
            📈 Demand Analytics
          </Button>
        </Box>
      </Toolbar>
    </AppBar>
  )
}
