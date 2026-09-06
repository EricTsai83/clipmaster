import { createRoot } from 'react-dom/client';

import './index.css';
import Application from './components/application';

const container = document.getElementById('root');
if (!container) throw new Error('Missing root element');
const root = createRoot(container);

root.render(<Application />);
