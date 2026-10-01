import { lazy, Suspense, useEffect, useState } from 'react';
import LandingPage from './LandingPage';
const CinemaApp = lazy(() => import('./App'));
export default function Entry() {
  const [inApp, setInApp] = useState(() => window.location.hash === '#app');
  useEffect(() => {
    const update = () => { setInApp(window.location.hash === '#app'); window.scrollTo(0, 0); };
    window.addEventListener('hashchange', update);
    return () => window.removeEventListener('hashchange', update);
  }, []);
  return inApp ? <Suspense fallback={<div className="lp-loading">正在进入影院…</div>}><CinemaApp/></Suspense> : <LandingPage/>;
}
