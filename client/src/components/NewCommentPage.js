import {useState} from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import * as Yup from "yup";
import Cookies from 'js-cookie';


export default function NewCommentPage() {
    const navigate = useNavigate();
    const { postID, parentID } = useParams();

    const [newComment, setNewComment] = useState({
        commentContent: '',
    });
    const [errors, setErrors] = useState({});

    const handleChange = (e) => {
        const { name, value } = e.target;
        setNewComment({...newComment, [name]:value});
    };

    const handleGoBack = () => {
        if (window.history.length > 2) {
            navigate(-1); 
        } else {
            navigate('/home'); 
        }
    };


    const validationSchema = Yup.object({
        commentContent:  Yup.string().min(5, 'Comment Content Must Be At Least 5 Characters.').max(500, 'Comment Content Cannot Be Longer Than 500 Characters').required('Comment Must Have Content.')
    });

    const handleSubmit = async (e) => {
        e.preventDefault();
        const token = Cookies.get('token') ?? '';
    
        setErrors({});

        try {
            await validationSchema.validate(newComment, { abortEarly: false });
            
            const response = await fetch('http://localhost:8000/comments', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({
                    commentContent: newComment.commentContent,
                    parentID: parentID,
                    postID: postID,
                }),
            });
            if (!response.ok) {
                throw new Error('Failed to create comment');
            }

            const postChange = await response.json();
            navigate(`/post/${postID}`)



        } catch (error) {
            if (error.inner) {
                const newErrors = {};
                error.inner.forEach((err) => {
                    newErrors[err.path] = err.message;
                });
                setErrors(newErrors);
            } else {
                console.error('Error creating comment:', error);
            }
        }
    };






    return (
        <div className='content-container'>
            <div>
            <div className='content-credential-name'>
                <h1> New Comment </h1>

            </div>
            <form onSubmit={handleSubmit} className='content-credential-form'>
                <div className='input-field'>
                    <label> *Comment Content: </label>
                    <input type='text' placeholder='Comment Content' name='commentContent' onChange={handleChange} value={newComment.commentContent} />
                    <div className="input-error">{errors.commentContent} </div>
                </div>
                <button type='submit' className='submit-form-button'> Submit Comment </button>
            </form>
            </div>
        </div>
    );
};
