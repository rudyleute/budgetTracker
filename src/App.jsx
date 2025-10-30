import "./styles/main.css";
import {BrowserRouter as Router, Routes, Route} from "react-router-dom";
import Layout from './Layout.jsx';
import Dashboard from './pages/Dashboard.jsx';
import NotFound from './pages/NotFound.jsx';
import Profile from './pages/Profile.jsx';
import Main from './pages/Main.jsx';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Layout />} >
          <Route index element={<Main />}/>
          <Route path={"dashboard"} element={<Dashboard />} />
          <Route path={"profile"} element={<Profile />} />
          <Route path={"*"} element={<NotFound />} />
        </Route>
      </Routes>
    </Router>
  )
}

export default App
