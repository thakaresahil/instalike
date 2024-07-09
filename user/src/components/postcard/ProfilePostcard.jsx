import { useState } from "react";
import { FcLike } from "react-icons/fc";
import { FaRegComment, FaArrowUp } from "react-icons/fa6";
import axios from "axios";

function ProfilePostcard({
  id,
  userid,
  userpic,
  username,
  image,
  profileImage,
  description,
  likes,
  time,
  onLikes,
  onComment,
}) {
  const [comment, setComment] = useState("");
  const [inputCommentStatus, setInputCommentStatus] = useState(false);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [skip, setSkip] = useState(0);
  const limit = 5;

  const handleLikes = () => {
    onLikes(id);
  };

  const handleComment = () => {
    setInputCommentStatus(!inputCommentStatus);
    loadComments();
  };

  const loadComments = async () => {
    setLoading(true);
    try {
      await axios.post("http://localhost:9000/comments", {
        postId: id,
        limit: limit,
        skip: skip,
      }).then((response) => {
      ;
      setComments((prevComments) => [...prevComments, ...response.data]);
      setSkip((prevSkip) => prevSkip + limit);
      setHasMore(response.data.length === limit);
    }).catch((error) => {
      console.log("Error Making Request : ",error);
    }).finally(()=>{
      setLoading(false);
    })
    ;
    } catch (error) {
      console.error("Error fetching comments:", error);
    }
  };

  const handleCommentChange = (event) => {
    setComment(event.target.value);
  };

  const handleCommentSubmit = () => {
    onComment(id, comment);
  };

  function TimeDifference({ timestamp }) {
    const postDate = new Date(timestamp);
    const now = new Date();
    const diff = now - postDate;
    const diffInHours = Math.floor(diff / (1000 * 60 * 60));
    const diffInDays = Math.floor(diff / (1000 * 60 * 60 * 24));

    return <div>{diffInDays > 0 ? <p>{diffInDays} days ago</p> : <p>{diffInHours} hours ago</p>}</div>;
  }

  return (
    <div className="flex flex-col w-[360px] h-[360px] p-8 px-9 gap-8 my-10">
      <div className="border rounded-md flex flex-col border-none">
        <div className="flex justify-between items-center py-3">
          <div className="flex items-center justify-start gap-4">
            <img src={`http://localhost:9000/profile/` + userpic} alt="profpic" className="w-8 h-8 rounded-full" />
            <h3 className="text-2xl text-white font-semibold">@{username}</h3>
          </div>
        </div>
        <img src={`http://localhost:9000/posts/` + image} alt="postimg" className=" aspect-square " />
        <div className="flex items-center gap-4 py-2">
          <button onClick={handleLikes}>
            <FcLike />
          </button>
          <button onClick={handleComment} className="scale-x-[-1] text-white">
            <FaRegComment />
          </button>
        </div>
        {inputCommentStatus && (
          <div>
            {comments.map((comment) => (
              <div key={comment._id} className="flex flex-col gap-2 text-white">{comment.text}</div>
            ))}
            {loading && <p>Loading...</p>}
            {hasMore && !loading && (
              <button onClick={loadComments} className="mt-4 p-2 bg-blue-500 text-white rounded">
                Load More
              </button>
            )}
          </div>
        )}
        {inputCommentStatus && (
          <div className="flex items-center gap-4">
            <input
              type="text"
              className="w-full bg-black border-none outline-none text-white"
              name="comment"
              placeholder="Enter Comment"
              onChange={handleCommentChange}
            />
            {comment.length > 0 && (
              <button onClick={handleCommentSubmit} className="flex items-center justify-center rounded-lg w-10 text-white p-1 bg-blue-500">
                <FaArrowUp />
              </button>
            )}
          </div>
        )}
        <p className="text-white">{likes} Likes</p>
        <p className="text-white">{description}</p>
        <p className="text-white">
          <TimeDifference timestamp={time} />
        </p>
      </div>
      <hr className="h-px my-2 bg-gray-200 border-0 dark:bg-gray-600" />
    </div>
  );
}

export default ProfilePostcard;
