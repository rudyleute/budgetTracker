import "./styles/main.css";
import { Routes, Route, Navigate } from "react-router-dom";
import Layout from './Layout.jsx';
import Dashboard from './pages/Dashboard.jsx';
import NotFound from './pages/NotFound.jsx';
import Profile from './pages/Profile.jsx';
import Main from './pages/Main.jsx';
import Login from './pages/Login.jsx';
import { useAccount } from './context/AccountProvider.jsx';
import { isEmpty } from 'lodash';
import Unauthorized from './pages/Unauthorized.jsx';
import SignUp from './pages/SignUp.jsx';
import { GridLoader } from 'react-spinners';

function App() {
  const { user, loading } = useAccount();

  if (loading) {
    return (
      <div className="w-full h-screen t-b-color flex items-center justify-center">
        <GridLoader size={30} color={"#640D5F"}/>
      </div>
    );
  }

  return (
    <Routes>
      {isEmpty(user) ?
        <Route path={"/"}>
          <Route index element={<Navigate to="/login" replace/>}/>
          <Route path={"login"} element={<Login/>}/>
          <Route path={"signup"} element={<SignUp/>}/>
          <Route path={"*"} element={<Unauthorized/>}/>
        </Route> :
        <Route path="/" element={<Layout/>}>
          <Route index element={<Main/>}/>
          <Route path={"dashboard"} element={<Dashboard/>}/>
          <Route path={"profile"} element={<Profile/>}/>
          <Route path={"login"} element={<Navigate to="/" replace/>}/>
          <Route path={"signup"} element={<Navigate to="/" replace/>}/>
          <Route path={"*"} element={<NotFound/>}/>
        </Route>
      }
    </Routes>
  )
}

export default App
