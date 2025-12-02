import "./styles/main.css";
import { Routes, Route, Navigate } from "react-router-dom";
import Layout from './Layout.jsx';
import Dashboard from './pages/Dashboard.jsx';
import NotFound from './pages/NotFound.jsx';
import Profile from './pages/Profile.jsx';
import Main from './pages/Main.jsx';
import Login from './pages/Login.jsx';
import { useAccount } from './context/AccountProvider.jsx';
import Unauthorized from './pages/Unauthorized.jsx';
import SignUp from './pages/SignUp.jsx';

function App() {
  const { isAuthenticated } = useAccount();

  return (
    <Routes>
      {isAuthenticated ?
        <Route path="/" element={<Layout/>}>
          <Route index element={<Main/>}/>
          <Route path={"dashboard"} element={<Dashboard/>}/>
          <Route path={"loans"}>
            <Route index element={<div>Loans</div>} />
          </Route>
          <Route path={"counterparties"}>
            <Route index element={<div>Counterparties</div>} />
            <Route path={":id"} element={<div>Counterparty</div>} />
          </Route>
          <Route path={"profile"} element={<Profile/>}/>
          <Route path={"login"} element={<Navigate to="/" replace/>}/>
          <Route path={"signup"} element={<Navigate to="/" replace/>}/>
          <Route path={"*"} element={<NotFound/>}/>
        </Route> :
        <Route path={"/"}>
          <Route index element={<Navigate to="/login" replace/>}/>
          <Route path={"login"} element={<Login/>}/>
          <Route path={"signup"} element={<SignUp/>}/>
          <Route path={"*"} element={<Unauthorized/>}/>
        </Route>
      }
    </Routes>
  )
}

export default App
