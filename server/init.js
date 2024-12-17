/* server/init.JSON
** You must write a script that will create documents in your database according
** to the datamodel you have defined for the application.  Remember that you 
** must at least initialize an admin user account whose credentials are derived
** from command-line arguments passed to this script. But, you should also add
** some communities, posts, comments, and link-flairs to fill your application
** some initial content.  You can use the initializeDB.js script as inspiration, 
** but you cannot just copy and paste it--you script has to do more to handle
** users.
*/

const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const UserModel = require('./models/users')
const CommunityModel = require('./models/communities');
const PostModel = require('./models/posts');
const CommentModel = require('./models/comments');
const LinkFlairModel = require('./models/linkflairs');

let userArgs = process.argv.slice(2);

if (!userArgs[0].startsWith('mongodb')) {
    console.log('ERROR: You need to specify a valid mongodb URL as the first argument');
    return;
}

let mongoDB = userArgs[0];
mongoose.connect(mongoDB);
let db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));

const adminEmail = userArgs[1];
const adminDisplayName = userArgs[2];
const adminPassword = userArgs[3];


function createLinkFlair(linkFlairObj) {
    let newLinkFlairDoc = new LinkFlairModel({
        content: linkFlairObj.content,
    });
    return newLinkFlairDoc.save();
}

function createComment(commentObj) {
    let newCommentDoc = new CommentModel({
        content: commentObj.content,
        commentedBy: commentObj.commentedBy,
        commentedDate: commentObj.commentedDate,
        commentIDs: commentObj.commentIDs,
        upVotes: commentObj.upVotes,
        downVotes: commentObj.downVotes,
    });
    return newCommentDoc.save();
}

function createPost(postObj) {
    let newPostDoc = new PostModel({
        title: postObj.title,
        content: postObj.content,
        postedBy: postObj.postedBy,
        postedDate: postObj.postedDate,
        views: postObj.views,
        linkFlairID: postObj.linkFlairID,
        commentIDs: postObj.commentIDs,
        allComments: postObj.allComments,
        upVotes: postObj.upVotes,
        downVotes: postObj.downVotes,
    });
    return newPostDoc.save();
}

function createCommunity(communityObj) {
    let newCommunityDoc = new CommunityModel({
        name: communityObj.name,
        description: communityObj.description,
        postIDs: communityObj.postIDs,
        startDate: communityObj.startDate,
        members: communityObj.members,
        creator: communityObj.creator,
    });
    return newCommunityDoc.save();
}

async function createUser(userObj) {
    const hashedPassword = await bcrypt.hash(userObj.password, 12);
    let newUserDoc = new UserModel({
        firstName: userObj.firstName,
        lastName: userObj.lastName,
        email: userObj.email,
        password: hashedPassword,
        displayName: userObj.displayName,
        startDate: userObj.startDate,
        communityIDs: userObj.communityIDs,
        postIDs: userObj.postIDs,
        reputation: userObj.reputation,
        admin: userObj.admin,
    });
    return newUserDoc.save();
}

async function createAdminUser() {
    if (!adminEmail || !adminDisplayName || !adminPassword) {
        console.log('ERROR: Admin user credentials are missing.');
        return;
    }

    const adminUser = {
        firstName: 'User',
        lastName: 'Admin',
        email: adminEmail,
        password: adminPassword,
        displayName: adminDisplayName,
        startDate: new Date(),
        communityIDs: [],
        postIDs: [],
        reputation: 1000,  
        admin: true,
    };

    await createUser(adminUser);
    console.log('Admin user created successfully');
};





async function init() {

    await createAdminUser();

    // link flair objects
    const linkFlair1 = { // link flair 1
        content: 'Completely the Truth', 
    };
    const linkFlair2 = { //link flair 2
        content: 'Very Chill',
    };
    const linkFlair3 = { //link flair 3
        content: 'Urgent Help',
    };
    const linkFlair4 = { //link flair 4
        linkFlairID: 'lf4',
        content: 'Anybody Agree',
    };
    let linkFlairRef1 = await createLinkFlair(linkFlair1);
    let linkFlairRef2 = await createLinkFlair(linkFlair2);
    let linkFlairRef3 = await createLinkFlair(linkFlair3);
    let linkFlairRef4 = await createLinkFlair(linkFlair4);
    
    // comment objects
    const comment1 = { // comment 1
        content: 'You disagree with something that is objectively true?',
        commentIDs: [],
        commentedBy: "rocky13",
        commentedDate: new Date('September 20, 2024 6:32:00'),
        upVotes: 10,
        downVotes: 10,
    };
    
    let commentRef1 = await createComment(comment1);

    const comment2 = { // comment 2
        content: 'I also disagree. Barbells are nicer.',
        commentIDs: [],
        commentedBy: "Face21",
        commentedDate: new Date('September 16, 2024 6:14:00'),
        upVotes: 10,
        downVotes: 10,
    };
    
    let commentRef2 = await createComment(comment2);
    
    const comment3 = { // comment 3
        content: 'I disagree. Barbells feel significantly better',
        commentIDs: [commentRef2, commentRef1],
        commentedBy: "Ben22",
        commentedDate: new Date('September 13, 2024 6:33:00'),
        upVotes: 10,
        downVotes: 10,
    };
    
    let commentRef3 = await createComment(comment3);

    const comment4 = { // comment 4
        content: 'Oh wow that actually was very helpful.',
        commentIDs: [],
        commentedBy: "Face21",
        commentedDate: new Date('October 10, 2024 6:50:00'),
        upVotes: 10,
        downVotes: 10,
    };
    
    let commentRef4 = await createComment(comment4);

    
    const comment5 = { // comment 5
        content: 'Im just a chill guy.',
        commentIDs: [],
        commentedBy: "chillGuy15",
        commentedDate: new Date('September 10, 2024 6:42:00'),
        upVotes: 10,
        downVotes: 10,
    };
    
    let commentRef5 = await createComment(comment5);

    const comment6 = { // comment 6
        content: 'Have you tried pressing the power button?',
        commentIDs: [commentRef4],
        commentedBy: "Ben22",
        commentedDate: new Date('September 12, 2023 6:16:00'),
        upVotes: 10,
        downVotes: 10,
    };
    
    let commentRef6 = await createComment(comment6);
        
    const comment7 = { // comment 7
        content: 'Im just a chill guy.',
        commentIDs: [],
        commentedBy: "chillGuy15",
        commentedDate: new Date('September 14, 2023 6:02:00'),
        upVotes: 10,
        downVotes: 10,
    };

    let commentRef7 = await createComment(comment7);

    const comment8 = { // comment 8
        content: 'I am glad you understand what I mean.',
        commentIDs: [commentRef5],
        commentedBy: 'Ben22',
        commentedDate: new Date('April 13, 2023 09:22:00'),
        upVotes: 10,
        downVotes: 10,
    }
    let commentRef8 = await createComment(comment8);

    const comment9 = { // comment 9
        content: 'Sometimes I find this class a little difficult though.',
        commentIDs: [],
        commentedBy: 'rocky13',
        commentedDate: new Date('February 16, 2024 07:17:00'),
        upVotes: 10,
        downVotes: 10,
    };
    let commentRef9 = await createComment(comment9);


    const comment10 = { // comment 10
        content: 'I have to agree this class is sooo amazing.',
        commentIDs: [commentRef8],
        commentedBy: 'Seung25',
        commentedDate: new Date('February 10, 2023 09:24:00'),
        upVotes: 10,
        downVotes: 10,
    };
    let commentRef10 = await createComment(comment10);
    



    // post objects
    const post1 = { // post 1
        title: 'CSE-316',
        content: 'Anybody else think CSE-316 is a great class? I sure hope I get a perfect score on the final project.',
        linkFlairID: linkFlairRef1,
        postedBy: 'Ben22',
        postedDate: new Date('August 26, 2022 01:19:00'),
        commentIDs: [commentRef10, commentRef9],
        allComments: [commentRef10, commentRef9, commentRef8, commentRef5],
        views: 14,
        upVotes: 10,
        downVotes: 2,
    };
    const post2 = { // post 2
        title: "Stony Brook is a good school.",
        content: 'Stony Brook may be one of the best schools in the world right now.',
        linkFlairID: linkFlairRef1,
        postedBy: 'Seung25',
        postedDate: new Date('September 9, 2023 14:24:00'),
        commentIDs: [],
        allComments: [],
        views: 1023,
        upVotes: 500,
        downVotes: 3,
    };
    const post3 = { // post 3
        title: "My Computer Broke.",
        content: 'My computer broke while trying to create facebook anybody know why?.',
        linkFlairID: linkFlairRef3,
        postedBy: 'Face21',
        postedDate: new Date('September 10, 2023 19:38:00'),
        commentIDs: [commentRef7, commentRef6],
        allComments: [commentRef7, commentRef6, commentRef4],
        views: 136,
        upVotes: 16,
        downVotes: 5,
    };

    const post4 = { // post 4
        title: "Dumbbells are better than barbells.",
        content: 'While most people would not agree I actually think dumbbells are significantly better than barbells. They allow for more flexibility in working out.',
        linkFlairID: linkFlairRef4,
        postedBy: 'rocky13',
        postedDate: new Date('December 21, 2023 20:45:00'),
        commentIDs: [commentRef3],
        allComments: [commentRef3, commentRef2, commentRef1],
        views: 72,
        upVotes: 18,
        downVotes: 2,
    };

    const post5 = { // post 5
        title: "I am starting to enjoy working out.",
        content: 'I started exercising recently and I actually am starting to enjoy it.',
        linkFlairID: linkFlairRef2,
        postedBy: 'Ben22',
        postedDate: new Date('December 24, 2023 20:49:00'),
        commentIDs: [],
        allComments: [],
        views: 61,
        upVotes: 19,
        downVotes: 3,
    };



    let postRef1 = await createPost(post1);
    let postRef2 = await createPost(post2);
    let postRef3 = await createPost(post3);
    let postRef4 = await createPost(post4);
    let postRef5 = await createPost(post5);

    
    // community objects
    const community1 = { // community object 1
        name: 'Fitness',
        description: 'A community for people who want to get fit and exercise for the sake of physical and mental health..',
        postIDs: [postRef4, postRef5],
        startDate: new Date('March 10, 2020 12:00:00'),
        members: ['rocky13', 'Ben22', 'Face21'],
        creator: 'rocky13',
    };
    const community2 = { // community object 2
        name: 'Tech Tips',
        description: 'A community for people who need help with anything related to technology. Post whatever you need to get help..',
        postIDs: [postRef3],
        startDate: new Date('January 15, 2018 09:00:00'),
        members: ['Face21', 'Ben22', 'chillGuy15'],
        creator: 'Face21',
    };

    const community3 = { // community object 3
        name: 'SBU',
        description: 'Students of Stony Brook University. Members can discuss anything about this University',
        postIDs: [postRef1, postRef2],
        startDate: new Date('November 5, 2016 15:00:00'),
        members: ['Seung25', 'Ben22', 'Face21', 'chillGuy15', 'rocky13'],
        creator: 'Seung25',
    };

    let communityRef1 = await createCommunity(community1);
    let communityRef2 = await createCommunity(community2);
    let communityRef3 = await createCommunity(community3);


    // user objects 
    const user1 = {// user object 1
        firstName: 'Benjamin',
        lastName: 'Tang',
        email: 'bentang@email.com',
        password: 'bPassword',
        displayName: 'Ben22',
        startDate: new Date('January 22, 2004 10:30:00'),
        communityIDs: [communityRef1, communityRef2, communityRef3],
        postIDs: [postRef1, postRef5],
        commentIDs: [commentRef3, commentRef6, commentRef8],
        reputation: 500,
        admin: false,
    };

    const user2 = {// user object 2
        firstName: 'Seung',
        lastName: 'Joo',
        email: 'seung@email.com',
        password: 'sPassword',
        displayName: 'Seung25',
        startDate: new Date('March 25, 2004 8:30:00'),
        communityIDs: [communityRef3],
        postIDs: [postRef2],
        commentIDs: [commentRef10],
        reputation: 300,
        admin: false,
    };

    const user3 = {// user object 3
        firstName: 'Mark',
        lastName: 'Zuckerberg',
        email: 'markZuck@email.com',
        password: 'mPassword',
        displayName: 'Face21',
        startDate: new Date('February 4, 2004 9:00:00'),
        communityIDs: [communityRef1, communityRef2, communityRef3],
        postIDs: [postRef3],
        commentIDs: [commentRef2, commentRef4],
        reputation: 700,
        admin: false,
    };

    const user4 = {// user object 4
        firstName: 'Dwayne',
        lastName: 'Johnson',
        email: 'theRock@email.com',
        password: 'rPassword',
        displayName: 'rocky13',
        startDate: new Date('May 2, 2003 3:00:00'),
        communityIDs: [communityRef1, communityRef3],
        postIDs: [postRef4],
        commentIDs: [commentRef1, commentRef9],
        reputation: 600,
        admin: false,
    };

    const user5 = {// user object 5
        firstName: 'Chill',
        lastName: 'Guy',
        email: 'chill45@email.com',
        password: 'cPassword',
        displayName: 'chillGuy15',
        startDate: new Date('June 2, 2007 6:00:00'),
        communityIDs: [communityRef2, communityRef3],
        postIDs: [],
        commentIDs: [commentRef7, commentRef5],
        reputation: 200,
        admin: false,
    };



    let userRef1 = await createUser(user1);
    let userRef2 = await createUser(user2);
    let userRef3 = await createUser(user3);
    let userRef4 = await createUser(user4);
    let userRef5 = await createUser(user5);



    if (db) {
        db.close();
    }
    console.log("done");
}

init()
    .catch((err) => {
        console.log('ERROR: ' + err);
        console.trace();
        if (db) {
            db.close();
        }
    });

console.log('processing...');