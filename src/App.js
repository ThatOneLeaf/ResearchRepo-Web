import React, { useState, useEffect } from "react";
import Home from "./components/home";
import ReadMore from "./components/readmore";
import Profile from "./components/profile";
import PrivateRoute from "./components/privateroute";
import ManageUsers from "./components/manageusers";
import ResearchThrust from "./components/researchthrust";
import ResearchTracking from "./components/researchtracking";
import UpdateResearchInfo from "./components/updateresearchinfo";
import UpdateTrackingInfo from "./components/updatetrackinginfo";
import Collection from "./components/collection";
import ManagePapers from "./components/managepapers";
import ManageCollege from "./components/managecollege";
import ManageProgram from "./components/manageprogram";
import { CssBaseline } from "@mui/material";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import KnowledgeGraph from "./components/knowledgegraph";
import { ModalProvider } from "./components/modalcontext";
import { AuthProvider } from "./context/AuthContext";
import MainDash from "./components/maindash";
import PubDash from "./components/pubdash";
import DisplayResearchInfo from "./components/displayresearchinfo";
import DisplayAuditLog from "./components/auditlog";
import RoleBasedRoute from "./components/rolebasedroute";

function App() {
  const [data, setData] = useState([{}]);
  const isLoggedIn = !!localStorage.getItem("token");

  return (
    <Router>
      <AuthProvider>
        <ModalProvider>
          <CssBaseline />
          <Routes>
            {/* Public routes */}
            <Route path='/' element={<Home />} />
            <Route path='/home' element={<Home />} />
            <Route path='/readmore' element={<ReadMore />} />
            <Route path='/researchthrust' element={<ResearchThrust />} />

            {/* Common routes (available to all authenticated users) */}
            <Route
              path='/collection'
              element={
                <PrivateRoute>
                  <Collection />
                </PrivateRoute>
              }
            />

            {/* Knowledge Graph route - accessible to all */}
            <Route
              path='/knowledgegraph'
              element={
                <PrivateRoute>
                  <KnowledgeGraph />
                </PrivateRoute>
              }
            />

            {/* System Administrator only routes */}
            <Route
              path='/manage-users'
              element={
                <PrivateRoute>
                  <RoleBasedRoute allowedRoles={["01"]}>
                    <ManageUsers />
                  </RoleBasedRoute>
                </PrivateRoute>
              }
            />
            <Route
              path='/managecollege'
              element={
                <PrivateRoute>
                  <RoleBasedRoute allowedRoles={["01"]}>
                    <ManageCollege />
                  </RoleBasedRoute>
                </PrivateRoute>
              }
            />
            <Route
              path='/manageprogram'
              element={
                <PrivateRoute>
                  <RoleBasedRoute allowedRoles={["01"]}>
                    <ManageProgram />
                  </RoleBasedRoute>
                </PrivateRoute>
              }
            />
            <Route
              path='/auditlog'
              element={
                <PrivateRoute>
                  <RoleBasedRoute allowedRoles={["01"]}>
                    <DisplayAuditLog />
                  </RoleBasedRoute>
                </PrivateRoute>
              }
            />

            {/* Research Tracking (Head Executive, Director, Program Admin) */}
            <Route
              path='/researchtracking'
              element={
                <PrivateRoute>
                  <RoleBasedRoute allowedRoles={["02", "03", "05"]}>
                    <ResearchTracking />
                  </RoleBasedRoute>
                </PrivateRoute>
              }
            />

            {/* College Administrator only routes */}
            <Route
              path='/maindash'
              element={
                <PrivateRoute>
                  <RoleBasedRoute allowedRoles={["04"]}>
                    <MainDash />
                  </RoleBasedRoute>
                </PrivateRoute>
              }
            />
            <Route
              path='/publication'
              element={
                <PrivateRoute>
                  <RoleBasedRoute allowedRoles={["04"]}>
                    <PubDash />
                  </RoleBasedRoute>
                </PrivateRoute>
              }
            />

            {/* Other protected routes */}
            <Route
              path='/profile'
              element={
                <PrivateRoute>
                  <Profile />
                </PrivateRoute>
              }
            />

            {/* ... other routes ... */}
          </Routes>
        </ModalProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
