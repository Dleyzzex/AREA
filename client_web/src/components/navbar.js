import React, { useState } from 'react';
import {
    Collapse,
    Navbar,
    NavbarToggler,
    NavbarBrand,
    Nav,
    NavItem,
    NavLink,
    UncontrolledDropdown,
    DropdownToggle,
    DropdownMenu,
    DropdownItem,
    NavbarText
} from 'reactstrap';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faUserAlt, faSignOutAlt, faSlidersH, faSignInAlt, faPuzzlePiece, faPlus, faUsers, faUser, faChartLine } from '@fortawesome/free-solid-svg-icons'
import { connect } from "react-redux";
import { logout } from '../actions/auth';
import { Redirect } from 'react-router-dom';

class MainNavbar extends React.Component {
  constructor(props) {
    super(props);
    this.logOut = this.logOut.bind(this);
  }

  logOut()
  {
    this.props.dispatch(logout());
  }


    render() {
        var isOpen = true;
        var currentUser = JSON.parse(localStorage.getItem("user"));

        return (
        <Navbar className="navbar" light expand="md">
          <NavbarBrand href="/">MacArea</NavbarBrand>
            <Collapse isOpen={isOpen} navbar>
              { (currentUser && currentUser.role == "user") ? (

                <Nav className="mr-auto" navbar>
                <NavItem>
                  <NavLink href="/scripts"><FontAwesomeIcon icon={faPuzzlePiece}/>  Scripts</NavLink>
                </NavItem>
                <NavItem>
                  <NavLink href="/add-script"><FontAwesomeIcon icon={faPlus}/>  Add</NavLink>
                </NavItem>
                </Nav>
                
              ) : (
                <></>
                //<Nav className="mr-auto" navbar/>
              )
            }
            {
              (currentUser && currentUser.role == "admin") ?(
              <Nav className="mr-auto" navbar>
              <NavItem>
                <NavLink href="/scripts"><FontAwesomeIcon icon={faUsers}/>  Users</NavLink>
              </NavItem>
              <NavItem>
                  <NavLink href="/add-script"><FontAwesomeIcon icon={faChartLine}/>  Stats</NavLink>
                </NavItem>
              </Nav>) : (<Nav className="mr-auto" navbar/>)
            }
            <Nav className="mr-1" navbar>
                { currentUser ? (
                <NavItem>
                <UncontrolledDropdown>
                  <DropdownToggle nav caret><FontAwesomeIcon icon={faUserAlt}/>  {currentUser.username}</DropdownToggle>
                   <DropdownMenu right>
                    <DropdownItem href="/settings"><FontAwesomeIcon icon={faSlidersH}/> Settings</DropdownItem>
                    <DropdownItem divider />
                    <DropdownItem href="/home" onClick={this.logOut}style={{color: "#b23b3b"}}><FontAwesomeIcon icon={faSignOutAlt}/>Sign Out</DropdownItem>
                  </DropdownMenu>
                </UncontrolledDropdown>
                </NavItem>
                ) : (
                  <NavItem>
                  <UncontrolledDropdown>
                    <DropdownToggle nav caret><FontAwesomeIcon icon={faSignInAlt}/></DropdownToggle>
                     <DropdownMenu right>
                      <DropdownItem href="/login">Login</DropdownItem>
                      <DropdownItem divider />
                      <DropdownItem href="/register">Register</DropdownItem>
                    </DropdownMenu>
                  </UncontrolledDropdown>
                  </NavItem>
                )
              }
          </Nav>
        </Collapse>        
        </Navbar>
        )            
    }
}

function mapStateToProps(state) {
  const { user } = state.auth;
  return {
    user,
  };
}

export default connect(mapStateToProps)(MainNavbar);