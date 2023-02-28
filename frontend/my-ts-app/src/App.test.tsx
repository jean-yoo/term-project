import { render, screen, within } from '@testing-library/react';
import App from './App';
import React from 'react';
import { Profile } from '../src/pages/profile/profile'
import { Home, login_button_text, TEXT_title } from './pages/home/home';
import Book from './pages/book/book';
import userEvent from '@testing-library/user-event';

// test('renders learn react link', () => {
//   render(<App />);
//   const linkElement = screen.getByText(/learn react/i);
//   expect(linkElement).toBeInTheDocument();
// });

// PROFILE: Tests whether the profile title is correctly rendered when the user is NOT signed in
test('renders not signed in title', () => {
  render(<Profile/>);
  const titleElement = screen.getByText("Not signed in");
  expect(titleElement).toBeInTheDocument();
});

// PROFILE: Tests whether the profile title is correctly rendered when the user IS signed in
test('renders sign out button', () => {
  localStorage.setItem('login', 'true')
  localStorage.setItem('userName', 'Patrick')
  render(<Profile/>);
  const titleElement = screen.getByText("Here are your current trips, Patrick");
  expect(titleElement).toBeInTheDocument();
});

// HOME: Tests whether the title is being displayed on the home page
test('renders login button', () => {
  localStorage.setItem('login', 'false')
  render(<Home/>);
  const headingElement = screen.getByRole('heading', {level: 1})
  expect(headingElement).toBeInTheDocument();
});

// HOME: Tests whether the login button is rendered when the user first loads the home page
test('renders title', () => {
  render(<Home/>);
  // Only 1 button on the home page when the user is signed out
  const homeTitle = screen.getByRole('button');
  expect(homeTitle).toBeInTheDocument();
});

// PROFILE: Tests for when the user clicks sign out, they can no longer view their trips
test('testing sign out functionality', () => {
  localStorage.setItem('login', 'true')
  localStorage.setItem('userName', 'Patrick')
  render(<Profile/>);
  const signOutButton = screen.getByRole('button');
  userEvent.click(signOutButton)
  render(<Profile/>);
  const titleElement = screen.getByText("Not signed in");
  expect(titleElement).toBeInTheDocument();
});

// HOME: Testing login functionality and seeing if the users (and/or their trips) are displayed
test('testing login functionality', () => {
  render(<Home/>);
  localStorage.setItem('login', 'true')
  localStorage.setItem('userName', 'Patrick')
  const logInButton = screen.getByRole('button');
  userEvent.click(logInButton)
  render(<Home/>);
  const matchedTrips = screen.getByTestId('text')
  const heading = within(matchedTrips).getByText('Here are your matched trips, Patrick')
  expect(heading).toBeInTheDocument();
});