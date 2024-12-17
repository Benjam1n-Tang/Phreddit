// Run this script to launch the server.
// The server should run on localhost port 8000.
// This is where you should start writing server-side code for this application.
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const User = require('./models/users.js');
const Community = require('./models/communities.js');
const Post = require('./models/posts.js');
const Comment = require('./models/comments.js');
const LinkFlair = require('./models/linkflairs.js');

const app = express();
app.use(cors());
app.use(express.json());

const JWT_SECRET = 'cd92907f994513b28125f19b57581722c3ccd1cbce0392a11994ed6ffa230334639846841f17d91e4be515332b4169298ee0032da73db57bb2eb396b03309f56';

mongoose.connect('mongodb://127.0.0.1:27017/phreddit', { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Connected to MongoDB'))
  .catch((err) => console.log('MongoDB Connection Error: ', err));


const timeStamp = (submittedDate) => {
  const present = new Date();
  
  const yearDiff = present.getFullYear() - submittedDate.getFullYear();
  const monthDiff = present.getMonth() - submittedDate.getMonth();
  const dayDiff = present.getDate() - submittedDate.getDate();
  const hourDiff = present.getHours() - submittedDate.getHours();
  const minDiff = present.getMinutes() - submittedDate.getMinutes();
  const secondDiff = present.getSeconds() - submittedDate.getSeconds();
  
  if (!yearDiff && !monthDiff && !dayDiff) {
    if (hourDiff) {
      return `${hourDiff} hour${hourDiff == 1 ? '' : 's'} ago`;
    }
    if (minDiff) {
      return `${minDiff} minute${minDiff == 1 ? '' : 's'} ago`;
    }
    if (secondDiff) {
      return `${secondDiff} second${secondDiff == 1 ? '' : 's'} ago`;
    }
  } else {
    if (yearDiff) {
      return `${yearDiff} year${yearDiff == 1 ? '' : 's'} ago`;
    }
    if (monthDiff) {
      return `${monthDiff} month${monthDiff == 1 ? '' : 's'} ago`;
    }
    if (dayDiff) {
      return `${dayDiff} day${dayDiff == 1 ? '' : 's'} ago`;
    }
  }
  return '0 seconds ago';
};

const countComments = (post, comments) => {
  const countReplies = (commentID) => {
    const comment = comments.find(c => c._id.toString() === commentID.toString());
    
    if (!comment || !comment.commentIDs) {
      return 0;
    }
    
    let replyCount = comment.commentIDs.length;
    
    for (let replyID of comment.commentIDs) {
      replyCount += countReplies(replyID);
    }

    return replyCount;
  };

  let totalCount = post.commentIDs ? post.commentIDs.length : 0;
  
  for (let commentID of post.commentIDs || []) {
    totalCount += countReplies(commentID);
  }

  return '' + totalCount;
};

const findPostCommunity = (postID, communities) => {
  for (let community of communities) {
      if (community.postIDs.includes(postID)) {
          return community;
      }
  }
  return null; 
};

const findLinkFlair = (linkFlairID, linkFlairs) => {
  if (!linkFlairID) return ''; 
  const linkFlair = linkFlairs.find((flair) => flair._id.toString() === linkFlairID.toString());
  return linkFlair ? linkFlair.content : ''; 
};

function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];  

  if (token == null) {
    req.user = null;  
    return next();  
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      req.user = null;  
    } else {
      req.user = user; 
    }
    return next(); 
  });
}





app.head('/user', authenticateToken, (req, res) => {
  if (!req.user) {
    return res.status(404).json({ message: 'User Not Found.'});
  }
  return res.status(200).send();
});

app.put('/joinCommunity/:communityID', authenticateToken, async (req, res) => {
  const { communityID } = req.params;
  try {

    if (!req.user) {
      return res.status(401).json({ error: 'User Not Logged In.' });
    }
    const userId = req.user.id; 

    const user = await User.findById(userId);
    const community = await Community.findById(communityID);

    if (!user.communityIDs.includes(communityID)) {
      user.communityIDs.push(communityID);
    }
    if (!community.members.includes(user.displayName)) {
      community.members.push(user.displayName);
    }
    await user.save();
    await community.save();

    return res.status(200).json({ message: 'Joined Community.' });

  } catch (error) {

    return res.status(500).json({ error: 'Internal Server Error.' });

  } 

});

app.put('/leaveCommunity/:communityID', authenticateToken, async (req, res) => {
  const { communityID } = req.params;
  try {

      if (!req.user) {
          return res.status(401).json({ error: 'User Not Logged In.' });
      }

      const user = await User.findById(req.user.id);

      const community = await Community.findById(communityID);


      user.communityIDs = user.communityIDs.filter(id => id.toString() !== communityID);

      await user.save();

      community.members = community.members.filter(member => member !== user.displayName);

      await community.save();

      return res.status(200).json({ message: 'Left Community.' });

  } catch (error) {

    return res.status(500).json({ error: 'Internal Server Error.' });

  }
});

app.put('/increaseViews/:postID',  async (req, res) => {
  const { postID } = req.params;

  try {

    const post = await Post.findById(postID);

    if (!post) {
      return res.status(404).json({ error: 'User Not Logged In.' });
    }

    post.views += 1;

    await post.save();

    return res.status(200).json({ message: 'View Count Updated.' });


  } catch (error) {

  return res.status(500).json({ error: 'Internal Server Error.' });

  }
});

app.put('/increaseUpVoteCount/:itemID', authenticateToken, async (req, res) => {

  const { itemID } = req.params;

  try {

    if (!req.user) {
      return res.status(401).json({ error: 'User Not Logged In.' });
    }

    const post = await Post.findById(itemID);
    const user = await User.findById(req.user.id);

    if (post) {
      post.upVotes += 1;
      user.reputation += 5;
      await post.save();
      await user.save();
      return res.status(200).json({ message: 'UpVote Count Updated.' });
    }

    const comment = await Comment.findById(itemID);

    if (comment) {

      comment.upVotes += 1;

      user.reputation += 5;

      await comment.save();

      await user.save();

      return res.status(200).json({ message: 'UpVote Count Updated.' });

    }

    return res.status(404).json({ error: 'Item Not Found.' });

  } catch (error) {
    return res.status(500).json({ error: 'Internal Server Error.' });
  }
});

app.put('/decreaseUpVoteCount/:itemID', authenticateToken, async (req, res) => {
  const { itemID } = req.params;
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'User Not Logged In.' });
    }
    const post = await Post.findById(itemID);
    const user = await User.findById(req.user.id);


    if (post) {
      post.upVotes -= 1;
      user.reputation -=10;
      await post.save();
      await user.save();
      return res.status(200).json({ message: 'UpVote Count Updated.' });
    }

    const comment = await Comment.findById(itemID);
    if (comment) {
      comment.upVotes -= 1;
      user.reputation -=10;
      await comment.save();
      await user.save();
      return res.status(200).json({ message: 'UpVote Count Updated.' });
    }

    return res.status(404).json({ error: 'Item Not Found.' });

  } catch (error) {
    return res.status(500).json({ error: 'Internal Server Error.' });
  }

});



app.put('/changeCommunity/:communityID', async (req, res) => {
  const { communityID } = req.params;
  const { communityName, communityDescription } = req.body;
  try {
    const community = await Community.findById(communityID);

    if (!community) {
      return res.status(404).json({ error: 'Community Not Found.' });
    }
    if (communityName) community.name = communityName;
    if (communityDescription) community.description = communityDescription;

    await community.save();

    return res.status(200).json(community);

  } catch (error) {
    return res.status(500).json({ error: 'Internal Server Error.' });
  }
});

app.put('/changePost/:postID', async (req, res) => {
  const { postID } = req.params;
  const { postTitle, postLinkFlair, customLinkFlair, postCommunity, postContent } = req.body;

  try {
    const post = await Post.findById(postID);

    if (!post) {
      return res.status(404).json({ error: 'Post Not Found.' });
    }

    const currentCommunity = await findPostCommunity(postID, await Community.find({}));

    if (!currentCommunity) {
      return res.status(404).json({ error: 'Current Community Not Found.' });
    }

    if (postCommunity && currentCommunity._id.toString() !== postCommunity) {
      
      currentCommunity.postIDs = currentCommunity.postIDs.filter(id => id.toString() !== postID);
      await currentCommunity.save();

      const newCommunity = await Community.findById(postCommunity);
      if (!newCommunity) {

        return res.status(404).json({ error: 'New Community Not Found.' });
      }

      newCommunity.postIDs.push(postID);
      await newCommunity.save();
    }

    if (postTitle) post.title = postTitle;

    if (postContent) post.content = postContent;

    if (customLinkFlair && customLinkFlair.trim() !== '') {
      const newLinkFlair = new LinkFlair({
        content: customLinkFlair,
      });
      await newLinkFlair.save();
      post.linkFlairID = newLinkFlair._id;
    } else if (postLinkFlair) {

      const existingLinkFlair = await LinkFlair.findById(postLinkFlair);

      if (existingLinkFlair) {
        post.linkFlairID = existingLinkFlair._id;
      } else {
        return res.status(404).json({ error: 'LinkFlair Not Found.' });
      }

    }

    await post.save();

    return res.status(200).json(post);

  } catch (error) {
    return res.status(500).json({ error: 'Internal Server Error.' });
  }
});

app.put('/changeComment/:commentID', async (req, res) => {
  const { commentID } = req.params;
  const { commentContent } = req.body;
  try {
    const comment = await Comment.findById(commentID);

    if (!comment) {
      return res.status(404).json({ error: 'Comment Not Found.' });
    }
    if (commentContent) comment.content = commentContent;

    await comment.save();

    return res.status(200).json(comment);

  } catch (error) {
    return res.status(500).json({ error: 'Internal Server Error.' });
  }
});




const deleteComments = async (commentIDs) => {
  if (!commentIDs || commentIDs.length === 0) return;


  const comments = await Comment.find({ _id: { $in: commentIDs } });

  for (const comment of comments) {

    await User.updateMany(
      { commentIDs: { $in: [comment._id] } },
      { $pull: { commentIDs: comment._id } }
    );


    if (comment.commentIDs && comment.commentIDs.length > 0) {
      await deleteComments(comment.commentIDs);  
    }
  }


  await Comment.deleteMany({ _id: { $in: commentIDs } });
};

app.delete('/deleteCommunity/:communityID', async (req, res) => {
  const { communityID } = req.params;

  try {

    const community = await Community.findById(communityID);
    if (!community) {
      return res.status(404).json({ error: 'Community Not Found.' });
    }


    const posts = await Post.find({ _id: { $in: community.postIDs } });


    const allCommentIDs = posts.flatMap(post => post.commentIDs);
    await deleteComments(allCommentIDs); 


    await Post.deleteMany({ _id: { $in: community.postIDs } });

    await User.updateMany(
      { communityIDs: { $in: [communityID] } },
      { $pull: { communityIDs: communityID } }
    );


    await Community.findByIdAndDelete(communityID);

    return res.status(200).json({ message: 'Community Deleted successfully.' });

  } catch (error) {
    return res.status(500).json({ error: 'Internal Server Error.' });
  }
});

app.delete('/deletePost/:postID', async (req, res) => {
  const { postID } = req.params;

  try {

    const post = await Post.findById(postID);
    if (!post) {
      return res.status(404).json({ error: 'Post Not Found.' });
    }


    const allCommentIDs = post.commentIDs;
    await deleteComments(allCommentIDs);  

    await User.updateMany(
      { postIDs: { $in: [postID] } },
      { $pull: { postIDs: postID } }
    );

    await Post.findByIdAndDelete(postID);

    return res.status(200).json({ message: 'Post Deleted successfully.' });

  } catch (error) {

    return res.status(500).json({ error: 'Internal Server Error.' });
  }
});

app.delete('/deleteComment/:commentID', async (req, res) => {
  const { commentID } = req.params;

  try {
    const comment = await Comment.findById(commentID);
    if (!comment) {
      return res.status(404).json({ error: 'Comment Not Found.' });
    }

    const allNestedCommentIDs = comment.commentIDs;
    await deleteComments(allNestedCommentIDs);  


    await User.updateMany(
      { commentIDs: { $in: [commentID] } },
      { $pull: { commentIDs: commentID } }
    );

    await Post.updateMany(
      { allComments: { $in: [commentID] } },
      { $pull: { allComments: commentID } }
    );

    await Comment.findByIdAndDelete(commentID);

    return res.status(200).json({ message: 'Comment Deleted successfully.' });

  } catch (error) {
    return res.status(500).json({ error: 'Internal Server Error.' });
  }
});

app.delete('/deleteUser/:userID', async (req, res) => {
  const { userID } = req.params;

  try {
    const user = await User.findById(userID);
    if (!user) {
      return res.status(404).json({ error: 'User Not Found.' });
    }
    for (const commentID of user.commentIDs) {
      const comment = await Comment.findById(commentID);
      if (comment) {
        await deleteComments(comment.commentIDs);

        await User.updateMany(
          { commentIDs: { $in: [commentID] } },
          { $pull: { commentIDs: commentID } }
        );
        await Post.updateMany(
          { allComments: { $in: [commentID] } },
          { $pull: { allComments: commentID } }
        );

        await Comment.findByIdAndDelete(commentID);
      }
    }

    const posts = await Post.find({ _id: { $in: user.postIDs } });
    for (const post of posts) {
      const allCommentIDs = post.commentIDs;

      await deleteComments(allCommentIDs);

      await Post.findByIdAndDelete(post._id);

      await User.updateMany(
        { postIDs: { $in: [post._id] } },
        { $pull: { postIDs: post._id } }
      );
    }

    const communities = await Community.find({ creator: user.displayName });
    for (const community of communities) {
      const posts = await Post.find({ _id: { $in: community.postIDs } });
      const allCommentIDs = posts.flatMap(post => post.commentIDs);

      await deleteComments(allCommentIDs);

      await Post.deleteMany({ _id: { $in: community.postIDs } });

      await User.updateMany(
        { communityIDs: { $in: [community._id] } },
        { $pull: { communityIDs: community._id } }
      );

      await Community.findByIdAndDelete(community._id);
    }

    const allCommunities = await Community.find({});
    for (const community of allCommunities) {
      if (community.members && community.members.includes(user.displayName)) {
        await Community.updateOne(
          { _id: community._id },
          { $pull: { members: user.displayName } }
        );
      }
    }

    await User.updateMany(
      { communityIDs: { $in: [userID] } },
      { $pull: { communityIDs: userID } }
    );

    await User.findByIdAndDelete(userID);

    return res.status(200).json({ message: 'User Deleted Successfully.' });

  } catch (error) {
    return res.status(500).json({ error: 'Internal Server Error.' });
  }
});




app.get('/posts/:feed/:sort/:identifier?', authenticateToken, async (req, res) => {

  const sortActive = (posts, comments) => {
    const getNewestCommentThread = (commentID) => {
      const comment = comments.find(c => c._id.toString() === commentID.toString());
      if (!comment) return null;
  
      let latestDate = new Date(comment.commentedDate);
  
      comment.commentIDs.forEach(nestedCommentID => {
        const innerDate = getNewestCommentThread(nestedCommentID);
        if (innerDate && innerDate > latestDate) {
          latestDate = innerDate;
        }
      });
  
      return latestDate;
    };
  
    const getNewestComment = (post) => {
  
      let latestDate = new Date(-8640000000000000); 
  
      post.commentIDs.forEach(commentID => {
        const commentDate = getNewestCommentThread(commentID);
        if (commentDate && commentDate > latestDate) {
          latestDate = commentDate;
        }
      });
  
      return latestDate;
    };
  
    return posts.sort((a, b) => {
      const newestCommentDifference = getNewestComment(b) - getNewestComment(a);
      if (newestCommentDifference === 0) {
        return new Date(b.postedDate) - new Date(a.postedDate);
      }
      return newestCommentDifference;
    });
  };

  const { feed, sort, identifier } = req.params;

  try {

    let posts = await Post.find(); 
    const comments = await Comment.find();
    const communities = await Community.find();
    const linkFlairs = await LinkFlair.find();

    let communityData = null;


    if (feed === 'search') {
      const matchingPosts = [];
      const searchTerms = identifier.toLowerCase().split(' '); 

      const checkComments = (commentIDs, terms) => {
        for (let commentID of commentIDs) {
          const comment = comments.find(c => c._id.toString() === commentID.toString());
          for (let term of terms) {
            let postCommentSet = [...new Set(comment.content.toLowerCase().split(' '))].filter(item => item !== '' && item !== ' ').map(item => item.replace(/[^\w\s]/g, ''));
            if (postCommentSet.includes(term)) {
              return true;
            }
          }
          const foundInReplies = checkComments(comment.commentIDs, terms);
          if (foundInReplies) {
            return true;
          }
        }
        return false;
      };

  
      posts.forEach((post) => {
        let postMatches = false;
        searchTerms.forEach(term => {
          let postTitleSet = [...new Set(post.title.toLowerCase().split(' '))].filter(item => item !== '' && item !== ' ').map(item => item.replace(/[^\w\s]/g, ''));
          let postContentSet = [...new Set(post.content.toLowerCase().split(' '))].filter(item => item !== '' && item !== ' ').map(item => item.replace(/[^\w\s]/g, ''));
          if (postTitleSet.includes(term) || postContentSet.includes(term)) {
            postMatches = true;
          }
  
          if (checkComments(post.commentIDs, searchTerms)) {
            postMatches = true;
          }
        });
  
        if (postMatches) {
          matchingPosts.push(post);
        }
      });
      posts = matchingPosts;

    } 
    if (feed === 'community') {

      communityData = await Community.findById(identifier);

      if (!communityData) {

        return res.status(404).json({ error: 'Community Not Found.' });

      }
      posts = await Post.find({ _id: { $in: communityData.postIDs } });


    }

    let sortedRawPosts;
    if (sort === 'newest') {
      sortedRawPosts = posts.sort((a, b) => new Date(b.postedDate) - new Date(a.postedDate));
    } else if (sort === 'oldest') {
      sortedRawPosts = posts.sort((a, b) => new Date(a.postedDate) - new Date(b.postedDate));
    } else if (sort === 'active') {
      sortedRawPosts = sortActive(posts, comments);
    } else {
      return res.status(400).json({ error: 'Invalid Sort.' });
    }



    const postsInfo = sortedRawPosts.map((post) => {
      const community = findPostCommunity(post._id, communities);
      return {
        ...post.toObject(),
        timeStamp: timeStamp(new Date(post.postedDate)),
        commentCount: countComments(post, comments),
        community: community ? community.name : 'Unknown',
        linkFlairContent: findLinkFlair(post.linkFlairID, linkFlairs),
      };
    });

    if (feed === 'community') {

      const communityWithTimeStamp = {
        ...communityData.toObject(),
        timeStamp: timeStamp(new Date(communityData.startDate)), 
        isUserMember: req.user 
      ? await User.findById(req.user.id)
          .then(user => user.communityIDs.some(communityID => communityID.toString() === communityData._id.toString()))
      : false,
    };

      return res.status(200).json([postsInfo, communityWithTimeStamp]);
    } 
    
    if (req.user) {
      const user = await User.findById(req.user.id).populate('communityIDs');

      const communityPosts = [];
      const otherPosts = [];

      postsInfo.forEach(post => {
        const isCommunityPost = user.communityIDs.some(community => post.community === community.name);
        if (isCommunityPost) {
          communityPosts.push(post);
        } else {
          otherPosts.push(post);
        }
      });
      return res.status(200).json([communityPosts, otherPosts]);
    } else {
      return res.status(200).json([postsInfo]);
    }


  } catch (error) {
    return res.status(500).json({ error: 'Internal Server Error.' });
  }
});


app.get('/displayName', authenticateToken, async (req, res) => {
  try {
    if (req.user) {
      const user = await User.findById(req.user.id); 
      return res.status(200).json(user.displayName);
    } 
    if (!req.user) {
      return res.status(404).json({ error: 'User Not Found.' });
    }
  } catch (error) {
    return res.status(500).json({ error: 'Internal Server Error.' });
  }
});
  
app.get('/user', authenticateToken, async (req, res) => {
  try {


    if (!req.user) {
      return res.status(404).json({ error: 'User Not Found.' });
    }

    const user = await User.findById(req.user.id); 
    
    if (!user) {
      return res.status(404).json({ error: 'User Not Found.' });
    }
    res.status(200).json({
      displayName: user.displayName,
      email: user.email,
      startDate: new Date(user.startDate).toLocaleString(),
      timeStamp: timeStamp(new Date(user.startDate)),
      communityIDs: user.communityIDs,
      postIDs: user.postIDs,
      commentIDs: user.commentIDs,
      reputation: user.reputation,
      admin: user.admin, 
    });
  } catch (error) {
    return res.status(500).json({ error: 'Internal Server Error.' });
  }
});


app.get('/pageUser/:displayName', async (req, res) => {
  try {
    const { displayName } = req.params;
    const user = await User.findOne({ displayName }); 

    if (!user) {
      return res.status(404).json({ error: 'User Not Found.' });
    }

    const communities = await Community.find({ creator: user.displayName });
    const posts = await Post.find( {postedBy: user.displayName})
    const comments = await Comment.find( {commentedBy: user.displayName });
    const users = await User.find({ admin: { $ne: true } }, '_id displayName email reputation');



    const commentsWithPost = await Promise.all(
      comments.map(async (comment) => {
        const post = await Post.findOne({ allComments: { $in: [comment._id] } });
        return {
          ...comment.toObject(), 
          commentPostID: post ? post._id : null, 
          commentPost: post ? post.title : null,
        };
      })
    );

    return res.status(200).json({
      userDetails: {
        displayName: user.displayName,
        email: user.email,
        startDate: new Date(user.startDate).toLocaleString(),
        timeStamp: timeStamp(new Date(user.startDate)),
        communityIDs: user.communityIDs,
        postIDs: user.postIDs,
        commentIDs: user.commentIDs,
        reputation: user.reputation,
        admin: user.admin,
      },
      communities,
      posts,
      comments: commentsWithPost,
      users,
    });

  } catch (error) {
    return res.status(500).json({ error: 'Internal Server Error.' });
  }
});


app.get('/community/:communityID', async (req, res) => {
  const { communityID } = req.params;
  try {


    const community = await Community.findById(communityID);

    if (!community) {
      return res.status(404).json({ error: 'Community Not Found.' });
    }

    return res.status(200).json(community);

  } catch (error) {
    return res.status(500).json({ error: 'Internal Server Error.' });
  }

});


app.get('/post/:post', async (req, res) => {
  const { post } = req.params;
  try {


    const postData = await Post.findById(post);
    if (!postData) {
      return res.status(404).json({ error: 'Post Not Found.' });
    }
    const comments = await Comment.find();
    const communities = await Community.find();
    const linkFlairs = await LinkFlair.find();

    const community = findPostCommunity(postData._id, communities);

    const getCommentsRecursively = (commentIDs) => {

      const allComments = commentIDs
        .map(commentID => comments.find(c => c._id.toString() === commentID.toString()))
        .filter(Boolean); 

      allComments.sort((a, b) => new Date(b.commentedDate) - new Date(a.commentedDate));

      return allComments.map(comment => ({
        ...comment.toObject(),
        timeStamp: timeStamp(new Date(comment.commentedDate)),
        comments: getCommentsRecursively(comment.commentIDs), 
      }));
    };

    

    const postComments = getCommentsRecursively(postData.commentIDs);

    const transformedPost = {
      ...postData.toObject(),
      timeStamp: timeStamp(new Date(postData.postedDate)),
      commentCount: countComments(postData, comments),
      communityID: community._id,
      community: community ? community.name : 'Unknown',
      linkFlairContent: findLinkFlair(postData.linkFlairID, linkFlairs),
      comments: postComments,
    };
    


    return res.status(200).json(transformedPost);

  } catch (error) {
    return res.status(500).json({ error: 'Internal Server Error.' });
  }

});

app.get('/comment/:commentID', async (req, res) => {
  const { commentID } = req.params;
  try {

    const comment = await Comment.findById(commentID);

    if (!comment) {
      return res.status(404).json({ error: 'Comment Not Found.' });
    }

    return res.status(200).json(comment);

  } catch (error) {
    return res.status(500).json({ error: 'Internal Server Error.' });
  }
});



app.get('/communities', authenticateToken, async (req, res) => {
  try {
    const communities = await Community.find();

    if (req.user) {
      const user = await User.findById(req.user.id)
      const userCommunities = [];
      const otherCommunities = [];

      communities.forEach(community => {
        const isUserCommunity = user.communityIDs.some(comID => community.equals(comID));
        if (isUserCommunity) {
          userCommunities.push(community);
        } else {
          otherCommunities.push(community);
        }
      });

      return res.status(200).json([userCommunities, otherCommunities]);
    } else {
      return res.status(200).json([communities]);
    }
  } catch (error) {
    return res.status(500).json({ error: 'Internal Server Error.' });
  }
});

app.get('/linkFlairs', async (req, res) => {
  try {
    const linkFlairs = await LinkFlair.find();
    return res.status(200).json(linkFlairs);  
  } catch (error) {
    return res.status(500).json({ error: 'Internal Server Error.' });
  }
});

app.get('/communityExists', async (req, res) => {
  const { name } = req.query;
  try {
    const community = await Community.findOne( {name} );
    if (!community) {
      return res.status(200).json({ isUnique: true });
    }
    return res.status(200).json({ isUnique: false });
  } catch (error) {
    return res.status(500).json({ error: 'Internal Server Error.' });
  }
});


app.get('/emailExists', async (req, res) => {
  const { email } = req.query;
  try {
    const user = await User.findOne( {email} );
    if (!user) {
      return res.status(200).json({ isUnique: true });
    }
    return res.status(200).json({ isUnique: false });
  } catch (error) {
    return res.status(500).json({ error: 'Internal Server Error.' });
  }
});

app.get('/displayNameExists', async (req, res) => {
  const { displayName } = req.query;
  try {
    const user = await User.findOne( {displayName} );
    if (!user) {
      return res.status(200).json({ isUnique: true });
    }
    return res.status(200).json({ isUnique: false });
  } catch (error) {
    return res.status(500).json({ error: 'Internal Server Error.' });
  }
});



app.post('/register', async (req, res) => {
  const { firstName, lastName, email, displayName, password } = req.body;
  try  {

    const hashedPassword = await bcrypt.hash(password, 12);
    const newUser = new User({
      firstName: firstName,
      lastName: lastName,
      email: email,
      password: hashedPassword,
      displayName: displayName,
      startDate: new Date(),
      communityIDs: [],
      postIDs: [],
      commentIDs: [],
      reputation: 100,
      admin: false,
    });
    await newUser.save();
    return res.status(201).json(newUser);
  } catch (error) {
    return res.status(500).json({ error: 'Internal Server Error.' });
  }
});

app.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne( { email });

    if (!user) {
      return res.status(404).json({ error: 'User Not Found.' });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid Credentials.' });
    }

    const token = jwt.sign({  id: user._id, 
                              displayName: user.displayName, 
                              startDate: user.startDate, 
                              communityIDs: user.communityIDs, 
                              postIDs: user.postIDs,
                              commentIDs: user.commentIDs,
                              reputation: user.reputation, 
                              admin: user.admin }, JWT_SECRET, {expiresIn: "10y"});

     return res.status(200).json({ token });
  } catch (error) {
    return res.status(500).json({ error: 'Internal Server Error.' });
  }
});

app.post('/communities', authenticateToken, async (req, res) => {
  const { communityName, communityDescription } = req.body;

  try {
    if (!req.user) {
      return res.status(404).json({ error: 'User Not Found.' });
    }
    const user = await User.findById(req.user.id); 

    const newCommunity = new Community({
      name: communityName,
      description: communityDescription,
      postIDs: [],
      startDate: new Date(),
      members: [user.displayName],
      creator: user.displayName,
    });

    await newCommunity.save();

    user.communityIDs.push(newCommunity._id);
    await user.save();

    return res.status(201).json(newCommunity);

  } catch (error) {
  return res.status(500).json({ error: 'Internal Server Error.' });

  }
});


app.post('/posts', authenticateToken, async (req, res) => {
  const { postTitle, postLinkFlair, customLinkFlair, postCommunity, postContent} = req.body;
  try {
    if (!req.user) {
      return res.status(404).json({ error: 'User Not Found.' });
    }
    const user = await User.findById(req.user.id); 
    const community = await Community.findById(postCommunity);

    if (customLinkFlair.trim() !== '') {

      const newLinkFlair = new LinkFlair({
        content: customLinkFlair,
      });
      await newLinkFlair.save();

      const newPost = new Post({
        title: postTitle,
        content: postContent,
        linkFlairID: newLinkFlair._id,
        postedBy: user.displayName,
        postedDate: new Date(),
        commentIDs: [],
        allComments: [],
        views: 0,
        upVotes: 0,
        downVotes: 0,
      });
      
      await newPost.save();
  
      community.postIDs.push(newPost._id);
      await community.save();
  
  
      user.postIDs.push(newPost._id);
      await user.save();
  
      return res.status(201).json(newPost);

    } else {
      const linkFlair = await LinkFlair.findById(postLinkFlair);
      const newPost = new Post({
        title: postTitle,
        content: postContent,
        linkFlairID: linkFlair ? linkFlair._id : null,
        postedBy: user.displayName,
        postedDate: new Date(),
        commentIDs: [],
        allComments: [],
        views: 0,
        upVotes: 0,
        downVotes: 0,
      });

      await newPost.save();

      community.postIDs.push(newPost._id);
      await community.save();
  
  
      user.postIDs.push(newPost._id);
      await user.save();
  
      return res.status(201).json(newPost);

    }

  } catch (error) {
    return res.status(500).json({ error: 'Internal Server Error.' });
  }
});

app.post('/comments', authenticateToken, async (req, res) => {
  const { commentContent, parentID, postID } = req.body;
  try {
    if (!req.user) {
      return res.status(404).json({ error: 'User Not Found.' });
    }
    const user = await User.findById(req.user.id); 
    const post = await Post.findById(parentID); 
    const comment = await Comment.findById(parentID); 

    const newComment = new Comment({
      content: commentContent,
      commentIDs: [],
      commentedBy: user.displayName,
      postedDate: new Date(),
      upVotes: 0,
      downVotes: 0,
    });

    if (post) {

      await newComment.save();

      post.commentIDs.push(newComment._id);
      post.allComments.push(newComment._id);
      user.commentIDs.push(newComment._id);
      await post.save();
      await user.save();

      return res.status(201).json(parentID);

    } else if (comment) {

        await newComment.save();

        const thePost = await Post.findById(postID);
        thePost.allComments.push(newComment._id);

        comment.commentIDs.push(newComment._id);
        user.commentIDs.push(newComment._id);
        await thePost.save();
        await comment.save();
        await user.save();

        return res.status(201).json(postID);

    } else {
      return res.status(404).json({ error: 'Parent ID Not Found' });

    }
  } catch (error) {
    return res.status(500).json({ error: 'Internal Server Error.' });
  }
});




app.listen(8000, () => {
console.log('Server listening on port 8000...');
});