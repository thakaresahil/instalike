import { RouterProvider, createBrowserRouter } from 'react-router-dom';
import './App.css';
import NavBar from './components/navbar/NavBar';
import Home from './components/home/Home';
import Post from './components/post/Post';
import Profile from './components/profile/Profile';
import Login from './components/signup/Login';

function App() {
  const commonLayout = (component) => (
    <>
      <NavBar />
      {component}
    </>
  );

  const router = createBrowserRouter([
    {
      path: "/",
      element: commonLayout(<Home/>),
    },
    {
      path: "/post",
      element: commonLayout(<Post/>),
    },
    {
      path: "/profile",
      element: commonLayout(<Profile/>),
    },
    {
      path: "/login",
      element: commonLayout(<Login/>),
    },
  ]);

  
    return <RouterProvider router={router} />;
}

export default App;
