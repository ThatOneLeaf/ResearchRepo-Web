import React, { useState, useEffect } from "react";
import Home from "./pages/home";
import ReadMore from "./pages/readmore";
import Profile from "./pages/profile";
import PrivateRoute from "./components/privateroute";
import ManageUsers from "./pages/manageusers";
import ResearchThrust from "./pages/researchthrust";
import ResearchTracking from "./pages/researchtracking";
import UpdateTrackingInfo from "./pages/updatetrackinginfo";
import Collection from "./pages/collection";
import ManagePapers from "./pages/managepapers";
import ManageCollege from "./pages/managecollege";
import ManageProgram from "./pages/manageprogram";
import { CssBaseline } from "@mui/material";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import KnowledgeGraph from "./pages/knowledgegraph";
import { ModalProvider } from "./context/modalcontext";
import { AuthProvider } from "./context/AuthContext";
import MainDash from "./pages/maindash";
import PubDash from "./pages/pubdash";
import DisplayResearchInfo from "./pages/displayresearchinfo";
import DisplayAuditLog from "./pages/auditlog";
import RoleBasedRoute from "./components/rolebasedroute";
import DashEmbed from "./pages/DashEmbed";
import SDGdashEmbed from "./pages/SDGdashEmbed";

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
            <Route path='/dash' element={<DashEmbed />} />
            <Route path='/dash/analytics' element={<SDGdashEmbed />} />

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

            <Route
              path='/displayresearchinfo/:id'
              element={
                <PrivateRoute>
                  <DisplayResearchInfo />
                </PrivateRoute>
              }
            />

            <Route
              path='/updatetrackinginfo'
              element={
                <PrivateRoute>
                  <RoleBasedRoute allowedRoles={["05"]}>
                    <UpdateTrackingInfo />
                  </RoleBasedRoute>
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
              path='/dash'
              element={
                <PrivateRoute>
                  <RoleBasedRoute allowedRoles={["04", "05", "02"]}>
                    <DashEmbed />
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
