import React, { useEffect, useState } from "react";
import axios from "axios";
import Postcard from "../postcard/Postcard";
import io from "socket.io-client";
import Login from "../signup/Login";
import Register from "../signup/Register";
import Loading from "../loading/Loading";

function Home() {
  const [postData, setPostData] = useState([]);
  const socket = io("http://localhost:9000");
  const uid = localStorage.getItem("uid");
  const token = localStorage.getItem("token");
  const [loading, setLoading] = useState(true);
  const [isLogIn, setIsLogIn] = useState(false);
  const [register, setRegister] = useState(false);

  const fetchProductData = async () => {
    try {
      const response = await axios.post("http://localhost:9000/postsdata", {
        token: token,
      });
      setPostData(response.data);
    } catch (error) {
      console.error("Error Fetching Data: " + error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      setIsLogIn(true);
    }
    fetchProductData();

    // Establish socket connection and listen for postLiked event
    socket.on("like", (data) => {
      setPostData((prevData) =>
        prevData.map((post) =>
          post.id === data.id ? { ...post, likes: post.likes + 1 } : post
        )
      );
    });

    // Clean up socket connection when component unmounts
    return () => {
      socket.disconnect();
    };
  }, [token]);

  const handleLike = async (pid) => {
    if (uid) {
      await axios
        .patch("http://localhost:9000/like", {
          token: token,
          pid: pid,
          uid: uid,
        })
        .then((response) => {
          if (response.data.message === "Already Liked") {
            console.log("Already Liked the post");
          } else if (response.data.message === "Successfully Liked") {
            setPostData((prevData) =>
              prevData.map((post) =>
                post._id === pid ? { ...post, likes: post.likes + 1 } : post
              )
            );
          }
        })
        .catch((error) => {
          console.log("Error Making Request : ", error);
        });
    } else {
      setIsLogIn(false);
      handleLoginComponent();
    }
  };

  const handleCommentSubmit = async (pid, comment) => {
    if (uid) {
      await axios
        .patch("http://localhost:9000/post/comment", {
          token: token,
          uid: uid,
          pid: pid,
          comment: comment,
        })
        .then((response) => {
          if (response.data.message === "Successfully Commented") {
            console.log("Successfully Commented");
          } else if (response.data.message === "Not able to comment") {
            console.log("Not able to comment");
          }
        })
        .catch((error) => {
          console.log("Error Making Request : ", error);
        });
    }
  };

  const handleregister = () => {
    setIsLogIn(false);
    setRegister(true);
  };

  const handleLoginComponent = () => {
    setRegister(false);
    setIsLogIn(true);
  };
  const handleClose = () => {
    setIsLogIn(false);
    setRegister(false);
  };

  return (
    <div className="container mx-auto flex flex-col items-center justify-start gap-6 my-6">
      {loading ? (
        <Loading />
      ) : postData.length > 0 ? (
        postData.map((postItem) => (
          <Postcard
            key={postItem._id}
            id={postItem._id}
            userid={postItem.userid}
            userpic={postItem.userDetails.profilePicture}
            username={postItem.userDetails.username}
            image={postItem.image}
            profileImage={postItem.userDetails.profilePicture}
            description={postItem.description}
            likes={postItem.likes.length}
            time={postItem.createdAt}
            onLikes={handleLike}
            onComment={handleCommentSubmit}
          />
        ))
      ) : (
        <p>No posts available</p>
      )}

      {isLogIn ? (
        <Login
          open={isLogIn}
          handleClose={handleClose}
          handleRegister={handleregister}
        />
      ) : null}
      {Register ? (
        <Register
          open={register}
          handleClose={handleClose}
          handleLoginComponent={handleLoginComponent}
        />
      ) : null}
    </div>
  );
}

export default Home;
