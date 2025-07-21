import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import * as AppFunc from "../lib/AppFunctions";
import Menu from "./Menu";

const Navbar = () => {
  const navigate = useNavigate();
  const [searchSkill, setSearchSkill] = useState('');
  const [showAvatarMenu, setShowAvatarMenu] = useState(false);

  const handleSearchClick = (event) => {
    event.preventDefault();
    navigate(`/filter`, {
      state: { categoryTech: [], technologies: searchSkill }
    });
  };

  const handleLogout = () => {
    localStorage.removeItem("jwt-access-token");
    navigate("/");
  };

  if (AppFunc.userIsEmployee()) {
    return (
      <nav className="custom-navbar">
        <div className="navbar-left">
          <img src="/images/Logo.png" alt="Logo" className="logo-img" />
        </div>
        <div className="navbar-right">
          <Menu />
        </div>
      </nav>
    );
  }

  return (
    <nav className="custom-navbar col-11 margin-center">
      <div className="navbar-left">
        <Link to="/home" className="logo-link">
          <img src="/images/Logo.png" alt="Logo" className="logo-img" />
        </Link>
      </div>

      <form className="search-form" onSubmit={handleSearchClick}>
        <input
          type="text"
          placeholder="What skills are you looking to hire?"
          value={searchSkill}
          onChange={(e) => setSearchSkill(e.target.value)}
        />
        <button type="submit">
          <i className="bi bi-search"></i>
        </button>
      </form>

      <div className="navbar-links">
        {/* Employees dropdown */}
        <div
          className="dropdown-wrapper"
        >
          <button className="nav-link">
            Employees <span className="arrow">&#9662;</span>
          </button>
        </div>

        {/* Projects dropdown */}
        <div
          className="dropdown-wrapper"
        >
          <button className="nav-link">
            Projects <span className="arrow">&#9662;</span>
          </button>
        </div>
        <Menu />
      </div>
    </nav>
  );
};

export default Navbar;
