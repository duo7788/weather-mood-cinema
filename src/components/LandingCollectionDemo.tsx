import { BookmarkCheck } from 'lucide-react';
import { getMovieChineseCopy } from '../localization';

export function DemoPoster({ variant = 0 }: { variant?: number }) {
  const titles = ['花样年华', '雨中曲', '暖暖内含光'];
  return <div className={`lp-poster-design lp-poster-${variant}`}>
    <div className="lp-film-window"/>
    <span className="lp-film-art-small">{variant === 0 ? 'A FILM BY WONG KAR WAI' : 'WEATHER MOOD CINEMA'}</span>
    <strong>{titles[variant].split('').map((char, index) => <span key={index}>{char}</span>)}</strong>
    <span className="lp-film-art-caption">{['IN THE MOOD FOR LOVE', "SINGIN’ IN THE RAIN", 'ETERNAL SUNSHINE'][variant]}</span>
  </div>;
}

const films = [
  { id:843, title:'In the Mood for Love', year:'2000', rating:'8.1', city:'Shanghai', weather:'Rainy', mood:'Nostalgic' },
  { id:872, title:"Singin’ in the Rain", year:'1952', rating:'8.2', city:'Paris', weather:'Rainy', mood:'Relaxed' },
  { id:38, title:'Eternal Sunshine', year:'2004', rating:'8.1', city:'New York', weather:'Snowy', mood:'Romantic' },
];
export function LandingCollectionDemo({ visible, color, flipped, onFlip }: { visible:boolean; color:boolean; flipped:boolean; onFlip:()=>void }) {
  return <div className={`lp-collection-scene ${visible ? 'is-visible' : ''}`} aria-hidden={!visible} inert={!visible}>
    <div className="lp-collection-heading"><span>YOUR COLLECTIONS</span><span>3 RECORDS</span></div>
    <div className="lp-demo-collection-grid">{films.map((film,index) => <article className={`lp-demo-collection-card ${index === 0 && color ? 'is-colored' : ''}`} key={film.id}>
      <BookmarkCheck className="lp-demo-bookmark" size={12}/>
      <button className="lp-flip-button" aria-label={`翻转${getMovieChineseCopy(film.id).title}海报`} disabled={index !== 0} onClick={onFlip} aria-pressed={index === 0 && flipped}>
        <span className={`lp-flip-inner ${index === 0 && flipped ? 'is-flipped' : ''}`}>
          <span className="lp-flip-front"><DemoPoster variant={index}/></span>
          <span className="lp-flip-back"><span className="lp-back-kicker">BEHIND THE FRAME</span><em>In the Mood for Love</em><span className="lp-back-description">{getMovieChineseCopy(film.id).overview}</span><span className="lp-back-rule"/><span>有雨 / 温和 / 怀旧</span><small>点击翻回海报</small></span>
        </span>
      </button>
      <span className="lp-flip-hint">CLICK POSTER TO FLIP FOR DETAILS</span>
      <h3>{film.title}</h3><span className="lp-collection-chinese">{getMovieChineseCopy(film.id).title}</span><span className="lp-collection-year">({film.year}) · {film.rating}</span>
      <dl><div><dt>LOCATION</dt><dd>{film.city}</dd></div><div><dt>WEATHER</dt><dd>{film.weather}</dd></div><div><dt>MOOD</dt><dd>{film.mood}</dd></div></dl>
    </article>)}</div>
  </div>;
}
