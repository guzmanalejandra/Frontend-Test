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



// Componente para mostrar la información de un superhéroe
function HeroBox({ hero, toggleLikeFunc, isLiked, recentlyLikedHeroId }) {  // Agregamos recentlyLikedHeroId como prop
    const averageScore = (
        hero.powerstats.intelligence + 
        hero.powerstats.strength + 
        hero.powerstats.combat + 
        hero.powerstats.durability
    ) / 4 / 10;
    
    return (
        <div className="hero-item">
            <div className="hero-box">
                
                {hero.id === recentlyLikedHeroId && <div className="recently-liked">Recently Liked</div>}

                <div className="hero-background" style={{ backgroundImage: `url(${hero.images.md})` }}></div>
                <img src={hero.images.md} alt={hero.name} className="hero-image" />
                <div className="liked-icon-container" onClick={() => toggleLikeFunc(hero)}>
                    <img src={isLiked ? mediumfilledheart : smallheart} alt="Like Icon" className={isLiked ? 'liked' : ''} />
                </div>
                <div className="hero-details">
                    <div className="hero-name">{hero.name}</div>
                    <div className="hero-real-name">Real name: {hero.biography.fullName}</div>
                    <div className="hero-score">
                        <img src={fist} alt="Fist" className="score-icon" />
                        <strong>{averageScore.toFixed(1)}</strong>/10
                    </div>
                </div>
            </div>
        </div>
    );
}

function App() {
    // Estado de la aplicación
    const [loading, setLoading] = useState(true); // Estado de carga de datos
    const [heroes, setHeroes] = useState<any[]>([]); // Lista de héroes
    const [likedHeroes, setLikedHeroes] = useState<any[]>([]); // Héroes que el usuario ha dado "me gusta"
    const [isLikedExpanded, setIsLikedExpanded] = useState(false); // Expandir o contraer la sección de "me gusta"
    const [searchTerm, setSearchTerm] = useState(""); // Término de búsqueda
    const [noHeroesFound, setNoHeroesFound] = useState(false);  // Indicador de no hay héroes encontrados
    const [searchChanged, setSearchChanged] = useState(false); // Indicador de que el término de búsqueda ha cambiado
    const [toggleAnimation, setToggleAnimation] = useState(false); // Alternar animación al cambiar la búsqueda
    const [recentlyLikedHeroId, setRecentlyLikedHeroId] = useState<number | null>(null);



    // Filtrar héroes según el término de búsqueda
    const filteredHeroes = heroes.filter(hero => 
        hero.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        hero.biography.fullName.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const heroesToDisplay = filteredHeroes;

    // Efecto para cargar los héroes al montar el componente
    useEffect(() => {
        async function fetchData() {
            try {
                const response = await axios.get('https://akabab.github.io/superhero-api/api/all.json');
                const savedLikedHeroes = localStorage.getItem('likedHeroes');
                console.log('Retrieved liked heroes from localStorage:', savedLikedHeroes);

                 // Si hay héroes guardados en localStorage que el usuario ha dado "me gusta", se filtran
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

     // Efecto para verificar si no se encontraron héroes
    useEffect(() => {
        setNoHeroesFound(heroesToDisplay.length === 0); 
    }, [heroesToDisplay]);

    // Efecto para guardar héroes con "me gusta" en localStorage
    useEffect(() => {
        console.log('Saving liked heroes to localStorage:', likedHeroes);
        localStorage.setItem('likedHeroes', JSON.stringify(likedHeroes));
    }, [likedHeroes]);

    // Verificar si un héroe tiene "me gusta"
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
        // Si no tiene "me gusta", se añade
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
            setRecentlyLikedHeroId(hero.id);
            setTimeout(() => {
                setRecentlyLikedHeroId(null);
            }, 5000);
        }
    }

    // Renderizado del componente principal
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
                            <HeroBox key={hero.id} hero={hero} toggleLikeFunc={toggleLike} isLiked={isHeroLiked(hero.id)} recentlyLikedHeroId={recentlyLikedHeroId} />

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
