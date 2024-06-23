function Postcard({
  id,
  userid,
  username,
  image,
  description,
  likes,
  time,
  onLikes,
}) {

  const handleingLikes = () =>{
    onLikes(id);
  }


  return (
    <div className="border p-8 px-9 w-1/3 rounded-md flex flex-col">
      <div className="flex justify-between items-center ">
        <h3 className="text-2xl font-semibold">@{username}</h3>
        <p>{time}</p>
      </div>
      <img
        src={`http://localhost:9000/` + image}
        alt="postimg"
        className="h-96 "
      />
      <p>{description}</p>
      <div className="flex items-center gap-4">
      <button onClick={handleingLikes}>🩷</button>
      <p>{likes} Likes</p>
      </div>
    </div>
  );
}

export default Postcard;
