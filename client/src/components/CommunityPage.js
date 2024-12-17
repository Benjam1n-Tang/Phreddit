import Cookies from 'js-cookie';
import { useParams, useNavigate  } from 'react-router-dom';
import React, { useState, useEffect } from "react";

export default function CommunityPage() {
    const navigate = useNavigate();
    const [posts, setPosts] = useState([]);
    const [community, setCommunity] = useState(null);
    const [postCount, setPostCount] = useState(0);
    const { sort, communityID } = useParams();
    
    const fetchData = async () => {
        const token = Cookies.get('token') ?? '';
        const headers = token
            ? { 'Authorization': `Bearer ${token}` }  
            : {};
        try {
          const response = await fetch(`http://localhost:8000/posts/community/${sort}/${communityID}`, {
            method: 'GET',
            headers: headers,
          });
          
          const data = await response.json();
            setPostCount(data[0].length);
            setPosts([data[0]]);
            setCommunity(data[1]);

          } catch (error) {

          setPosts([]);
        }
    };


    const joinCommunity = async () => {
      const token = Cookies.get('token');

      try {
          const response = await fetch(`http://localhost:8000/joinCommunity/${communityID}`, {
              method: 'PUT', 
              headers: {
                  'Authorization': `Bearer ${token}`,
                  'Content-Type': 'application/json',
              },
          });

          if (response.status === 200) {
              window.location.reload();
          } else {
              const errorData = await response.json();
              console.error('Error joining community:', errorData.error);
          }
      } catch (error) {
          console.error('Error in joinCommunity function:', error);
      }
    };

    const leaveCommunity = async () => {
      const token = Cookies.get('token');
  
      try {
          const response = await fetch(`http://localhost:8000/leaveCommunity/${communityID}`, {
              method: 'PUT',
              headers: {
                  'Authorization': `Bearer ${token}`,
                  'Content-Type': 'application/json',
              },
          });
  
          if (response.status === 200) {
              window.location.reload();
          } else {
              const errorData = await response.json();
              console.error('Error leaving community:', errorData.error);
          }
      } catch (error) {
          console.error('Error in leaveCommunity function:', error);
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
            <h4> {community && 'p/' + community.name}  </h4>
            <div className='sort-buttons-container'>
              <button className={sort === 'newest' ? 'sort-button active-sort-button' : 'sort-button inactive-sort-button'} onClick={() => navigate(`/community/newest/${communityID}`) }> Newest </button>
              <button className={sort === 'oldest' ? 'sort-button active-sort-button' : 'sort-button inactive-sort-button'} onClick={() => navigate(`/community/oldest/${communityID}`)}> Oldest </button>
              <button className={sort === 'active' ? 'sort-button active-sort-button' : 'sort-button inactive-sort-button'} onClick={() => navigate(`/community/active/${communityID}`)}> Active </button>
            </div>
          </div>

          {community && (
  <div>
    <div id='communityBanner'>
      <ion-icon id='communityImg' name="happy-outline"></ion-icon>
      <h1 id='communityName'> {'p/' + community.name} </h1>
    </div>

    <div id='communityDescriptionContainer'>
      <div id='communityDescription'>
        <p id='aboutCommunity'> Description: </p>
        <p id='description'> {community.description} </p>
        <div className='communityDivide'>
          <p id='communityTime'> {'Created By: ' + community.creator} </p>
          <p id='communityTime'> {'Created: ' + community.timeStamp}</p>
        </div>
      </div>
    </div>
    {(community && !community.isUserMember && Cookies.get('token')) && <div className='join-leave-community'> <button  onClick={joinCommunity}> Join Community</button> </div> }
    {(community && community.isUserMember && Cookies.get('token')) && <div className='join-leave-community'> <button  onClick={leaveCommunity}> Leave Community</button> </div>}
  </div>
)}
          <div className='idk'>
            <p className='post-count'> 
            {`${postCount} Post${postCount == 1 ? '' : 's'}`}
            </p>
            <p className='post-count'> 
            {community && `${community.members.length} Member${postCount == 1 ? '' : 's'}`}
            </p>
          </div>


          {posts.length > 0 ? (
            posts.map((postArray, index) => (
              <div key={index}>
                {posts.length === 2 && <h3>Post Set {index + 1}</h3>} 
                {postArray.map((post) => (
                  <div className='post-button-container' key={post._id}>


                  <button className='post-button' onClick={() => goToPost(post._id)}>

                    <div className='post-top'>

                        <ion-icon  name="person-circle-outline"></ion-icon>
                        <p className='top-bold'> {'u/' + post.postedBy} </p>
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