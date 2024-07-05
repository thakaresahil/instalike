import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function Post() {
  const navigate = useNavigate();
  const [formError, setFormError] = useState("");
  const maxSize = 5 * 1048576;
  const uid = localStorage.getItem("uid");
  const token = localStorage.getItem("token");
  const [postImg, setPostImg] = useState();

  const [post, setPost] = useState({
    userid: uid,
    description: "",
  });

  function handdlechange(event) {
    setPost({
      ...post,
      [event.target.name]: event.target.value,
    });
  }

  const handleFileChange = (e) => {
    e.preventDefault();
    const selectedFile = e.target.files[0];
    if (selectedFile && selectedFile.size > maxSize) {
      setFormError("File size exceeds 5MB");
      setPostImg(null);
    } else {
      setFormError("");
      setPostImg(selectedFile);
    }
  };

  const handlePostPost = async (e) => {
    e.preventDefault();
    if (!postImg) {
      setFormError("Error: No file selected");
      return;
    }
    if (token) {
      const formData = new FormData();
      formData.append("postImg", postImg); // Ensure this key matches the server expectation
      formData.append("uid", post.userid);
      formData.append("description", post.description);

      await axios
        .post("http://localhost:9000/upload/post", formData)
        .then((response) => {
          try {
            const result = response.data;
            if (result.route === "home") {
              navigate("/");
            }
          } catch (err) {
            console.error("Error parsing JSON", err);
          }
        })
        .catch((err) => {
          if (err.response && err.response.status === 403) {
            setFormError("Session Expired, Please Log In");
            localStorage.removeItem("token");
            localStorage.removeItem("uid");
          }
          console.error("Error making the request: ", err);
        });
    } else {
      navigate("/");
    }
  };

  return (
    <div className="container mx-auto flex flex-col items-start gap-4 justify-center h-1/2 w-1/2 p-4">
      <h1 className="text-3xl font-semibold">Create Post</h1>
      <div className="flex items-center justify-center w-full">
        <label
          htmlFor="dropzone-file"
          className="flex flex-col items-center justify-center w-full h-64 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 dark:hover:bg-bray-800 dark:bg-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:hover:border-gray-500 dark:hover:bg-gray-600"
        >
          <div className="flex flex-col items-center justify-center pt-5 pb-6">
            <svg
              className="w-8 h-8 mb-4 text-gray-500 dark:text-gray-400"
              aria-hidden="true"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 20 16"
            >
              <path
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"
              />
            </svg>
            <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">
              <span className="font-semibold">Click to upload</span> or drag and
              drop
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              PNG, JPG (MAX. SIZE 5MB)
            </p>
          </div>
          <input
            id="dropzone-file"
            type="file"
            className="hidden"
            name="postImg"
            onChange={handleFileChange}
          />
        </label>
      </div>
      <input
        type="text"
        row="5"
        className="block border border-grey-light w-full p-3 rounded mb-4"
        name="description"
        placeholder="description"
        onChange={handdlechange}
        value={post.description}
      />
      {formError && (
        <p className="text-red-600 text-sm w-full mx-auto">{formError}</p>
      )}
      <button
        onClick={handlePostPost}
        className="bg-gray-600 rounded-md p-3 w-full"
      >
        Post
      </button>
    </div>
  );
}

export default Post;
