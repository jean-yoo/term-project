import React from 'react';
import './App.css';
import Navbar from './components/Navbar';
import { BrowserRouter as Router, Routes, Route}
    from 'react-router-dom';
import Book from './pages/book/book';
import { Profile } from './pages/profile';
import { Home } from './pages/home';

/**
 * Sets up the webapp with 3 different endpoints that route to 3 different pages
 * with a navigation bar
 * @returns Router, Navbar components
 */
function App() {
return (
    <Router>
    <Navbar />
    <Routes>
      <Route path='/' element={<Home />} />
      <Route path='/profile' element={<Profile/>} />
      <Route path='/book' element={<Book/>} />
    </Routes>
    </Router>
);
}
  
export default App;