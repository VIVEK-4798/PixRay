import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import Home from './container/Home';
import Login from './components/Login';
import ProtectedRoute from './components/ProtectedRoute';

const App = () => {
  const user = JSON.parse(localStorage.getItem('user'));

  return (
    <Router>
  <Routes>
    <Route path="/login" element={<Login />} />
    <Route 
      path="/home" 
      element={
        <ProtectedRoute user={user}>
          <Home />
        </ProtectedRoute>
      } 
    />
    <Route 
      path="/*" 
      element={
        <ProtectedRoute user={user}>
          <Home />
        </ProtectedRoute>
      } 
    />
  </Routes>
</Router>

  );
};

export default App;
