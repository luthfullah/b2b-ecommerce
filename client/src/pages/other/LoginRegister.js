import React, { Fragment,useState } from "react";
import { Link, useLocation } from "react-router-dom"; 
import Tab from "react-bootstrap/Tab";
import Nav from "react-bootstrap/Nav";
import SEO from "../../components/seo";
import LayoutOne from "../../layouts/LayoutOne";
import Breadcrumb from "../../wrappers/breadcrumb/Breadcrumb";

const LoginRegister = () => {
  let { pathname } = useLocation();

  ///////////////////////
  const [loginData, setLoginData] = useState({
    name: "",
    password: "",
  });

  const [isLoggedIn, setLoggedIn] = useState(false);

  // Update login form data on input change
  const handleInputChange = (e) => {
    setLoginData({
      ...loginData,
      [e.target.name]: e.target.value,
    });
  };

  // Handle form submission
  const handleLoginSubmit = async (e) => {
    // e.preventDefault();

    try {
      const response = await fetch("http://localhost:5000/api/signin/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        
        body: JSON.stringify(loginData),
        
      });
      console.log("llllllllllllll",loginData)
      console.log("response",response);
      debugger

      if (response.ok) {
        // Successful login
        const data = await response.json();
        // Handle the authentication data as needed
        setLoggedIn(true);
        console.log("on data true",data)
      } else {
        // Failed login
        setLoggedIn(false);
        console.log("on data false")
      }
    } catch (error) {
      console.error("Error during login:", error);
      setLoggedIn(false);
    }
  };

//////////////////////////
  return (
    <Fragment>
      <SEO
        titleTemplate="Login"
        description="Login page of flone react minimalist eCommerce template."
      />
      <LayoutOne headerTop="visible">
        {/* breadcrumb */}
        <Breadcrumb 
          pages={[
            {label: "Home", path: process.env.PUBLIC_URL + "/" },
            {label: "Login Register", path: process.env.PUBLIC_URL + pathname }
          ]} 
        />
        <div className="login-register-area pt-100 pb-100">
          <div className="container">
            <div className="row">
              <div className="col-lg-7 col-md-12 ms-auto me-auto">
                <div className="login-register-wrapper">
                  <Tab.Container defaultActiveKey="login">
                    <Nav variant="pills" className="login-register-tab-list">
                      <Nav.Item>
                        <Nav.Link eventKey="login">
                          <h4>Login</h4>
                        </Nav.Link>
                      </Nav.Item>
                      <Nav.Item>
                        <Nav.Link eventKey="register">
                          <h4>Register</h4>
                        </Nav.Link>
                      </Nav.Item>
                    </Nav>
                    <Tab.Content>
                      <Tab.Pane eventKey="login">
                        <div className="login-form-container">
                          <div className="login-register-form">
                            <form onSubmit={handleLoginSubmit}>
                            <input
                                  type="text"
                                  name="name" // Change to "username" for consistency
                                  placeholder="Username"
                                  value={loginData.name}
                                  onChange={handleInputChange}
                                />
                                <input
                                  type="password"
                                  name="password"
                                  placeholder="Password"
                                  value={loginData.password}
                                  onChange={handleInputChange}
                                />
                              <div className="button-box">
                                <div className="login-toggle-btn">
                                  <input type="checkbox" />
                                  <label className="ml-10">Remember me</label>
                                  <Link to={process.env.PUBLIC_URL + "/product-tab-right"}>
                                    Forgot Password?
                                  </Link>
                                </div>
                                <button type="submit">
                                  <span>Login</span>
                                </button>
                              </div>
                            </form>
                          </div>
                        </div>
                      </Tab.Pane>
                      <Tab.Pane eventKey="register">
                        <div className="login-form-container">
                          <div className="login-register-form">
                            <form>
                              <input
                                type="text"
                                name="user-name"
                                placeholder="Username"
                                
                              />
                              <input
                                type="password"
                                name="user-password"
                                placeholder="Password"
                                
                              />
                              <input
                                name="user-email"
                                placeholder="Email"
                                type="email"
                              />
                              <div className="button-box">
                                <button type="submit">
                                  <span>Register</span>
                                </button>
                              </div>
                            </form>
                          </div>
                        </div>
                      </Tab.Pane>
                    </Tab.Content>
                  </Tab.Container>
                </div>
              </div>
            </div>
          </div>
        </div>
      </LayoutOne>
    </Fragment>
  );
};

export default LoginRegister;
