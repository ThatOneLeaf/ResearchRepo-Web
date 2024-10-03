import React, { useState, useEffect } from "react";
import Signup from "./components/signup";
import Login from "./components/login";
import Home from "./components/home";
import Profile from "./components/profile";
import PrivateRoute from "./components/privateroute";

import { CssBaseline } from "@mui/material"; // To remove default margin
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

function App() {
  const [data, setData] = useState([{}]);

  return (
    <Router>
      <CssBaseline />
      <Routes>
        <Route path='/' element={<Home />} />
        <Route path='/login' element={<Login />} />
        <Route path='/signup' element={<Signup />} />
        <Route path='/home' element={<Home />} />
        <Route
          path='/profile'
          element={
            <PrivateRoute>
              <Profile />
            </PrivateRoute>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
