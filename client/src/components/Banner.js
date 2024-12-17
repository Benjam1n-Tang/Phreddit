import Cookies from 'js-cookie';
import { useLocation, useNavigate, Link } from "react-router-dom";
import {useState, useEffect} from 'react';


export default function Banner(props) {
    const navigate = useNavigate();
    const location = useLocation();
    const [userSearch, setUserSearch] = useState('');
    const [currentUser, setCurrentUser] = useState(null);

    const logOut = () => {
        console.log('logging out');
        Cookies.remove('token', {
          sameSite: 'None',
          secure: true
        });

        navigate('/welcome');
    };
    

    const goToNewPost = () => {
        const isNewCommunity = location.pathname.startsWith('/newPost');
        if (!isNewCommunity) {
            navigate('/newPost'); 
        }
    };

    const goToProfile = (userDisplayName) => {
      navigate(`/userProfile/${userDisplayName}`);
      window.location.reload();
    };

    const handleChange = (e) => {
        setUserSearch(e.target.value);
    };

    const handleSubmit = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            navigate(`/search/${userSearch}`);
            setUserSearch('');
        }
    };

    const showUser = async () => {
        const token = Cookies.get('token');  
      
        try {
          const response = await fetch('http://localhost:8000/user', {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${token}`, 
            },
          });
      
          if (response.status === 404) {
            return;
          }

          if (!response.ok) {
            throw new Error('Failed To Fetch User Details.');
          }

          const userData = await response.json();

          setCurrentUser(userData);

        } catch (error) {

          console.error('Error fetching user:', error);
        }
    };

    useEffect(() => {
        if (Cookies.get("token")) {
          showUser();
        }
      }, []);



    return (
        <div className='page-banner'> 

            <button className='banner-phreddit-button' onClick={() => navigate('/welcome')}>
                <ion-icon name="happy"></ion-icon>
                <h1> phreddit </h1>
            </button>

            <form className='search-bar'>
                  <ion-icon  name="search-outline"> </ion-icon>
                    <input type='text' value={userSearch} placeholder='Search Phreddit...' onChange={handleChange} onKeyDown={handleSubmit} />
            </form>
                {Cookies.get('token') && currentUser ? ( <div className='banner-buttons-container'>

            <button className={ window.location.pathname.startsWith('/newPost') ? 'banner-button active-banner-button' : 'banner-button inactive-banner-button '} onClick={goToNewPost}> 
              <ion-icon  name="add-outline"> </ion-icon>
              <p> Create Post </p>
            </button>

            <button className='banner-button inactive-banner-button' onClick={logOut}> 
              <p> Log Out </p> </button>

            
            <button className={ currentUser && window.location.pathname.startsWith('/userProfile') && window.location.pathname.split('/userProfile/')[1] === currentUser.displayName ?  'banner-user-button active-banner-button' : 'banner-user-button inactive-banner-button'} onClick={() => goToProfile(currentUser.displayName)}>
            <ion-icon name="person-circle-outline"></ion-icon>
            <p> {currentUser.admin ? `a/${currentUser.displayName}` : `u/${currentUser.displayName}`}   </p>
            </button>


          </div>
          ) : (
          <div className='banner-buttons-container'>
          <button className='banner-button dead-button'> 
          <ion-icon  name="add-outline"> </ion-icon>
          <p> Create Post </p>
            </button>
          <button className='banner-button dead-button'> 
            <p> Guest </p>
          </button>
          </div>
          )}
          </div>
          );
}
