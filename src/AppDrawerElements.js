import React from 'react'

import List, { ListItem, ListItemIcon, ListItemText } from 'material-ui/List'
import Divider from 'material-ui/Divider'
import { MenuItem } from 'material-ui/Menu'

import StarIcon from 'material-ui-icons/Star'
import { Link } from "react-router-dom"


export const DrawerMenuItems = (
  <div>
    <Divider />
    <List>
      <Link to="/">
        <ListItem button>
          <ListItemIcon>
            <StarIcon />
          </ListItemIcon>
          <ListItemText primary="Main" />
        </ListItem>
      </Link>

      <Link to="/courses">
        <ListItem button>
          <ListItemIcon>
            <StarIcon />
          </ListItemIcon>
          <ListItemText primary="Courses" />
        </ListItem>
      </Link>

      <Link to="/paths">
        <ListItem button>
          <ListItemIcon>
            <StarIcon />
          </ListItemIcon>
          <ListItemText primary="Paths" />
        </ListItem>
      </Link>
    </List>
    <Link to="/statistics">
      <ListItem button>
          <ListItemIcon>
            <StarIcon />
          </ListItemIcon>
          <ListItemText primary="Statistics" />
        </ListItem>
    </Link>
    <Divider />
    <List>
      <ListItem button>
        <ListItemIcon>
          <StarIcon />
        </ListItemIcon>
        <ListItemText primary="Profile" />
      </ListItem>
      <ListItem button>
        <ListItemIcon>
          <StarIcon />
        </ListItemIcon>
        <ListItemText primary="About" />
      </ListItem>
    </List>
  </div>
)

const AppBarMenuItems = ({ onClick, onLogin, onLogout, user }) => (
  <div>
    {
      user
        ? <MenuItem onClick={() => { onClick(); onLogout(); }}>Logout</MenuItem>
        : <MenuItem onClick={() => { onClick(); onLogin(); }}>Login</MenuItem>
    }
  </div>
)



export const AppBarMenuItemsExport = AppBarMenuItems;
