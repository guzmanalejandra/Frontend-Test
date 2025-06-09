import { useState, useEffect } from 'react'
import './app.css'
import logo from './assets/logo/logo.svg'
import smallheart from './assets/small-heart/smallheart.svg'
import search from './assets/search/search.svg'
import cancel from './assets/cancel/cancel.svg'
import fist from './assets/fist/fist.svg'
import arrowup from './assets/arrow-up/arrowup.svg'
import mediumfilledheart from './assets/medium-filled-heart/mediumfilledheart.svg'
import ContentLoader from 'react-content-loader'
import axios from 'axios'
import { FixedSizeGrid as Grid } from 'react-window'

function HeroBox({ hero, toggleLikeFunc, isLiked, recentlyLikedHeroId }: any) {
  const averageScore =
    (hero.powerstats.intelligence +
      hero.powerstats.strength +
      hero.powerstats.combat +
      hero.powerstats.durability) /
    4 /
    10

  return (
    <div className="hero-item">
      <div className="hero-box">
        {hero.id === recentlyLikedHeroId && (
          <div className="recently-liked">Recently Liked</div>
        )}
        <div
          className="hero-background"
          style={{ backgroundImage: `url(${hero.images.md})` }}
        ></div>
        <img src={hero.images.md} alt={hero.name} className="hero-image" />
        <div
          className="liked-icon-container"
          onClick={() => toggleLikeFunc(hero)}
        >
          <img
            src={isLiked ? mediumfilledheart : smallheart}
            alt="Like Icon"
            className={isLiked ? 'liked' : ''}
          />
        </div>
        <div className="hero-details">
          <div className="hero-name">{hero.name}</div>
          <div className="hero-real-name">
            Real name: {hero.biography.fullName}
          </div>
          <div className="hero-score">
            <img src={fist} alt="Fist" className="score-icon" />
            <strong>{averageScore.toFixed(1)}</strong>/10
          </div>
        </div>
      </div>
    </div>
  )
}

function useWindowDimensions() {
  const [dimensions, setDimensions] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  })

  useEffect(() => {
    const handleResize = () => {
      setDimensions({
        width: window.innerWidth,
        height: window.innerHeight,
      })
    }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  return dimensions
}

function App() {
  const [loading, setLoading] = useState(true)
  const [heroes, setHeroes] = useState<any[]>([])
  const [likedHeroes, setLikedHeroes] = useState<any[]>([])
  const [isLikedExpanded, setIsLikedExpanded] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [noHeroesFound, setNoHeroesFound] = useState(false)
  const [searchChanged, setSearchChanged] = useState(false)
  const [toggleAnimation, setToggleAnimation] = useState(false)
  const [recentlyLikedHeroId, setRecentlyLikedHeroId] = useState<number | null>(null)
  const { width } = useWindowDimensions()

  const filteredHeroes = heroes.filter(
    (hero) =>
      hero.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      hero.biography.fullName.toLowerCase().includes(searchTerm.toLowerCase())
  )

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await axios.get(
          'https://akabab.github.io/superhero-api/api/all.json'
        )
        setHeroes(response.data)
      } catch (error) {
        console.error('Error fetching data:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  useEffect(() => {
    const savedLikedHeroIds = localStorage.getItem('likedHeroIds')
    if (savedLikedHeroIds) {
      const parsedLikedHeroIds = JSON.parse(savedLikedHeroIds)
      setLikedHeroes(parsedLikedHeroIds)
    }
  }, [])

  useEffect(() => {
    setNoHeroesFound(filteredHeroes.length === 0)
  }, [filteredHeroes])

  useEffect(() => {
    const likedHeroIds = likedHeroes.map((hero) => hero.id)
    localStorage.setItem('likedHeroIds', JSON.stringify(likedHeroIds))
  }, [likedHeroes])

  function isHeroLiked(heroId: number) {
    return likedHeroes.some((h) => h.id === heroId)
  }

  function toggleLike(hero: any) {
    if (isHeroLiked(hero.id)) {
      setLikedHeroes((prev) => prev.filter((h) => h.id !== hero.id))
      setHeroes((prev) => [...prev, hero])
    } else {
      setLikedHeroes((prev) => [...prev, hero])
      setHeroes((prev) => prev.filter((h) => h.id !== hero.id))
      setRecentlyLikedHeroId(hero.id)
      setTimeout(() => {
        setRecentlyLikedHeroId(null)
      }, 5000)
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
          <img
            src={arrowup}
            alt="Expand Icon"
            className={`arrow-icon ${isLikedExpanded ? '' : 'expanded'}`}
          />
        </div>

        {isLikedExpanded && (
          <div className={`liked-content ${isLikedExpanded ? 'expanded' : ''}`}>
            {likedHeroes.map((hero) => (
              <HeroBox
                key={hero.id}
                hero={hero}
                toggleLikeFunc={toggleLike}
                isLiked={isHeroLiked(hero.id)}
                recentlyLikedHeroId={recentlyLikedHeroId}
              />
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
          />
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
                onChange={(e) => {
                  setSearchTerm(e.target.value)
                  setSearchChanged(true)
                  setToggleAnimation((prev) => !prev)
                }}
                className="search-input"
              />
              <img
                src={cancel}
                alt="Cancel Search"
                className="cancel-icon"
                onClick={() => setSearchTerm('')}
              />
            </div>

            {noHeroesFound ? (
              <div className="no-heroes-found">No heroes found</div>
            ) : (
              <Grid
                className={`hero-grid ${searchChanged ? (toggleAnimation ? 'fade-in' : 'fade-in-b') : ''}`}
                columnCount={5}
                columnWidth={230}
                height={500}
                rowCount={Math.ceil(filteredHeroes.length / 5)}
                rowHeight={150}
                width={width}
              >
                {({ columnIndex, rowIndex, style }) => {
                  const heroIndex = rowIndex * 5 + columnIndex
                  if (heroIndex >= filteredHeroes.length) return <div style={style}></div>
                  return (
                    <div style={style}>
                      <HeroBox
                        key={filteredHeroes[heroIndex].id}
                        hero={filteredHeroes[heroIndex]}
                        toggleLikeFunc={toggleLike}
                        isLiked={isHeroLiked(filteredHeroes[heroIndex].id)}
                        recentlyLikedHeroId={recentlyLikedHeroId}
                      />
                    </div>
                  )
                }}
              </Grid>
            )}
          </>
        )}
      </div>
    </div>
  )
}

export default App
