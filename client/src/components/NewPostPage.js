import {useState, useEffect} from 'react';
import { useNavigate } from 'react-router-dom';
import * as Yup from "yup";
import Cookies from 'js-cookie';


export default function NewPostPage() {
    const navigate = useNavigate();
    
    const [communities, setCommunities] = useState([]);
    const [linkFlairs, setLinkFlairs] = useState([]);


    const [newPost, setNewPost] = useState({
        postTitle: '',
        postLinkFlair: '',
        customLinkFlair: '',
        postCommunity: '',
        postContent: '', 
    });


    const [errors, setErrors] = useState({});

    const handleChange = (e) => {
        const { name, value } = e.target;
        setNewPost({...newPost, [name]:value});
    };

    const handleGoBack = () => {
        if (window.history.length > 2) {
            navigate(-1); 
        } else {
            navigate('/home'); 
        }
    };

    const fetchCommunityData = async () => {
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


    const fetchLinkFlairData = async () => {
        try {
            const response = await fetch(`http://localhost:8000/linkflairs`, {
                method: 'GET',
              });
            const data = await response.json();
            setLinkFlairs(data);
        } catch (error) {
            console.error("Error fetching data:", error);
            setLinkFlairs([]);
        }

    };

    useEffect(() => {
        fetchCommunityData();
        fetchLinkFlairData();
      }, []);








    const validationSchema = Yup.object({
        postTitle:  Yup.string().min(5, 'Post Title Must Be At Least 5 Characters').max(100, 'Post Title Cannot Be Longer Than 100 Characters.').required('A Community Must Have A Name.'),
        postLinkFlair: Yup.string(),
        customLinkFlair: Yup.string().max(30, 'LinkFlair Cannot Be More Than 30 Characters.'),
        postCommunity: Yup.string().required('You Must Include Your Post In A Community.'),
        postContent:   Yup.string().min(5, 'Post Content must be at least 5 characters').required('A Post Must Have Content.'),
    });



    const handleSubmit = async (e) => {
        e.preventDefault();
        const token = Cookies.get('token') ?? '';


        setErrors({});
        try {
            await validationSchema.validate(newPost, { abortEarly: false });
            
            const response = await fetch('http://localhost:8000/posts', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({
                    postTitle: newPost.postTitle,
                    postLinkFlair: newPost.postLinkFlair,
                    customLinkFlair: newPost.customLinkFlair,
                    postCommunity: newPost.postCommunity,
                    postContent: newPost.postContent,
                }),
            });

            if (!response.ok) {
                throw new Error('Failed to create post');
            }
            const createdPost = await response.json();

            navigate(`/post/${createdPost._id}`);

        } catch (error) {
            if (error.inner) {
                const newErrors = {};
                error.inner.forEach((err) => {
                    newErrors[err.path] = err.message;
                });
                setErrors(newErrors);
            } else {
                console.error('Error creating post:', error);
            }
        }
    };


    return (
        <div className='content-container'>
            <div>

            <div className='content-credential-name'>
                <h1> New Post </h1>

            </div>
            <form onSubmit={handleSubmit} className='content-credential-form'>
                <div className='input-field'>
                    <label> *Post Title: </label>
                    <input type='text' placeholder='Post Title' name='postTitle' onChange={handleChange} value={newPost.postTitle} />
                    <div className="input-error">{errors.postTitle} </div>
                </div>
                <div className='input-field'>
                    <label> *Post Content: </label>
                    <input type='text' placeholder='Post Content' name='postContent' onChange={handleChange} value={newPost.postContent} />
                    <div className="input-error">{errors.postContent} </div>
                </div>
                <div className='input-field'>
                    <label> *Choose a Community: </label>
                    <select name="postCommunity" onChange={handleChange} value={newPost.postCommunity}>
                        <option value="">Select a community</option>
                        {communities.length > 0 ? (
                            communities.map((communityArray, index) => (
                                communityArray.map((community) => (
                                    <option key={community._id} value={community._id}>
                                        {community.name}
                                    </option>
                                ))
                            ))
                        ) : (
                            <option value="" disabled>No Communities available</option>
                        )}
                    </select>
                    <div className="input-error">{errors.postCommunity} </div>
                </div>
                <div className='input-field'>
                        <label>Choose a LinkFlair: </label>
                        <select name="postLinkFlair" onChange={handleChange} value={newPost.postLinkFlair}>
                            <option value="">Select a LinkFlair</option>
                            {linkFlairs.length > 0 ? (
                                linkFlairs.map((linkFlair) => (
                                    <option key={linkFlair._id} value={linkFlair._id}>
                                        {linkFlair.content}
                                    </option>
                                ))
                            ) : (
                                <option value="" disabled>No LinkFlairs available</option>
                            )}
                        </select>
                        <div className="input-error">{errors.postLinkFlair}</div>
                </div>
                <div className='input-field'>
                        <label> Custom Linkflair: </label>
                        <input type='text' placeholder='Custom Linkflair' name='customLinkFlair' onChange={handleChange} value={newPost.customLinkFlair} />
                        <div className="input-error">{errors.customLinkFlair} </div>
                    </div>        

                    <button type='submit' className='submit-form-button'> Submit Post </button>
                </form>
                </div>             
            </div>
            );
}