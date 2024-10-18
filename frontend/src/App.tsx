import { Routes, Route } from "react-router-dom";

import NewQuestion from "./pages/NewQuestion";
import QuestionDetail from "./pages/QuestionDetail";
import QuestionEdit from "./pages/QuestionEdit";
import PageNotFound from "./pages/PageNotFound";
import ProfilePage from "./pages/Profile";
import QuestionList from "./pages/QuestionList";
import Landing from "./pages/Landing";
import Home from "./pages/Home";
import SignUp from "./pages/SignUp";
import LogIn from "./pages/LogIn";
import Matched from "./pages/Matched";
import Timeout from "./pages/Timeout";
import ProtectedRoutes from "./components/ProtectedRoutes";
import Matching from "./pages/Matching";
import Layout from "./components/Layout";
import AuthProvider from "./contexts/AuthContext";
import ProfileContextProvider from "./contexts/ProfileContext";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import MatchProvider from "./contexts/MatchContext";
import CollabSandbox from "./pages/CollabSandbox";
import NoDirectAccessRoutes from "./components/NoDirectAccessRoutes";
import EmailVerification from "./pages/EmailVerification";

function App() {
  return (
    <AuthProvider>
      <MatchProvider>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Landing />} />
            <Route path="home" element={<ProtectedRoutes />}>
              <Route index element={<Home />} />
            </Route>
            <Route path="questions">
              <Route index element={<QuestionList />} />
              <Route path=":questionId" element={<QuestionDetail />} />
              <Route element={<ProtectedRoutes adminOnly />}>
                <Route path="new" element={<NewQuestion />} />
                <Route path=":questionId/edit" element={<QuestionEdit />} />
              </Route>
            </Route>
            <Route
              path="profile/:userId"
              element={
                <ProfileContextProvider>
                  <ProfilePage />
                </ProfileContextProvider>
              }
            />
            <Route path="matching" element={<ProtectedRoutes />}>
              <Route element={<NoDirectAccessRoutes />}>
                <Route index element={<Matching />} />
                <Route path="matched" element={<Matched />} />
                <Route path="timeout" element={<Timeout />} />
              </Route>
            </Route>
            <Route path="collaboration" element={<ProtectedRoutes />}>
              <Route element={<NoDirectAccessRoutes />}>
                <Route index element={<CollabSandbox />} />
              </Route>
            </Route>
            <Route path="*" element={<PageNotFound />} />
          </Route>
          <Route path="/auth">
            <Route path="signup" element={<SignUp />} />
            <Route path="login" element={<LogIn />} />
            <Route path="verifyEmail/:userId" element={<EmailVerification />} />
          </Route>
        </Routes>
      </MatchProvider>
      <ToastContainer position="bottom-right" />
    </AuthProvider>
  );
}

export default App;
