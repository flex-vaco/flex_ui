import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom"
import axios from 'axios'
import Menu from "./Menu";

const Menubar = () => {
  const navigate = useNavigate();
  const [categoryList, setCategoryList] = useState([]);

  useEffect(()=>{
    fetchCategories();
  },[])

  const fetchCategories = () => {
    axios.get(`/application/getCategories`)
    .then(function (response) {
      setCategoryList(response.data.categories);
    })
    .catch(function (error) {
        console.log(error);
    })
  }

  const handleTechClick = (event, technology) => {
    document.getElementById('navbarSupportedContent2').classList.remove('show');
    event.preventDefault();    
    navigate(`/filter`,{
      state: {
          categoryTech: [],
          technologies: technology,
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
             {categoryList.map((category,key) => { 
                return (
                <li className="nav-item menu-item dropdown ps-2" key={key} id="test1">
                  <a className="nav-link main_li" href="#" id="navbarDropdownemp" role="button" data-bs-toggle="dropdown" aria-expanded="false">
                    {category.category_name}
                  </a>
                  <ul className="dropdown-menu" key={`dropdown-menu-${key}`}>
                    {category.technologies.split(',').map((technology,key) => { return (
                    <li className="ps-1"><a className="dropdown-item" key={key} onClick={(event)=>handleTechClick(event,technology)} href='#'>{technology}</a></li>
                    )})}
                  </ul>
                </li>)
              })
            }
          
           
          </ul>
        </div>
      </div>
    </nav>
  </div>

  );
};

export default Menubar;
