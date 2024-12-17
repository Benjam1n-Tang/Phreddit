// ************** THIS IS YOUR APP'S ENTRY POINT. CHANGE THIS FILE AS NEEDED. **************
// ************** DEFINE YOUR REACT COMPONENTS in ./components directory **************

import { Outlet, Routes, Route, Navigate,  BrowserRouter, useParams, useLocation } from 'react-router-dom';
import React, { useState, useEffect } from "react";
import axios from 'axios';

import Cookies from 'js-cookie';

import NetworkError from './components/NetworkError.js'
import WelcomePage from './components/WelcomePage.js';
import RegisterPage from './components/RegisterPage.js';
import LoginPage from './components/LoginPage.js';
import CommunityPage from './components/CommunityPage.js';
import UserProfilePage from './components/UserProfilePage.js';

import ChangeCommunityPage from './components/ChangeCommunityPage.js';
import ChangePostPage from './components/ChangePostPage.js';
import ChangeCommentPage from './components/ChangeCommentPage.js';


import ErrorBoundary from './components/ErrorBoundary.js';
import PostPage from './components/PostPage.js';

import Banner from './components/Banner.js';
import HomePage from './components/HomePage.js';
import Navigation from './components/Navigation.js';
import SearchPage from './components/SearchPage.js';

import NewCommunity from './components/NewCommunity.js';
import NewPostPage from './components/NewPostPage.js';
import NewCommentPage from './components/NewCommentPage.js';



const FeedLayout = () => {
  const location = useLocation();

  return (
    <ErrorBoundary>
      <div className='page-vertical'>
        <Banner key={location.pathname} />
        <div className='page-horizontal'>
          <Navigation key={location.pathname} />
          <Outlet />
        </div>
      </div>
    </ErrorBoundary>
  );
};

export default function App() {
  const [user, setUser] = useState();
  const [networkError, setNetworkError] = useState(null);

  const showUser = async () => {
    const token = Cookies.get('token') ?? '';

    try {
      const response = await axios.get('http://localhost:8000/user', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        validateStatus: (status) => {
          return status === 200 || status === 404 || status === 500;
        },
      });

      if (response.status === 200) {
        setUser(response.data);
        setNetworkError(null);
      } else if (response.status === 404) {
        Cookies.remove('token', {
          sameSite: 'None',
          secure: true
        });
        setNetworkError(null);
      } else if (response.status === 500) {
        Cookies.remove('token', {
          sameSite: 'None',
          secure: true
        });
        console.log('Server error');
        setNetworkError('Internal server error.');
      }
    } catch (err) {
      if (err.response) {
        console.log('Error with response:', err.response);
        setNetworkError('Error fetching data from server.');
      } else {
        console.log('Network or CORS error');
        setNetworkError('Unable to communicate with the server. The server may be down or there might be a CORS issue.');
      }
    }
  };

  useEffect(() => {
    showUser();
  }, []);



  function SearchRedirect() {
    const { userSearch } = useParams(); 
    return <Navigate to={`/search/newest/${userSearch}`} />;
  }

  function CommunityRedirect() {
    const { communityID } = useParams(); 
    return <Navigate to={`/community/newest/${communityID}`} />;
  }


  return (
    <>
      {networkError ? (
        <BrowserRouter>
          <ErrorBoundary>
            <Routes>
              <Route path="*" element={<Navigate to="/errorPage" />} />
              <Route path="/errorPage" element={<NetworkError />} />
              <Route path="/welcome" element={<WelcomePage />} />
            </Routes>
          </ErrorBoundary>
        </BrowserRouter>
      ) : (
        <BrowserRouter>
          <ErrorBoundary>
            <Routes>
              <Route path="/" element={user ? <Navigate to='/home' /> : <Navigate to='/welcome' />} />
  
              <Route path="/welcome" element={<WelcomePage />} />
              <Route path='/register' element={<RegisterPage />} />
              <Route path='/login' element={<LoginPage />} />
  
              <Route path="/" element={<FeedLayout />}>
                <Route path="home" element={<Navigate to="/home/newest" />} />
                <Route path="home/:sort" element={<div className='main-content'><HomePage /></div>} />
  
                <Route path="search" element={<Navigate to="/search/phreddit" />} />
                <Route path="search/:userSearch" element={<SearchRedirect />} />
                <Route path="search/:sort/:userSearch" element={<div className='main-content'><SearchPage /></div>} />
  
                <Route path="community/:communityID" element={<CommunityRedirect />} />
                <Route path="community/:sort/:communityID" element={<div className='main-content'><CommunityPage /></div>} />
  
                <Route path="post/:postID" element={<div className='main-content'><PostPage /></div>} />
  
                <Route path="newCommunity" element={<div className='main-content'><NewCommunity /></div>} />
  
                <Route path="newPost" element={<div className='main-content'><NewPostPage /></div>} />
  
                <Route path="newComment/:postID/:parentID" element={<div className='main-content'><NewCommentPage /></div>} />

                <Route path='userProfile/:displayName' element={<div className='main-content'><UserProfilePage /></div>} />

                <Route path='changeCommunity/:communityID' element={<div className='main-content'><ChangeCommunityPage /></div>} />

                <Route path='changePost/:postID' element={<div className='main-content'><ChangePostPage /></div>} />

                <Route path='changeComment/:postID/:commentID' element={<div className='main-content'><ChangeCommentPage /></div>} />
              </Route>
  
              <Route path="*" element={<Navigate to="/welcome" />} />
            </Routes>
          </ErrorBoundary>
        </BrowserRouter>
      )}
    </>
  );
}