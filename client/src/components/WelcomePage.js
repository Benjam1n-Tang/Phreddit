import React, { useEffect, useState } from 'react';
import Cookies from 'js-cookie';
import { useNavigate } from 'react-router-dom';


export default function WelcomePage() {
    const navigate = useNavigate();
    const [user, setUser] = useState();

    const showUser = async () => {
        const token = Cookies.get('token');  
        
        if (!token) {
          console.log('No token found');
          return;
        }
        const tok = Cookies.get('token');
      
        try {
          const response = await fetch('http://localhost:8000/user', {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${tok}`,  
            },
          });
      
          if (response.status === 404) {
            return;
          }

          if (!response.ok) {
            throw new Error('Failed To Fetch User Details.');
          }

          if (response.ok) {
            const user = await response.json();
            setUser(user);
          }
    
        } catch (error) {
          console.error('Error fetching user:', error);
        }
      };



    useEffect(() => {
        showUser();
      }, []);



    return (
        <div className='page-center'> 
            <div className='welcome-form-container'>
                <div className='welcome-form-greeting'>
                    <ion-icon name="happy"></ion-icon>
                    <h1> Welcome to Phreddit! </h1>
                </div>
                <div className='welcome-form-button-container'>
                    <button className='welcome-button' onClick={() => navigate('/register')}> Register As New User </button>
                    <button className='welcome-button' onClick={() => navigate('/login')}> Login As Existing User  </button>
                    {!user ? <button className='welcome-button' onClick={() => navigate('/home')}> Continue as Guest </button> : <button className='welcome-button' onClick={() => navigate('/home')}> Continue Login </button> }
                </div>
            </div>
        </div>
    );
};