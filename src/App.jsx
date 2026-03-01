import { Routes, Route } from 'react-router-dom';
import { ToastProvider } from './components/Toast.jsx';
import Layout from './components/Layout.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Profile from './pages/Profile.jsx';
import BrandList from './pages/BrandList.jsx';
import AddBrand from './pages/AddBrand.jsx';
import GeneratePitch from './pages/GeneratePitch.jsx';
import PitchReview from './pages/PitchReview.jsx';
import PitchHistory from './pages/PitchHistory.jsx';
import PitchDetail from './pages/PitchDetail.jsx';
import DiscoverBrand from './pages/DiscoverBrand.jsx';

function App() {
    return (
        <ToastProvider>
            <Routes>
                <Route path="/" element={<Layout />}>
                    <Route index element={<Dashboard />} />
                    <Route path="profile" element={<Profile />} />
                    <Route path="brands" element={<BrandList />} />
                    <Route path="brands/new" element={<AddBrand />} />
                    <Route path="pitches/generate" element={<GeneratePitch />} />
                    <Route path="pitches/generate/:brandId" element={<GeneratePitch />} />
                    <Route path="pitches" element={<PitchHistory />} />
                    <Route path="pitches/:id" element={<PitchDetail />} />
                    <Route path="pitches/:id/review" element={<PitchReview />} />
                    <Route path="discover" element={<DiscoverBrand />} />
                </Route>
            </Routes>
        </ToastProvider>
    );
}

export default App;
