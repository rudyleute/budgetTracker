import "./styles/main.css";
import { Routes, Route, Navigate, Outlet } from "react-router-dom";
import Layout from './Layout.jsx';
import DashboardPage from './pages/DashboardPage.jsx';
import NotFoundPage from './pages/NotFoundPage.jsx';
import ProfilePage from './pages/ProfilePage.jsx';
import MainPage from './pages/MainPage.jsx';
import LoginPage from './pages/LoginPage.jsx';
import { useAccount } from './context/AccountProvider.jsx';
import UnauthorizedPage from './pages/UnauthorizedPage.jsx';
import SignUpPage from './pages/SignUpPage.jsx';
import { LoansProvider } from './context/LoansProvider.jsx';
import LoansPage from './pages/LoansPage.jsx';

function App() {
  const { isAuthenticated } = useAccount();

  return (
    <Routes>
      {isAuthenticated ?
        <Route path="/" element={<Layout/>}>
          <Route index element={<MainPage/>}/>
          <Route path={"dashboard"} element={<DashboardPage/>}/>
          <Route path={"loans"} element={<LoansProvider>
            <Outlet/>
          </LoansProvider>}>
            <Route index element={<LoansPage />} />
          </Route>
          <Route path={"profile"} element={<ProfilePage/>}/>
          <Route path={"login"} element={<Navigate to="/" replace/>}/>
          <Route path={"signup"} element={<Navigate to="/" replace/>}/>
          <Route path={"*"} element={<NotFoundPage/>}/>
        </Route> :
        <Route path={"/"}>
          <Route index element={<Navigate to="/login" replace/>}/>
          <Route path={"login"} element={<LoginPage/>}/>
          <Route path={"signup"} element={<SignUpPage/>}/>
          <Route path={"*"} element={<UnauthorizedPage/>}/>
        </Route>
      }
    </Routes>
  )
}

export default App
