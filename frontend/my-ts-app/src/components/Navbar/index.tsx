import React from "react";
import { Nav, NavLink, NavMenu } 
    from "./NavbarElements";
import './home.scss'
  
/**
 * Navbar sets up the navbar with 3 pages
 * @returns the navbar div 
 */
const Navbar = () => {
  return (
    <div className="page">
      <Nav>
        <NavMenu>
        </NavMenu>
        <div className="other">
          <div className="menu-item">
          <h1 className="logo">T@B</h1>
          <NavLink to="/" >
            Home
          </NavLink>
          </div>
          <div className="menu-item">
          <NavLink to="/profile" >
            Profile
          </NavLink>
          </div>
          <div className="menu-item">
          <NavLink to="/book" >
            Book a Trip
          </NavLink>
          </div>

          </div>
      </Nav>
    </div>
  );
};
  
export default Navbar;