import React from 'react'
import { withRouter } from "react-router-dom"

const TopMenu = ({ user, onLogin, onLogout, location }) => {
  const pathWithoutSlash = location.pathname.slice(1)
  const currentRoute = pathWithoutSlash ? pathWithoutSlash : 'main'

  return (
    <div className="top_menu">
     {/*IF LOGIN ADD 
       <div className="top_menu_left">
          <h3 style={{color: '#fff'}}>
            CodeLink
          </h3>
        </div>*/}
      <div className="top_menu_right">
        <div>
          <h3 style={{color: '#fff'}}>{currentRoute}</h3>
        </div>
        <div>
          {!user
            ? <button 
                className='top_menu-button'
                onClick={onLogin}>
                  <img alt="" src="http://via.placeholder.com/15x15" style={{marginRight:'5px'}}/>
                  Login
              </button>
            : <button
                className='top_menu-button' onClick={onLogout}>
                  <img alt="" src="http://via.placeholder.com/15x15" style={{marginRight:'5px'}}/>
                  Logout
              </button>
          }
        </div>
      </div>
    </div>
  )
}

export default withRouter(TopMenu)
