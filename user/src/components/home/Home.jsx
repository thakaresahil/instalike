import React, { useEffect, useState } from "react";
import axios from "axios";
import Postcard from "../postcard/Postcard";
import io from "socket.io-client";
import Login from "../signup/Login";
import Register from "../signup/Register";

function Home() {
  const [postData, setPostData] = useState([]);
  const socket = io("http://localhost:9000");
  const uid = localStorage.getItem("uid");
  const [isLogIn, setIsLogIn] = useState(false);
  const [register, setRegister] = useState(false);

  const fetchProductData = async () => {
    try {
      const response = await axios.get("http://localhost:9000/postsdata");
      setPostData(response.data);
    } catch (error) {
      console.error("Error Fetching Data: " + error);
    }
  };

  useEffect(() => {
    if (uid) {
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
  }, []);

  const handlelike = async (pid) => {
    if (uid) {
      await axios.patch("http://localhost:9000/like", { pid: pid });
    } else {
      setIsLogIn(false);
      handleLoginComponent();
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
      {postData.length > 0 &&
        postData.map((postItem) => (
          <Postcard
            key={postItem.id}
            id={postItem.id}
            userid={postItem.userid}
            username={postItem.username}
            image={postItem.image}
            description={postItem.description}
            likes={postItem.likes}
            time={postItem.created_at}
            onLikes={handlelike}
          />
        ))}

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
