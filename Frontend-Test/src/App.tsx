import React, { useState, useEffect } from 'react';
import './app.css';
import logo from './assets/logo/logo.svg';
import smallheart from './assets/small-heart/smallheart.svg';
import search from './assets/search/search.svg';
import cancel from './assets/cancel/cancel.svg';
import fist from './assets/fist/fist.svg';
import arrowup from './assets/arrow-up/arrowup.svg';
import mediumfilledheart from './assets/medium-filled-heart/mediumfilledheart.svg';
import ContentLoader from 'react-content-loader';
import axios from 'axios';

function HeroBox({ hero, toggleLikeFunc, isLiked }) {
    return (
        <div className="hero-item">
            <div className="hero-box">
                <div className="hero-background" style={{ backgroundImage: `url(${hero.images.md})` }}></div>
                <img src={hero.images.md} alt={hero.name} className="hero-image" />
                <div className="liked-icon-container" onClick={() => toggleLikeFunc(hero)}>
                    <img src={isLiked ? mediumfilledheart : smallheart} alt="Like Icon" />
                </div>
                <div className="hero-details">
                    <div className="hero-name">{hero.name}</div>
                    <div className="hero-real-name">Real name: {hero.biography.fullName}</div>
                    <div className="hero-score">
                        <img src={fist} alt="Fist" className="score-icon" />
                        <strong>{(hero.powerstats.intelligence / 10).toFixed(1)}</strong>/10
                    </div>
                </div>
            </div>
        </div>
    );
}

function App() {
    const [loading, setLoading] = useState(true);
    const [heroes, setHeroes] = useState<any[]>([]);
    const [likedHeroes, setLikedHeroes] = useState<any[]>([]);
    const [showLikedOnly] = useState(false);
    const [isLikedExpanded, setIsLikedExpanded] = useState(false);
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
                const savedLikedHeroes = localStorage.getItem('likedHeroes');
                console.log('Retrieved liked heroes from localStorage:', savedLikedHeroes);
                
                if (savedLikedHeroes) {
                    const parsedLikedHeroes = JSON.parse(savedLikedHeroes);
                    setLikedHeroes(parsedLikedHeroes);
                    setHeroes(response.data.filter(hero => !parsedLikedHeroes.some(likedHero => likedHero.id === hero.id)));
                } else {
                    setHeroes(response.data);
                }
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

    useEffect(() => {
        console.log('Saving liked heroes to localStorage:', likedHeroes);
        localStorage.setItem('likedHeroes', JSON.stringify(likedHeroes));
    }, [likedHeroes]);

    function isHeroLiked(heroId: number) {
        return likedHeroes.some(h => h.id === heroId);
    }

    function toggleLike(hero: any) {
        if (isHeroLiked(hero.id)) {
            setLikedHeroes(prev => {
                const updated = prev.filter(h => h.id !== hero.id);
                console.log('Liked Heroes after unliking:', updated);
                return updated;
            });
            setHeroes(prev => {
                const updated = [...prev, hero];
                console.log('All Heroes after unliking:', updated);
                return updated;
            });
        } else {
            setLikedHeroes(prev => {
                const updated = [...prev, hero];
                console.log('Liked Heroes after liking:', updated);
                return updated;
            });
            setHeroes(prev => {
                const updated = prev.filter(h => h.id !== hero.id);
                console.log('All Heroes after liking:', updated);
                return updated;
            });
        }
    }

    return (
        <div className="App">
            <div className="logo-container">
                <img src={logo} alt="Logo" className="logo" />
            </div>
            <div className="liked-section">
                <div className="liked-tab" onClick={() => setIsLikedExpanded(!isLikedExpanded)}>
                    <img src={smallheart} alt="Liked Tab" />
                    <span>Liked</span>
                    <img src={arrowup} alt="Expand Icon" className={`arrow-icon ${isLikedExpanded ? '' : 'expanded'}`} />
                </div>
                {isLikedExpanded && (
                    <div className={`liked-content ${isLikedExpanded ? 'expanded' : ''}`}>
                        {likedHeroes.map(hero => (
                            <HeroBox key={hero.id} hero={hero} toggleLikeFunc={toggleLike} isLiked={isHeroLiked(hero.id)} />
                        ))}
                    </div>
                )}
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
                        {noHeroesFound ? (
                            <div className="no-heroes-found">No heroes found</div>
                        ) : (
                            <div className={`hero-row ${searchChanged ? (toggleAnimation ? 'fade-in' : 'fade-in-b') : ''}`} onAnimationEnd={() => setSearchChanged(false)}>
                                {heroesToDisplay.map(hero => (
                                    <HeroBox key={hero.id} hero={hero} toggleLikeFunc={toggleLike} isLiked={isHeroLiked(hero.id)} />
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
