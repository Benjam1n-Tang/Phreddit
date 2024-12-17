import {useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import * as Yup from "yup";
import Cookies from 'js-cookie';

export default function ChangeCommunityPage() {
    const navigate = useNavigate();

    const { communityID } = useParams();

    const [community, setCommunity] = useState(null);
    const [newCommunity, setNewCommunity] = useState({
        communityName: '',
        communityDescription: '',
    });
    const [currentUser, setCurrentUser] = useState(null);


    const [errors, setErrors] = useState({});

    const handleChange = (e) => {
        const { name, value } = e.target;
        setNewCommunity({...newCommunity, [name]:value});
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
          console.log('hey user');

        } catch (error) {

          console.error('Error fetching user:', error);
        }
    };

    const getCommunity = async () => {
        try {
            const response = await fetch(`http://localhost:8000/community/${communityID}`, {
              method: 'GET',
            });
        
            if (response.status === 404) {
              return;
            }
  
            if (!response.ok) {
              throw new Error('Failed To Fetch User Details.');
            }
  
            const community = await response.json();
            console.log(community);
            setCommunity(community);
            setNewCommunity({
                communityName: community.name || '', 
                communityDescription: community.description || '',
            });
  
          } catch (error) {
  
            console.error('Error fetching user:', error);
          }
    };
    


    useEffect(() => {
        getCommunity();
        if (Cookies.get("token")) {
          showUser();
        }
      }, []);

    const handleGoBack = () => {
        if (window.history.length > 2) {
            navigate(-1); 
        } else {
            navigate('/home'); 
        }
    };

    const checkCommunityExists = async (name) => {
        try {
            const response = await fetch(`http://localhost:8000/communityExists?name=${name}`);
            const data = await response.json();
    
            if (data.isUnique || (community && community.name === name)) {
                return false; 
            } else {
                return true;  
            }
        } catch (error) {
            console.error('Error checking name:', error);
            return false;
        }
    };

    const validationSchema = Yup.object({
        communityName:  Yup.string().min(5, 'Community Name Mst Be At Least 5 Characters').max(100, 'Community Name Cannot Be Longer Than 100 Characters').required('A Community Must Have A Name.')
                         .test('communityExists', 'Community Name Already Exists', async function(value) {
                            if (!value) return true; 
                            const isUnique = await checkCommunityExists(value); 
                            return !isUnique; 
                        }),
        communityDescription:   Yup.string().min(5, 'Community Description Must Be At Least 5 Characters').max(500, 'Community Description Cannot Be Longer Than 100 Characters.').required('A Community Must Have a Description.')
    });


    const handleSubmit = async (e) => {
        e.preventDefault();

        setErrors({});

        try {
            await validationSchema.validate(newCommunity, { abortEarly: false });
            const response = await fetch(`http://localhost:8000/changeCommunity/${communityID}`, {
                method: 'PUT',
                headers: {
                'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    communityName: newCommunity.communityName,
                    communityDescription: newCommunity.communityDescription,
                }),
            });

            if (!response.ok) {
                throw new Error('Failed to change community');
            }
            const changedCommunity = await response.json();
            navigate(`/community/${changedCommunity._id}`);

        } catch (error) {
            if (error.inner) {
                const newErrors = {};
                error.inner.forEach((err) => {
                    newErrors[err.path] = err.message;
                });
                setErrors(newErrors);
            } else {
                console.error('Error changing community:', error);
            }
        }
    };

    const handleDeleteCommunity = async () => {
        const isConfirmed = window.confirm("Are you sure you want to delete this community?");
        if (isConfirmed) {  
            try {
                const response = await fetch(`http://localhost:8000/deleteCommunity/${communityID}`, {
                    method: 'DELETE',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                });
    
                if (!response.ok) {
                    throw new Error('Failed to delete community');
                }
    
                navigate('/home');
            } catch (error) {
                console.error('Error deleting community:', error);
            }
        } else {
            console.log('Deletion cancelled');
        }
    };

    return (
        <div className='content-container'>
            <div>
            <div className='content-credential-name'>
                <h1> Change Community </h1>

            </div>
                <form onSubmit={handleSubmit} className='content-credential-form'>
                <div className='input-field'>
                    <label> *Community Name: </label>
                    <input type='text' placeholder='Community Name' name='communityName' onChange={handleChange} value={newCommunity.communityName} />
                    <div className="input-error">{errors.communityName} </div>
                </div>
                <div className='input-field'>
                    <label> *Community Description: </label>
                    <input type='text' placeholder='Community Description' name='communityDescription' onChange={handleChange} value={newCommunity.communityDescription} />
                    <div className="input-error">{errors.communityDescription} </div>
                </div>
                <button type='submit' className='submit-form-button'> Change Community </button>
                <button type='button' onClick={handleDeleteCommunity} className='delete-community-button'>
                        Delete Community
                    </button>
            </form>
            </div>
        </div>
    );
};