import React, { useEffect, useState } from "react";
import axios from "axios";
import Postcard from "../postcard/Postcard";

function Profile() {
  const [user, setUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [profileUpload, setProfileUpload] = useState(false);
  const [loading, setLoading] = useState(true);
  const userId = localStorage.getItem("uid");
  const maxSize = 5 * 1048576;
  const token = localStorage.getItem("token");
  const [profileImage, setProfileImage] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await axios.get(
          `http://localhost:9000/profile/${userId}`
        );
        setUser(response.data.user);
        setPosts(response.data.posts);
        setLoading(false);
        console.log(response.data);
      } catch (error) {
        console.error("Error fetching profile data:", error);
        setLoading(false);
      }
    };

    fetchProfile();
  }, [userId]);

  const profileUploading = () => {
    setProfileUpload(!profileUpload);
  };

  const handleProfileChange = (e) => {
    const selectFile = e.target.files[0];
    if (selectFile && selectFile.size > maxSize) {
      alert("File size exceeds the maximum limit of 5MB");
      setProfileImage(null);
    } else {
      setProfileImage(selectFile);
    }
  };

  const handleLogOut = () => {
    localStorage.removeItem("uid");
    localStorage.removeItem("token");
  }

  const handleUploadingPart = async () => {
    if (token && profileImage) {
      const formData = new FormData();
      formData.append("profileImage", profileImage);
      formData.append("uid", userId);
      try {
        const response = await axios.post(
          "http://localhost:9000/upload/profilepicture",
          formData
        );
        console.log(response.data);
        setProfileUpload(false);
        // Optionally refresh user data to show the updated profile picture
        setUser((prevUser) => ({
          ...prevUser,
          profilePicture: URL.createObjectURL(profileImage),
        }));
      } catch (error) {
        console.error("Error uploading profile picture:", error);
      }
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className=" text-white container mx-auto">
      {user ? (
        <div className="flex flex-col md:mx-80">
          <div className="flex justify-between flex-col md:flex-row gap-10 h-60 ">
            <div className="flex flex-col justify-start items-center">
              <img
                src={`http://localhost:9000/profile/` + user.profilePicture}
                alt="Profile"
                onClick={profileUploading}
                className="w-[160px] h-[160px] rounded-full"
              />
              {profileUpload && (
                <label htmlFor="profile-upload">
                  <button className="bg-gray-900 px-3 py-1 rounded-lg">
                    <input
                      id="profile-upload"
                      type="file"
                      className="w-20 "
                      onChange={handleProfileChange}
                      onClick={(e) => (e.target.value = null)} // Reset input value to allow same file upload
                    />
                  </button>
                </label>
              )}
              {profileImage && (
                <button
                  className="bg-blue-500 px-3 py-1 rounded-lg mt-2"
                  onClick={handleUploadingPart}
                >
                  Save Profile Image
                </button>
              )}
            </div>
            <div className="flex flex-col justify-around items-center gap-2">
              <div className="flex w-full justify-between items-center">
                <h1 className="text-xl font-medium ">{user.username}</h1>
                <button className="bg-gray-800 rounded-md px-4 py-1">
                  Edit Profile
                </button>
                <button className="bg-gray-800 rounded-md px-4 py-1" onClick={handleLogOut}>
                  Log Out
                </button>
              </div>
              <div className="flex justify-start items-center gap-8">
                <p>{posts.length} Posts</p>
                <p>{user.followers.length} Followers</p>
                <p>{user.following.length} Following</p>
              </div>
              <p>{user.bio}</p>
            </div>
          </div>
          <div className="w-full mt-6">
            <h2 className="text-xl font-semibold">Posts</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {posts.map((post) => (
                <Postcard
                  key={post._id}
                  id={post._id}
                  userid={post.userId}
                  userpic={user.profilePicture || "default_profile_picture_url"}
                  username={user.username}
                  image={post.image}
                  description={post.description}
                  likes={post.likes.length}
                  time={post.createdAt}
                  onLikes={(postId) => console.log("Like post", postId)} // Implement like function
                  onComment={(postId, comment) =>
                    console.log("Comment on post", postId, comment)
                  } // Implement comment function
                />
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div>User not found</div>
      )}
    </div>
  );
}

export default Profile;
