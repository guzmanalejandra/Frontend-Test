import React, { useState, useEffect } from 'react';
import './app.css';
import logo from './assets/logo/logo.svg';
import smallheart from './assets/small-heart/smallheart.svg';
import search from './assets/search/search.svg';
import cancel from './assets/cancel/cancel.svg';
import ContentLoader from 'react-content-loader';
import axios from 'axios';

function App() {
  const [loading, setLoading] = useState(true);
  const [heroes, setHeroes] = useState<any[]>([]);
  const [likedHeroes, setLikedHeroes] = useState<any[]>([]);
  const [showLikedOnly, setShowLikedOnly] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [noHeroesFound, setNoHeroesFound] = useState(false); 
  const [searchChanged, setSearchChanged] = useState(false);
  const [toggleAnimation, setToggleAnimation] = useState(false);

  
  


  

  const filteredHeroes = heroes.filter(hero => 
    hero.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    hero.biography.fullName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const heroesToDisplay = showLikedOnly ? likedHeroes : filteredHeroes;

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await axios.get('https://akabab.github.io/superhero-api/api/all.json');
        setHeroes(response.data);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  useEffect(() => {
    setNoHeroesFound(heroesToDisplay.length === 0); 
  }, [heroesToDisplay]);

  function toggleLike(hero: any) {
    if (likedHeroes.includes(hero)) {
      setLikedHeroes(prev => prev.filter(h => h !== hero));
    } else {
      setLikedHeroes(prev => [...prev, hero]);
    }
  }

  return (
    <div className="App">
      <div className="logo-container">
        <img src={logo} alt="Logo" className="logo" />
      </div>
      <div className="tabs">
        <button onClick={() => setShowLikedOnly(false)}>All Superheroes</button>
        <button onClick={() => setShowLikedOnly(true)}>Liked</button>
      </div>

      <div className={`nav-items ${!loading ? 'fade-in' : ''}`}>
        {loading ? (
          <ContentLoader 
            speed={5}
            width={400}
            height={160}
            viewBox="0 0 400 160"
            backgroundColor="#f3f3f3"
            foregroundColor="#ecebeb"
          >
            {/* Loader items */}
          </ContentLoader>
        ) : (
          <>
            <div className="hero-title-container">
              <div className="hero-title">All Superheroes</div>
            </div>

            <div className="search-container">
              <img src={search} alt="Search Icon" className="search-icon" />
              <input 
                type="text" 
                placeholder="Search" 
                value={searchTerm} 
                onChange={e => {setSearchTerm(e.target.value);
                                              setSearchChanged(true);
                                              setToggleAnimation(prev => !prev);
                                            }}
                className="search-input"
              />
              <img src={cancel} alt="Cancel Search" className="cancel-icon" onClick={() => setSearchTerm('')} />
            </div>

            {/* Conditional rendering for no heroes found */}
            {noHeroesFound ? (
              <div className="no-heroes-found">No heroes found</div>
            ) : (
              <div className={`hero-row ${searchChanged ? (toggleAnimation ? 'fade-in' : 'fade-in-b') : ''}`} onAnimationEnd={() => setSearchChanged(false)}>
                {heroesToDisplay.map((hero, index) => (
                  <React.Fragment key={hero.id}>
                    {(index % 4 === 0 && index !== 0) && <div className="clear"></div>}
                    <div className="hero-item">
                      <div className="hero-box">
                        <div className="hero-background" style={{ backgroundImage: `url(${hero.images.md})` }}></div>
                        <img src={hero.images.md} alt={hero.name} className="hero-image" />
                        <div className="liked-icon-container" onClick={() => toggleLike(hero)}>
                          <img src={smallheart} alt="Like Icon" />
                        </div>
                        <div className="hero-details">
                          <div className="hero-name">{hero.name}</div>
                          <div className="hero-real-name">Real name: {hero.biography.fullName}</div>
                          <div className="hero-score">{(hero.powerstats.intelligence / 10).toFixed(1)}/10</div>
                        </div>
                      </div>
                    </div>
                  </React.Fragment>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default App;
