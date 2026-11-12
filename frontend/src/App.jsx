import { useEffect } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Guard } from './components/Screen.jsx';
import { Landing, SignIn } from './pages/auth.jsx';
import { Home, Place, StartLocation, Navigate as NavigatePage, ReportBarrier, PlanArrival, Directory } from './pages/user.jsx';
import { RequestHelp, Chat } from './pages/help.jsx';
import { OpenRequests, ActiveRequest } from './pages/helper.jsx';
import { AdminHome, BarrierReports, ReportDetails, HelperAccounts, DirectoryEntries, EditEntry } from './pages/admin.jsx';
import { VisitorHome, EventSearch, Entrances, StaffHome } from './pages/visitor.jsx';

const G = (allow, el) => <Guard allow={allow}>{el}</Guard>;
const ANY = 'any';
const PUBLIC = ['user', 'visitor', 'staff'];

function ScrollTop() {
  const { pathname } = useLocation();
  useEffect(() => { window.scrollTo(0, 0); }, [pathname]);
  return null;
}

export default function App() {
  return (
    <>
      <ScrollTop />
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/signin/:role" element={<SignIn />} />

        {/* Campus User */}
        <Route path="/home" element={G(['user'], <Home />)} />
        <Route path="/plan" element={G(['user', 'visitor'], <PlanArrival />)} />

        {/* Shared by everyone who is not an administrator */}
        <Route path="/place/:id" element={G(ANY, <Place />)} />
        <Route path="/start" element={G(ANY, <StartLocation />)} />
        <Route path="/navigate" element={G(ANY, <NavigatePage />)} />
        <Route path="/directory" element={G(['user', 'staff', 'visitor'], <Directory />)} />
        <Route path="/barrier/new" element={G(['user', 'staff'], <ReportBarrier />)} />

        {/* Help requests */}
        <Route path="/help/new" element={G(PUBLIC.filter((r) => r !== 'staff'), <RequestHelp />)} />
        <Route path="/help/:id/chat" element={G(['user', 'helper', 'visitor'], <Chat />)} />

        {/* Visitor and Staff */}
        <Route path="/visitor" element={G(['visitor'], <VisitorHome />)} />
        <Route path="/visitor/events" element={G(['visitor'], <EventSearch />)} />
        <Route path="/visitor/entrances" element={G(['visitor', 'user'], <Entrances />)} />
        <Route path="/staff" element={G(['staff'], <StaffHome />)} />

        {/* Authorized Helper */}
        <Route path="/helper" element={G(['helper'], <OpenRequests />)} />
        <Route path="/helper/active/:id" element={G(['helper'], <ActiveRequest />)} />

        {/* Administrator */}
        <Route path="/admin" element={G(['admin'], <AdminHome />)} />
        <Route path="/admin/reports" element={G(['admin'], <BarrierReports />)} />
        <Route path="/admin/reports/:id" element={G(['admin'], <ReportDetails />)} />
        <Route path="/admin/helpers" element={G(['admin'], <HelperAccounts />)} />
        <Route path="/admin/directory" element={G(['admin'], <DirectoryEntries />)} />
        <Route path="/admin/directory/:id" element={G(['admin'], <EditEntry />)} />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}
