import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom"
import axios from 'axios'
import Menu from "./Menu";

const Menubar = () => {
  const navigate = useNavigate();
  const [serviceLineList, setServiceLineList] = useState([]);
  const [capabilityAreasMap, setCapabilityAreasMap] = useState({});

  useEffect(()=>{
    fetchServiceLines();
  },[])

  const fetchServiceLines = () => {
    axios.get(`/application/getServiceLinesForHome`)
    .then(function (response) {
      setServiceLineList(response.data.serviceLines);
      // Fetch capability areas for each service line
      response.data.serviceLines.forEach(serviceLine => {
        fetchCapabilityAreas(serviceLine.service_line_id);
      });
    })
    .catch(function (error) {
        console.log(error);
    })
  }

  const fetchCapabilityAreas = (serviceLineId) => {
    axios.get(`/capabilityArea/serviceLine/${serviceLineId}`)
    .then(function (response) {
      setCapabilityAreasMap(prev => ({
        ...prev,
        [serviceLineId]: response.data.capabilityAreas
      }));
    })
    .catch(function (error) {
        console.log(error);
        setCapabilityAreasMap(prev => ({
          ...prev,
          [serviceLineId]: []
        }));
    })
  }

  const handleCapabilityAreaClick = (event, capabilityArea) => {
    document.getElementById('navbarSupportedContent2').classList.remove('show');
    event.preventDefault();    
    navigate(`/filter`,{
      state: {
          categoryTech: [],
          technologies: capabilityArea.name,
      },
  });
  }

  return (
    <div>
   
    <nav className="navbar menubar navbar-expand-lg navbar-light" id="test">
      <div className="container-fluid">
        
      
        <div className="collapse navbar-collapse" id="navbarSupportedContent2">
          <div className="d-block d-md-none mobile_menu">
            <Menu />
          </div>
          <ul className="navbar-nav  cat_menubar me-auto mb-2 mb-lg-0">
            {serviceLineList.map((serviceLine, serviceLineIndex) => {
              const capabilityAreas = capabilityAreasMap[serviceLine.service_line_id] || [];
              return (
                <li className="nav-item menu-item dropdown ps-2" key={serviceLineIndex}>
                  <a 
                    className="nav-link main_li" 
                    href="#" 
                    id="navbarDropdownemp" 
                    role="button" 
                    data-bs-toggle="dropdown" 
                    aria-expanded="false"
                  >
                    {serviceLine.name}
                  </a>
                  <ul className="dropdown-menu" key={`dropdown-menu-${serviceLineIndex}`}>
                    {capabilityAreas.map((capabilityArea, capabilityIndex) => {
                      return (
                        <li className="ps-1" key={`capability-${serviceLineIndex}-${capabilityIndex}`}>
                          <a 
                            className="dropdown-item" 
                            onClick={(event) => handleCapabilityAreaClick(event, capabilityArea)} 
                            href='#'
                          >
                            {capabilityArea.name}
                          </a>
                        </li>
                      );
                    })}
                  </ul>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </nav>
  </div>

  );
};

export default Menubar;
