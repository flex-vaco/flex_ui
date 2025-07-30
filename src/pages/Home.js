import React, { useEffect, useState } from "react";

import { useNavigate } from "react-router-dom";
import axios from "axios";
import Modal from "react-modal";
import HomePageLayout from "../components/HomePageLayout";
import APP_CONSTANTS from "../appConstants";
import * as APP_FUNCTIONS from "../lib/AppFunctions";

function Home() {
  const [searchSkill, setSearchSkill] = useState("");
  const [modalIsOpen, setIsOpen] = useState(false);
  const userIsProducer = useState(
    APP_FUNCTIONS.activeUserRole === APP_CONSTANTS.USER_ROLES.PRODUCER
  );
  const imageURL = process.env.REACT_APP_API_BASE_URL + "/uploads/technologies/";
  const navigate = useNavigate();
  const [categoryList, setCategoryList] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState({});

  const closeModal = () => {
    setIsOpen(false);
  }

  const navigateToEmployeeFilter = () => {
    navigate(`/filter`, {
      state: {
        categoryTech: [],
        technologies: searchSkill,
      },
    });
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = () => {
    axios
      .get(`/application/getCategories`)
      .then(function (response) {
        setCategoryList(response.data.categories);
      })
      .catch(function (error) {
        console.log(error);
      });
  };

  const handleClickCategory = (e, category) => {
    setSelectedCategory(category);
    setIsOpen(true);
  };

  const handleTechClick = (event, technology) => {
    event.preventDefault();
    navigate(`/filter`, {
      state: {
        categoryTech: [],
        technologies: technology,
      },
    });
  };

  return (
    <HomePageLayout>
      <div hidden={!userIsProducer} className="container">
        <a href={"/dashboard"} className="btn btn-outline-primary">
          My Dashboard
        </a>
      </div>
      <div className="container text-center mt-5">
        <h3>
          Hello! <small>What skills are you looking to hire?</small>
        </h3>
      </div>
      <div className="container search_container mt-3">
        <form className="d-flex ms-3 me-3">
          <input
            className="form-control homepage_search_input"
            onChange={(event) => {
              setSearchSkill(event.target.value);
            }}
            type="text"
            placeholder="Java, Python, Netsuite etc..."
            aria-label="Search"
          />
          <button
            disabled={searchSkill.length < 3}
            className="btn btn-outline-success homepage_search_btn"
            onClick={navigateToEmployeeFilter}
          >
            Search
          </button>
        </form>
      </div>

      <div className="container-fluid mt-5 float-left">
        <div className="col-xs-12 col-lg-12 mx-1">
          {categoryList.map((category) => {
            return (
              <div
                className="col-6 col-lg-3 float-left my-1 ps-1 pe-1 cursor"
                onClick={(e) => {
                  handleClickCategory(e, category);
                }}
              >
                <div className="col-12 col-lg-10 mx-0 mb-2 height_min home_cards">
                  <div className="card text-center min_height">
                    <img
                      className="cat_images mx-auto d-block"
                      src={ imageURL + category.image_name}
                      alt={category.category_name}
                    />
                    <div className="card-block">
                      <p className="card-text">{category.category_name}</p>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        <div className="homepagemodal">
          <Modal
            isOpen={modalIsOpen}
            onRequestClose={closeModal}
            ariaHideApp={false}
            className="crm-modal"
            overlayClassName="crm-modal-overlay"
          >
            {/* <div className="col-12 col-lg-4 float-left right-border">
              <button
                onClick={closeModal}
                className="btn btn-primary btn-xs exitarrow"
              >
                <i className="bi bi-box-arrow-left"></i>
              </button>
            </div> */}
            {/* <div className="col-12 float-left modal_container">
              <div className="col-12 col-lg-5 float-left right-border text-center">
                <div id="photo2" className="selected_category_image">
                  <img src={imageURL + selectedCategory?.image_name} alt="" />
                  <span></span>
                </div>
                <h4 className="selected_category_name">{selectedCategory?.category_name}</h4>
              </div>
              <div className="col-12 col-lg-7 float-left">
                {selectedCategory?.technologies?.split(",").map((tech, key) => {
                  return (
                    <div
                      id="photo"
                      onClick={(event) => handleTechClick(event, tech)}
                      key={key}
                    >
                      <img
                        src={imageURL + selectedCategory?.image_name}
                        alt=""
                      />
                      <span>{tech}</span>
                    </div>
                  );
                })}
              </div>
            </div> */}
            <div className="crm-modal-content">
              <div className="crm-modal-left">  
                <img src={imageURL + selectedCategory?.image_name} alt="" className="crm-icon-image"/>
                <h2 className="crm-title">{selectedCategory?.category_name}</h2>
              </div>
              <div className="crm-modal-right">
                <ul className="crm-services-list">
                  {selectedCategory?.technologies?.split(",").map((tech, key) => {
                    return (
                      <li 
                        onClick={(event) => handleTechClick(event, tech)}
                        key={key}
                      >
                        <img src={imageURL + selectedCategory?.image_name} alt=""/>
                        <span>{tech}</span>
                      </li>
                    );
                  })}
                </ul>
              </div>
            </div>
          </Modal>
        </div>
      </div>
    </HomePageLayout>
  );
}

export default Home;
