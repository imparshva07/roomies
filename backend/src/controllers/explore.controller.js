import { Group } from "../models/group.model.js";
import { User } from "../models/user.model.js";


export const shuffleProfiles = async (profiles, username, currentUserId) => {
    // Get the current user's likes
    const currentUser = await User.findById(currentUserId) || await Group.findById(currentUserId);    
    const likedUsers = (currentUser.likes || []).map(like => like.toString()); 
    const dislikedUsers = (currentUser.rejects || []).map(reject => reject.toString());   
    const matchedUsers = (currentUser.matches || []).map(matche => matche.toString());   

    // const matchedUsers = currentUser.matches.map(match => match.toString());
    // Remove the user from the profiles array and users that the current user has liked
    // console.log(likedUsers)
    // console.log(dislikedUsers)
    // console.log(matchedUsers)
    // console.log(currentUser)
    const filteredProfiles = profiles.filter(profile => {
      const profileIdString = profile._id?.toString() || '';
      const hasLiked = likedUsers.includes(profileIdString);
      const hasDisliked = dislikedUsers.includes(profileIdString);
      const hasMatched = matchedUsers.includes(profileIdString);
    
      return (
        profile.username !== username &&
        !hasLiked &&
        !hasDisliked &&
        !hasMatched
      );
    });

    // Shuffle the array
    for (let i = filteredProfiles.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [filteredProfiles[i], filteredProfiles[j]] = [filteredProfiles[j], filteredProfiles[i]];
    }

    return filteredProfiles;
};
  
export const exploreController = async (req, res) => {
  try {
    console.log(req.user);
    let profiles;
    if (!req.user.members) {
      const users = await User.find().select("-password -refreshToken").lean();
      // console.log(users[0])
      const groups = await Group.find().lean();
      const modifiedGroups = groups.map(group => ({ ...group, username: group.name }));
      // console.log(modifiedGroups[0])
      profiles = [...users, ...modifiedGroups]; // concatenate the results
      // console.log(profiles.length)
    } else {
      profiles = await User.find().select("-password -refreshToken").lean();
    }

    const username = req.user.username || req.user.name;
    const filteredProfiles = await shuffleProfiles(profiles, username, req.user._id);
    // console.log(filteredProfiles.length);
    return res.render('explore', { profiles: filteredProfiles, userID: req.user._id , isAuthenticated : req.user ? true : false,layout : 'main' });
  } catch (error) {
    console.error(error);
    return res.status(500).send('Error occurred while fetching profiles');
  }
};