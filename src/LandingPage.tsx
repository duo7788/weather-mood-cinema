import { useEffect, useState } from 'react';
import { ArrowRight, Bookmark, Check, CloudRain, Film, MapPin, MousePointer2, Search } from 'lucide-react';
import { DEMO_DURATION, DEMO_STARTS, demoFrame } from './landing-timeline';
import './landing.css';
import { DemoPoster, LandingCollectionDemo } from './components/LandingCollectionDemo';

const steps = ['选一座城市', '感受此刻天气', '选择你的心情', '遇见一部电影', '收藏电影', '查看收藏', '翻面读简介', '翻回海报'];
function CityDrawing() {
  return <svg viewBox="0 0 720 440" className="lp-city" aria-hidden="true">
    <defs><pattern id="city-blocks" width="76" height="60" patternUnits="userSpaceOnUse" patternTransform="rotate(-24)"><rect x="5" y="5" width="61" height="44" rx="3" fill="#2a2a2a" stroke="#515151" strokeWidth=".6"/><path d="M25 6v43M5 25h61" stroke="#3c3c3c" strokeWidth="1"/></pattern></defs>
    <rect width="720" height="440" fill="#1d1d1d"/><rect width="720" height="440" fill="url(#city-blocks)"/>
    <path d="M460 -50C320 80 560 150 400 280S340 410 420 490" fill="none" stroke="#161616" strokeWidth="60"/>
    <path d="M460 -50C320 80 560 150 400 280S340 410 420 490" fill="none" stroke="#7d7d7d" strokeOpacity=".25" strokeWidth="1"/>
    <g stroke="#939393" strokeWidth="2" opacity=".5"><path d="M-20 370L650 40M60 -10L380 450M0 100L710 370M400 0L650 440"/><path d="M50 210Q330 120 640 235" fill="none"/></g>
    <g fill="#929292" fontSize="10" letterSpacing="3"><text x="150" y="180">JING'AN</text><text x="495" y="315">PUDONG</text><text x="285" y="350">HUANGPU</text></g>
  </svg>;
}
export default function LandingPage() {
  const [elapsed, setElapsed] = useState(0);
  const [playing, setPlaying] = useState(() => !window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => { setPlaying(!media.matches); };
    media.addEventListener('change', update);
    return () => media.removeEventListener('change', update);
  }, []);
  useEffect(() => {
    if (!playing) return;
    const timer = window.setInterval(() => {
      if (!document.hidden) setElapsed(value => (value + 80) % DEMO_DURATION);
    }, 80);
    return () => window.clearInterval(timer);
  }, [playing]);
  const { step, time, posterColor, saved, collections, collectionColor, flipped, clicking, cursor } = demoFrame(elapsed);
  const query = step > 0 ? 'Shanghai' : 'Shanghai'.slice(0, Math.max(0, Math.floor((time - 400) / 150)));
  return <div className="lp">
    <header className="lp-nav"><a className="lp-brand" href="#"><Film size={19}/><span>WEATHER MOOD CINEMA</span></a></header>
    <main>
      <section className="lp-hero">
        <div className="lp-eyebrow"><span/> A LITTLE WEATHER. A LITTLE FEELING. A FILM.</div>
        <h1>让此刻的天气，<br/><span>为你选一部电影。</span></h1>
        <a className="lp-visit-project" href="#app">访问项目 <span className="lp-visit-arrow" aria-hidden="true"><ArrowRight size={15}/></span></a>
      </section>
      <section id="demo" className="lp-demo" aria-label="电影推荐自动演示">
        <div className="lp-demo-top"><span><i/> PRODUCT PREVIEW</span><span>一场关于此刻的放映</span></div>
        <div className="lp-laptop">
          <div className="lp-screen">
            <div className="lp-screen-nav"><span>WEATHER MOOD CINEMA / ED. 01</span><span className="lp-demo-nav"><span className={collections ? "lp-screen-nav-muted" : ""}>ARCHIVE</span><span> / </span><span className={collections ? "lp-nav-current" : "lp-screen-nav-muted"}>COLLECTIONS</span></span></div>
            <div className={`lp-demo-content ${step >= 3 ? 'lp-show-film' : ''}`}>
              <div className="lp-map-scene"><CityDrawing/><div className="lp-map-shade"/>
                <div className="lp-demo-search"><Search size={14}/><span>{query}<b className={step === 0 ? 'lp-caret' : 'lp-caret lp-caret-off'}>|</b></span><span>↵</span></div>
                <div className={`lp-location ${step >= 1 ? 'is-visible' : ''}`}><span className="lp-pin"><MapPin size={20}/></span><span>SHANGHAI</span></div>
                <div className="lp-map-title">{step >= 1 ? <><span>rain in</span><strong>Shanghai.</strong></> : <><span>somewhere,</span><strong>a story awaits.</strong></>}</div>
                <div className={`lp-weather ${step >= 1 ? 'is-visible' : ''}`}><CloudRain size={19}/><span>小雨 · 18°C</span><span>31.23° N, 121.47° E</span></div>
              </div>
              <aside className="lp-mood-scene"><span className="lp-ui-label">HOW DO YOU FEEL?</span><h3>今天，什么心情？</h3>{['放松 RELAXED', '怀旧 NOSTALGIC', '浪漫 ROMANTIC', '治愈 HEALING'].map((mood, index) => <div key={mood} className={`lp-mood ${step >= 2 && index === 1 ? 'lp-mood-selected' : ''}`}>{mood}{step >= 2 && index === 1 && <Check size={13}/>}</div>)}<div className={`lp-demo-submit ${step >= 2 ? 'is-ready' : ''}`}>寻找此刻的电影 <ArrowRight size={13}/></div><p>跟着感觉走，就好。</p></aside>
              <div className="lp-film-scene" aria-hidden={step < 3}>
                <div className={`lp-film-art ${posterColor ? "is-colored" : ""}`}><DemoPoster/></div>
                <div className="lp-film-info"><span className="lp-ui-label">A FILM FOR THIS MOMENT</span><div className="lp-film-tags">上海 · 小雨 · 怀旧</div><h2>花样年华</h2><em>In the Mood for Love</em><span className="lp-film-meta">2000 / 王家卫 / 爱情 · 剧情</span><p>雨落在城市的缝隙里。<br/>那些没说出口的话，<br/>就留在这场电影里。</p><div className={`lp-save ${saved ? 'is-saved' : ''}`}>{saved ? <Check size={15}/> : <Bookmark size={15}/>} {saved ? '已加入我的收藏' : '收藏这部电影'}</div><span className="lp-example-note">示例推荐 · 海报为文字演绎</span></div>
              </div>
              <LandingCollectionDemo visible={collections} color={collectionColor} flipped={flipped} onFlip={() => setElapsed(flipped ? 17000 : 12300)}/>
            </div>
            <MousePointer2 className={`lp-demo-cursor lp-cursor-${cursor} ${clicking ? "lp-cursor-click" : ""}`} size={25} fill="white" stroke="#141414" strokeWidth={1.4}/>
            <div className="lp-screen-bottom"><span>WEATHER × MOOD × CINEMA</span><span>演示模式 / 示例数据</span></div>
          </div><div className="lp-laptop-base"><span/></div>
        </div>
        <div className="lp-steps">{steps.map((label, index) => <button key={label} className={step === index ? 'is-active' : ''} aria-pressed={step === index} onClick={() => { setElapsed(DEMO_STARTS[index]); }}><span>0{index + 1}</span>{label}</button>)}</div>
      </section>
    </main><footer className="lp-footer"><span>WEATHER MOOD CINEMA</span><span>Every weather has a story.</span><a href="#app">今晚，看点什么 <ArrowRight size={13}/></a></footer>
  </div>;
}
