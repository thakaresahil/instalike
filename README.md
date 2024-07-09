
# Insta Likes 

This project is a full-stack Instagram clone built using the MERN stack (MongoDB, Express.js, React.js, Node.js). It replicates key functionalities of Instagram, providing users with a seamless experience to share, like, and comment on posts. The clone is designed to demonstrate proficiency in MERN stack development and to serve as a portfolio project showcasing front-end and back-end integration.

## More about CRUD

* CRUD refers to the four functions that are considered necessary to implement a persistent storage application: create, read, update and delete.
* CRUD acronym identifies all of the major functions that are inherent to databases.
## Technology Used

**Client:** React.js, Tailwind CSS for styling, React Icons for icons

**Server:** Node.js, Express.js

**Database:** MongoDB for data storage

**Authentication:** JWT (JSON Web Tokens)

**File Uploads:** Multer for handling image uploads

## Getting Started

Prerequisites Node.js and npm installed MongoDB installed and running Installation
To clone this repository

```bash
  git clone https://github.com/thakaresahil/instalike.git
```

```bash
  cd instalike
```

## Install dependencies

```bash
  cd instaserver
```
and

```bash
  cd user
```

```bash
  npm install
```
## License

License This project is licensed under the MIT License.

## Endpoints

### Front-End

| HTTP Methode | URL     | Description                |
| :-------- | :------- | :------------------------- |
| `get` | `http://localhost:3000/` | Home Page |
| `get` | `http://localhost:3000/profile` | Profile |



### Back-End Server

| HTTP Methode | URL     | Description                |
| :-------- | :------- | :------------------------- |
| `post` | `http://localhost:9000/upload/post` | upload posts |
| `post` | `http://localhost:9000/upload/profilepicture` | for uploading profile picture |
| `patch` | `http://localhost:9000/like` | perform Like operation on post |
| `patch` | `http://localhost:9000/post/comment` | perform comment operation |
| `post` | `http://localhost:9000/comment` | Retrieve comments |
| `get` | `http://localhost:9000/profile/:userId` | Retrieve users Profile |
| `get` | `http://localhost:9000/postdata` | Retrieve posts |
| `post` | `http://localhost:9000/signup` | user registration |
| `post` | `http://localhost:9000/login` | user login |


## ScreenShots

### Profile Page
![Profile Page](https://github.com/thakaresahil/instalike/blob/main/samples/profile.png?raw=true)

### Home Page
![Home Page](https://github.com/thakaresahil/poscon/blob/main/samples/home.png?raw=true)