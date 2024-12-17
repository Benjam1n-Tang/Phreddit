
import Cookies from 'js-cookie';
import { useLocation, useNavigate, Link } from "react-router-dom";
import React, { useState, useEffect } from "react";

export default function Navigation() {
    const navigate = useNavigate();
    const location = useLocation();
    const [communities, setCommunities] = useState([]);


    const goToHome = () => {
        const isHomePage = location.pathname.startsWith('/home');
        if (!isHomePage) {
            navigate('/home'); 
        }
    };

    const goToNewCommunity = () => {
        const isNewCommunityPage = location.pathname.startsWith('/newCommunity');
        if (!isNewCommunityPage) {
            navigate('/newCommunity');
        }
    };

    const goToCommunity = (communityID) => {
        const communityPage = location.pathname === `/community/${communityID}`;
        if (!communityPage) {
            navigate(`/community/${communityID}`);
        }
    };

    const fetchData = async () => {
        const token = Cookies.get('token') ?? '';
        const headers = token
            ? { 'Authorization': `Bearer ${token}` }  
            : {};

        try {
          const response = await fetch(`http://localhost:8000/communities`, {
            method: 'GET',
            headers: headers,
          });
          
          const data = await response.json();

          if (data.length === 2) {
            setCommunities([data[0], data[1]]);
          } else {
            setCommunities([data[0]]);
          }

        } catch (error) {
          console.error("Error fetching data:", error);
          setCommunities([]);
        }
    };

    useEffect(() => {
        fetchData();
      }, []);
    
    return (
        <div className='navigation'> 
            <div className='navigation-container'>
                <div className='navigation-section-container'>
                  <h2 className='navigation-titles'> Actions </h2>
                  <button className={ window.location.pathname.startsWith('/home') ? 'navigation-button activated-action-button' : 'navigation-button inactive-action-button'} onClick={goToHome}>
                    <ion-icon name="home"></ion-icon>
                    <p> Home </p>
                  </button>
                  {communities.length > 1 ? <button className={ window.location.pathname.startsWith('/newCommunity') ? 'navigation-button activated-action-button' : 'navigation-button inactive-action-button'} onClick={goToNewCommunity}> <ion-icon id='addIcon' name="add"></ion-icon>
                    <p id='navButtonText'> Create Community </p> </button> : <button className='dead-button navigation-button'> <ion-icon id='addIcon' name="add"></ion-icon>
                    <p id='navButtonText'> Create Community </p> </button>}
                </div>

              {communities.length > 0 ? (
                communities.map((communityArray, index) => (

                <div className='navigation-section-container' key={index}>
                  
                  {communities.length === 2 && index === 0 && ( <h3 className='navigation-titles'>Joined Communities</h3> )}
                  {((communities.length === 2 && index === 1) || communities.length === 1) && ( <h3 className='navigation-titles'>Communities</h3> )}

                  {communityArray.map((community) => (
                    <button  className={ window.location.pathname.includes(community._id) ? 'navigation-button activated-community-button' : 'navigation-button inactive-community-button'} key={community._id} onClick={() => goToCommunity(community._id)}>
                      <ion-icon name="happy-outline"></ion-icon>
                      <p> {'p/' + community.name} </p>
                    </button>
                  ))}
                </div>
              ))
            ) : (
              <p> No Communities. </p>
            )}

            </div>
        </div>
    );
}
