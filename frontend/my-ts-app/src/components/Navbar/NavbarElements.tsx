import { FaBars } from "react-icons/fa";
import { NavLink as Link } from "react-router-dom";
import styled from "styled-components";
  
// styling for navbar

export const Nav = styled.nav`
  background: #C4A484;
  height: 85px;
  display: flex;
  justify-content: space-between;
  padding: 0.2rem 0 0 60%;
  z-index: 12;
`;
  
export const NavLink = styled(Link)`
  color: #000000;
  display: flex;
  font-weight: bold;
  align-items: center;
  text-decoration: none;
  padding: 0 0 0 4rem; 
  height: 100%;
  cursor: pointer;
  &.active {
    color: #4d4dff;
  }
`;
  
export const Bars = styled(FaBars)`
  display: none;
  color: #000000;
  @media screen and (max-width: 768px) {
    display: block;
    position: absolute;
    top: 0;
    right: 0;
    transform: translate(-100%, 75%);
    font-size: 1.8rem;
    cursor: pointer;
  }
`;
  
export const NavMenu = styled.div`
  display: flex;
  align-items: center;
  margin-right: -24px;
  Second Nav
  margin-right: 24px;
  Third Nav
  width: 100vw;
  white-space: nowrap;
  @media screen and (max-width: 768px) {
    display: none;
  }`;