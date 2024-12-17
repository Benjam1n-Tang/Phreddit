import Cookies from 'js-cookie';
import { useParams, useLocation, useNavigate, Link } from "react-router-dom";
import axios from 'axios';
import {useState, useEffect} from 'react';

export default function UserProfilePage() {
    const navigate = useNavigate();
    const [pageUser, setPageUser] = useState(null);


    const [currentUser, setCurrentUser] = useState(null);
    const [communities, setCommunities] = useState(null);
    const [posts, setPosts] = useState(null);
    const [users, setUsers] = useState(null)
    const [comments, setComments] = useState(null);
    const [activeTab, setActiveTab] = useState('communities');


    const { displayName } = useParams();


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


    const showPageUser = async () => {
        try {
            
            const response = await axios.get(`http://localhost:8000/pageUser/${displayName}`, {
            });
    
            if (response.status === 200) {
                const { userDetails, communities, posts, comments, users } = response.data; 
                
                setPageUser(userDetails);

                console.log(communities); 
                setCommunities(communities);

                console.log(posts); 
                setPosts(posts);
                console.log(comments); 
                setComments(comments);


                setUsers(users);
                console.log(users);
            } else {

                console.log('Failed to fetch page user details. Status:', response.status);
            }
            
        } catch (error) {
            console.error('Error fetching details:', error);
        }
    };

    const userClick = () => {
         showPageUser();
    };

    const handleDeleteUser = async (userID) => {
        const isConfirmed = window.confirm("Are you sure you want to delete this user?");
        if (isConfirmed) {  
            try {
                const response = await fetch(`http://localhost:8000/deleteUser/${userID}`, {
                    method: 'DELETE',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                });
    
                if (!response.ok) {
                    throw new Error('Failed to delete user');
                }
    
                window.location.reload();
            } catch (error) {
                console.error('Error deleting User:', error);
            }
        } else {
            console.log('Deletion cancelled');
        }
    };



    useEffect(() => {
        if (Cookies.get("token")) {
          showUser();
          showPageUser();

        }
      }, []);

      useEffect(() => {
        if (displayName) {
            showPageUser();
            setActiveTab('communities');
        }
    }, [displayName]);


    useEffect(() => {
        if (currentUser && pageUser) {
            if (currentUser.admin && currentUser.displayName === pageUser.displayName) {
                setActiveTab('users');
            } else {
                setActiveTab('posts');
            }
        }
    }, [currentUser, pageUser]);


      const handleTabClick = (tab) => {
        setActiveTab(tab); 
    };



    return (
        <div className='content-container'>
            <div className='user-info'>
                <ion-icon name="person-circle-outline"></ion-icon>

                <h5> {pageUser && pageUser.admin && '(Admin)'} </h5>
                <h3>{pageUser && pageUser.displayName}</h3>
                <h5>{pageUser && pageUser.email}</h5>
                <p>Member Since: {pageUser && pageUser.timeStamp}</p>
                <p>Reputation: {pageUser && pageUser.reputation}</p>
                
                <div className='active-buttonContainer'> 
                    <button className={activeTab === 'communities' ? 'tab-button active-tab' : 'tab-button inactive-tab'} onClick={() => handleTabClick('communities')}>User Communities</button>
                    <button className={activeTab === 'posts' ? 'tab-button active-tab' : 'tab-button inactive-tab'} onClick={() => handleTabClick('posts')}>User Posts</button>
                    <button className={activeTab === 'comments' ? 'tab-button active-tab' : 'tab-button inactive-tab'} onClick={() => handleTabClick('comments')}>User Comments</button>
                    {currentUser && currentUser.admin && window.location.pathname === `/userProfile/${currentUser.displayName}` && (<button className={activeTab === 'users' ? 'tab-button active-tab' : 'tab-button inactive-tab'} onClick={() => handleTabClick('users')}> Users </button>
    )}
                </div>

                {activeTab === 'communities' && (
                    <div className="list-container">
                        <h2 className='active-header'>User Communities</h2>
                        {communities && communities.length > 0 ? (
                            <ul>
                                {communities.map((community) => (
                                    <li key={community._id}>
                                        <Link to={`/changeCommunity/${community._id}`}>{community.name}</Link>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p>No communities found.</p>
                        )}
                    </div>
                )}

                {activeTab === 'posts' && (
                    <div className="list-container">
                        <h2 className='active-header'>User Posts</h2>
                        {posts && posts.length > 0 ? (
                            <ul>
                                {posts.map((post) => (
                                    <li key={post._id}>
                                        <Link to={`/changePost/${post._id}`}>{post.title}</Link>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p>No posts found.</p>
                        )}
                    </div>
                )}

                {activeTab === 'comments' && (
                    <div className="list-container">
                        <h2 className='active-header'>User Comments</h2>
                        {comments && comments.length > 0 ? (
                            <ul>
                                {comments.map((comment) => (
                                    <li key={comment._id}>
                                        <Link to={`/changeComment/${comment.commentPostID}/${comment._id}`}><b>{comment.commentPost + ': '}</b> <span> {comment.content.length > 20  ? comment.content.substring(0, 20) + '...' : comment.content} </span> </Link>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p> No comments found. </p>
                        )}
                    </div>
                )}

                {activeTab === 'users' && (
                    <div className="list-container">
                        <h2 className='active-header'> Users </h2>
                        {users && users.length > 0 ? (
                            <ul>
                                {users.map((user) => (
                                    <li key={user._id}>
                                        <div className='sideToSide'>
                                            <Link to={`/userProfile/${user.displayName}`} onClick={showPageUser}> 
                                                <p> {user.displayName} </p>
                                                <p> {user.email} </p>
                                                <p> {'Reputation: ' + user.reputation} </p>
                                            
                                            </Link>
                                            <button className='deleteUser' onClick={() => handleDeleteUser(user._id)}> Delete User </button>

                                        </div>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p> No comments found. </p>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}