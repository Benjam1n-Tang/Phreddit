import {useState} from 'react';
import { useNavigate } from 'react-router-dom';
import * as Yup from "yup";
import Cookies from 'js-cookie';



export default function NewCommunity() {
    const navigate = useNavigate();

    const [newCommunity, setNewCommunity] = useState({
        communityName: '',
        communityDescription: '',
    });
    const [errors, setErrors] = useState({});

    const handleChange = (e) => {
        const { name, value } = e.target;
        setNewCommunity({...newCommunity, [name]:value});
    };

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
    
            if (data.isUnique) {
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
        const token = Cookies.get('token') ?? '';

        setErrors({});
        try {
            await validationSchema.validate(newCommunity, { abortEarly: false });
            
            const response = await fetch('http://localhost:8000/communities', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({
                    communityName: newCommunity.communityName,
                    communityDescription: newCommunity.communityDescription,
                }),
            });

            if (!response.ok) {
                throw new Error('Failed to create community');
            }
            const createdCommunity = await response.json();
            navigate(`/community/${createdCommunity._id}`)

        } catch (error) {
            if (error.inner) {
                const newErrors = {};
                error.inner.forEach((err) => {
                    newErrors[err.path] = err.message;
                });
                setErrors(newErrors);
            } else {
                console.error('Error creating community:', error);
            }
        }
    };


    return (
        <div className='content-container'>
            <div>
            <div className='content-credential-name'>
                <h1> New Community </h1>

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
                <button type='submit' className='submit-form-button'> Engender Community </button>
            </form>
            </div>
        </div>
    );
};