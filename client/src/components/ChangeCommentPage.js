import {useState, useEffect} from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import * as Yup from "yup";
import Cookies from 'js-cookie';


export default function ChangeCommentPage() {
    const navigate = useNavigate();
    const { postID, commentID } = useParams();

    const [newComment, setNewComment] = useState({
        commentContent: '',
    });
    const [errors, setErrors] = useState({});

    const getComment = async () => {
        try {
            const response = await fetch(`http://localhost:8000/comment/${commentID}`, {
              method: 'GET',
            });
        
            if (response.status === 404) {
              return;
            }
  
            if (!response.ok) {
              throw new Error('Failed To Fetch User Details.');
            }
  
            const comment = await response.json();
            setNewComment({
                commentContent: comment.content || '', 
            });
  
          } catch (error) {
  
            console.error('Error fetching user:', error);
          }
    };   


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

    const handleDeleteComment = async () => {
        const isConfirmed = window.confirm("Are you sure you want to delete this comment?");
        if (isConfirmed) {  
            try {
                const response = await fetch(`http://localhost:8000/deleteComment/${commentID}`, {
                    method: 'DELETE',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                });
    
                if (!response.ok) {
                    throw new Error('Failed to delete comment');
                }
    
                navigate('/home');
            } catch (error) {
                console.error('Error deleting comment:', error);
            }
        } else {
            console.log('Deletion cancelled');
        }
    };


    useEffect(() => {
        getComment();
      }, []);


    const validationSchema = Yup.object({
        commentContent:  Yup.string().min(5, 'Comment Content Must Be At Least 5 Characters.').max(500, 'Comment Content Cannot Be Longer Than 500 Characters').required('Comment Must Have Content.')
    });

    const handleSubmit = async (e) => {
        e.preventDefault();
        const token = Cookies.get('token') ?? '';
    
        setErrors({});
        console.log('this is commentid: ' + commentID);
        try {
            await validationSchema.validate(newComment, { abortEarly: false });
            
            const response = await fetch(`http://localhost:8000/changeComment/${commentID}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    commentContent: newComment.commentContent,
                }),
            });

            if (!response.ok) {
                throw new Error('Failed to change comment');
            }


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
                <h1> Change Comment </h1>

            </div>
            <form onSubmit={handleSubmit} className='content-credential-form'>
                <div className='input-field'>
                    <label> *Comment Content: </label>
                    <input type='text' placeholder='Comment Content' name='commentContent' onChange={handleChange} value={newComment.commentContent} />
                    <div className="input-error">{errors.commentContent} </div>
                </div>
                <button type='submit' className='submit-form-button'> Change Comment </button>
                <button type='button' onClick={handleDeleteComment} className='delete-community-button'>
                        Delete Comment
                    </button>
            </form>
            </div>
        </div>
    );
};
