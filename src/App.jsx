import { useState, useEffect } from 'react'
import 'bootstrap/dist/css/bootstrap.min.css'
import Onboarding from './Onboarding'
import MainApp from './MainApp'

function App() {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const phone = localStorage.getItem('vao10_phone');
    const apiKey = localStorage.getItem('vao10_apikey');
    if (phone && apiKey) {
      setIsReady(true);
    }
  }, []);

  if (!isReady) {
    return <Onboarding onComplete={() => setIsReady(true)} />
  }

  return <MainApp onLogout={() => {
    localStorage.clear();
    setIsReady(false);
  }} />
}

export default App
