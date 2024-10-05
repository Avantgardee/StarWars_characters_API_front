import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import CharacterCard from './components/CharacterCard';

const App = () => (
    <Router>
        <Routes>
            <Route path="/" element={<CharacterCard />} />
        </Routes>
    </Router>
);

export default App;