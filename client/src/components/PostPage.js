import Cookies from 'js-cookie';
import { useParams, useNavigate  } from 'react-router-dom';
import React, { useState, useEffect } from "react";

export default function PostPage() {
    const navigate = useNavigate();
    const { postID } = useParams();
    const [post, setPost] = useState(null);
    const [user, setUser] = useState();


    const fetchData = async () => {
        try {
          const response = await fetch(`http://localhost:8000/post/${postID}`, {
            method: 'GET',
          });
          
          const data = await response.json();

          setPost(data);

          } catch (error) {
              console.error("Error fetching data:", error);
              navigate(`/welcome`);
        }
    };

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
      
          const user = await response.json();
          setUser(user);
        } catch (error) {
          console.error('Error fetching user:', error);
        }
      };

    const upVote = async (itemID) => {
        const token = Cookies.get('token');
    
        try {
            const response = await fetch(`http://localhost:8000/increaseUpVoteCount/${itemID}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });
    
            if (response.status === 200) {
                await fetchData();
            } else {
                const errorData = await response.json();
                console.error('Error leaving community:', errorData.error);
            }
        } catch (error) {
            console.error('Error in leaveCommunity function:', error);
        }
    };

    const downVote = async (itemID) => {
        const token = Cookies.get('token');
    
        try {
            const response = await fetch(`http://localhost:8000/decreaseUpVoteCount/${itemID}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });
    
            if (response.status === 200) {
                await fetchData();
            } else {
                const errorData = await response.json();
                console.error('Error leaving community:', errorData.error);
            }
        } catch (error) {
            console.error('Error in leaveCommunity function:', error);
        }
    };

    useEffect(() => {
        fetchData();
        showUser();
      }, []);


      const goToNewCommentPage = (parentID) => {
        navigate(`/newComment/${postID}/${parentID}`);
      };


      const renderComments = (comments, depth = 0) => {
        return comments.map((comment) => (
            <div key={comment._id} style={{ marginLeft: `${depth * 20}px` }}>
                <div className='comment-containers'>
                    <div className='post-top'>
                        <p className='top-bold'> {'u/' + comment.commentedBy}</p>
                        <span> • </span>
                        <p className='top-text'> {comment.timeStamp} </p>
                    </div>
                    <div className='post-content'>
                        <p> {comment.content} </p>
                    </div>
                    <div className='post-bottom'>
                          <p> {'Votes: ' + comment.upVotes} </p>
                          {user ? (
            user.reputation >= 50 ? (
            <>
                <button className='comment-button' onClick={() => upVote(comment._id)}>Up Vote</button>
            <button className='comment-button' onClick={() => downVote(comment._id)}>Down Vote</button>
                    </>
        ) : (
         <>
            <button className='dead-comment-button'>Up Vote</button>
            <button className='dead-comment-button'>Down Vote</button>
            </>
        )
            ) : null}
                      </div>
                      {user ? <button className='comment-button' onClick={() => goToNewCommentPage(comment._id)}> Reply </button> : <button className='dead-comment-button'> Reply </button> }

                   
                </div>

                {comment.comments && renderComments(comment.comments, depth + 1)}
            </div>
        ));
    };


    if (!post) {
        return <p>Loading...</p>;
    }

    return (
        <div className='content-container inPost'>
            <div>
            <div className='post-container'>
                <div className='heading'>
                    {user && user.reputation < 50 && <h2> Your Reputation Is Too Low To Vote </h2>}
                </div>

            <div className='post-top'>
                          <ion-icon name="happy-outline"></ion-icon>

                          <p className='top-bold'> {'p/' + post.community} </p>
                          <span> • </span>
                          <p className='top-text'> {'u/' + post.postedBy} </p>
                          <span> • </span>
                          <p> {post.timeStamp} </p>
            </div>
            <div className='post-title'>
                          <h1> {post.title} </h1>
                      </div>
            <div className='post-link-flair'  style={{ display: post.linkFlairContent ? 'inline-flex' : 'none' }}>
                        <p> {post.linkFlairContent} </p>
            </div>
            <div className='post-content'>
                          <p> {post.content} </p>
            </div>
            <div className='post-bottom'>
                          <p> {'Views: ' + post.views} </p>
                          <p> {'Comments: ' + post.commentCount} </p>
                          <p> {'Votes: ' + post.upVotes} </p>

                          {user ? (
            user.reputation >= 50 ? (
            <>
                <button className='comment-button' onClick={() => upVote(post._id)}>Up Vote</button>
            <button className='comment-button' onClick={() => downVote(post._id)}>Down Vote</button>
                    </>
        ) : (
         <>
            <button className='dead-comment-button'>Up Vote</button>
            <button className='dead-comment-button'>Down Vote</button>
            </>
        )
            ) : null}

                      </div>

            {user ? <button className='comment-button' onClick={() => goToNewCommentPage(post._id)}> Comment </button> : <button className='dead-comment-button'> Comment</button> }


            <h3 className='blah'>Comments:</h3>
            {post.comments.length > 0 ? (
                renderComments(post.comments)
            ) : (
                <p>No comments yet.</p>
            )}
            </div>
            </div>
        </div>
    );
}