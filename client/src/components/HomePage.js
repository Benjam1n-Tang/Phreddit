import Cookies from 'js-cookie';
import { useParams, useNavigate } from 'react-router-dom';
import React, { useState, useEffect } from "react";

export default function HomePage() {

    const navigate = useNavigate();
    const [posts, setPosts] = useState([]);
    const [postCount, setPostCount] = useState(0);
    const { sort } = useParams();
    
    const fetchData = async () => {
        const token = Cookies.get('token') ?? '';
        const headers = token
            ? { 'Authorization': `Bearer ${token}` }  
            : {};

        try {
          const response = await fetch(`http://localhost:8000/posts/home/${sort}`, {
            method: 'GET',
            headers: headers,
          });
          
          const data = await response.json();

          if (data.length === 2) {
            setPostCount(data[0].length + data[1].length);
            setPosts([data[0], data[1]]);
          } else {
            setPostCount(data[0].length);
            setPosts([data[0]]);
          }

        } catch (error) {
          console.error("Error fetching data:", error);
          setPosts([]);
          navigate(`/welcome`);
        }
    };


    const goToPost = async (postID) => {
      const token = Cookies.get('token');

    try {
    const response = await fetch(`http://localhost:8000/increaseViews/${postID}`, {
      method: 'PUT', 
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (response.status === 200) {
      navigate(`/post/${postID}`);
    } else {
      const errorData = await response.json();
      console.error('Error increasing views:', errorData.error);
    }
    } catch (error) {
      console.error('Error in goToPost function:', error);
    }
  };
    
      useEffect(() => {
        fetchData();
      }, [sort]);





      return (
        <div className='content-container'>
          <div>


          <div className='header-container'>
            <h4> All Posts </h4>
            <div className='sort-buttons-container'>
              <button className={sort === 'newest' ? 'sort-button active-sort-button' : 'sort-button inactive-sort-button'} onClick={() => navigate('/home/newest') }> Newest </button>
              <button className={sort === 'oldest' ? 'sort-button active-sort-button' : 'sort-button inactive-sort-button'} onClick={() => navigate('/home/oldest')}> Oldest </button>
              <button className={sort === 'active' ? 'sort-button active-sort-button' : 'sort-button inactive-sort-button'} onClick={() => navigate('/home/active')}> Active </button>
            </div>
          </div>

          <p className='post-count'> 
          {`${postCount} Post${postCount == 1 ? '' : 's'}`}
          </p>



          {posts.length > 0 ? (
            posts.map((postArray, index) => (
              <div key={index}>
                {posts.length === 2 && index === 0 && posts[0].length !== 0 && ( <h3 className='post-section-divider'> Joined Community Posts </h3> )}
                {((posts.length === 2 && index === 1 && posts[1].length !== 0) || (posts.length === 1 && posts[0].length !== 0)) && ( <h3 className='post-section-divider'> Posts </h3> )}



                {postArray.map((post) => (
                  <div className='post-button-container' key={post._id} >


                    <button className='post-button' onClick={() => goToPost(post._id)}>

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
                          <p> {post.content.substring(0, 80) + '...'} </p>
                      </div>
                      <div className='post-bottom'>
                          <p> {'Views: ' + post.views} </p>
                          <p> {'Comments: ' + post.commentCount} </p>
                          <p> {'Votes: ' + post.upVotes} </p>
                      </div>
                    </button>
                  </div>
                ))}
              </div>
            ))
          ) : (
            <p>No posts available</p>
          )}
          </div>
        </div>
      );
};