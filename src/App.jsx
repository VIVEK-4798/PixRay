import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { storage } from './firebase/setup';

import Home from './container/Home';
import Login from './components/Login';

const App = () => {
  return (
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/*" element={<Home />} />
      </Routes>
  );
};

export default App;
