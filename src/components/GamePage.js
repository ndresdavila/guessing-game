import React, { useEffect, useState, useCallback } from 'react';
import { useUser } from '../context/UserContext';
import { useNavigate } from 'react-router-dom';

const GamePage = () => {
  const [playerY, setPlayerY] = useState(200);
  const [obstacles, setObstacles] = useState([]);
  const [coinsOnMap, setCoinsOnMap] = useState([]);
  const [bulletsOnMap, setBulletsOnMap] = useState([]);
  const [greenBulletsOnMap, setGreenBulletsOnMap] = useState([]);
  const [isJumping, setIsJumping] = useState(false);
  const [isGameStarted, setIsGameStarted] = useState(false);
  const [isGamePaused, setIsGamePaused] = useState(false);
  const [remainingBullets, setRemainingBullets] = useState(6);
  const { coins, updateCoins } = useUser();
  const [flagVisible, setFlagVisible] = useState(false);
  const [flag, setFlag] = useState({ x: 400, y: 200 }); // Estado para la posición de la bandera

  const navigate = useNavigate();

  const minDistance = 20;

  const isOverlapping = (x, y) => {
    const isCoinOverlap = coinsOnMap.some(coin => 
      Math.abs(coin.x - x) < minDistance && Math.abs(coin.y - y) < minDistance
    );

    const isObstacleOverlap = obstacles.some(obstacle => 
      Math.abs(obstacle.x - x) < minDistance && Math.abs(obstacle.y - y) < minDistance
    );

    const isBulletOverlap = bulletsOnMap.some(bullet => 
      Math.abs(bullet.x - x) < minDistance && Math.abs(bullet.y - y) < minDistance
    );

    const isGreenBulletOverlap = greenBulletsOnMap.some(greenBullet =>
      Math.abs(greenBullet.x - x) < minDistance && Math.abs(greenBullet.y - y) < minDistance
    );

    return isCoinOverlap || isObstacleOverlap || isBulletOverlap || isGreenBulletOverlap;
  };

  const detectFlagCollision = useCallback(() => {
    const isCollision =
      flag.x < 70 + 20 && // 70 es la posición x del jugador
      flag.x + 20 > 50 && // 50 es el límite izquierdo del jugador
      playerY < flag.y + 20 &&
      playerY + 20 > flag.y;
  
    return isCollision;
  }, [flag, playerY]);  

  const detectCollision = useCallback(() => {
    return obstacles.some(obstacle => {
      const isCollision =
        50 < obstacle.x + obstacle.width &&
        70 > obstacle.x &&
        playerY < obstacle.y + obstacle.height &&
        playerY + 20 > obstacle.y;
      return isCollision;
    });
  }, [obstacles, playerY]);

  const detectBulletCollision = useCallback(() => {
    setObstacles(prevObstacles => {
      return prevObstacles.filter(obstacle => {
        const isHit = bulletsOnMap.some(bullet => {
          return (
            bullet.x < obstacle.x + obstacle.width &&
            bullet.x + bullet.width > obstacle.x &&
            bullet.y < obstacle.y + obstacle.height &&
            bullet.y + bullet.height > obstacle.y
          );
        });
        return !isHit;
      });
    });

    setBulletsOnMap(prevBullets => 
      prevBullets.filter(bullet => {
        return !obstacles.some(obstacle => {
          return (
            bullet.x < obstacle.x + obstacle.width &&
            bullet.x + bullet.width > obstacle.x &&
            bullet.y < obstacle.y + obstacle.height &&
            bullet.y + bullet.height > obstacle.y
          );
        });
      })
    );
  }, [bulletsOnMap, obstacles]);

  useEffect(() => {
    let interval;
    if (isGameStarted && !isGamePaused) {
      interval = setInterval(() => {
        // Mover obstáculos, monedas y balas en el mapa
        setObstacles(prev =>
          prev.map(obstacle => ({ ...obstacle, x: obstacle.x - 5 }))
        );
        setCoinsOnMap(prev =>
          prev.map(coin => ({ ...coin, x: coin.x - 5 }))
        );
        setBulletsOnMap(prev =>
          prev.map(bullet => ({ ...bullet, x: bullet.x + 5 }))
        );
        setGreenBulletsOnMap(prev =>
          prev.map(greenBullet => ({ ...greenBullet, x: greenBullet.x - 5 }))
        );
  
        // Generar nuevos obstáculos, monedas y balas solo si la bandera no es visible
        if (!flagVisible) {
          if (Math.random() < 0.05) {
            const newObstacleX = 400;
            const newObstacleY = 200;
            if (!isOverlapping(newObstacleX, newObstacleY)) {
              setObstacles(prev => [
                ...prev,
                { x: newObstacleX, y: newObstacleY, width: 20, height: 20 }
              ]);
            }
          }
  
          if (Math.random() < 0.05) {
            const newCoinX = 400;
            const newCoinY = Math.random() > 0.5 ? 150 : 200;
            if (!isOverlapping(newCoinX, newCoinY)) {
              setCoinsOnMap(prev => [
                ...prev,
                { x: newCoinX, y: newCoinY, radius: 10 }
              ]);
            }
          }
  
          if (Math.random() < 0.02) {
            const newBulletX = 400;
            const newBulletY = Math.random() > 0.5 ? 150 : 200;
            if (!isOverlapping(newBulletX, newBulletY)) {
              setGreenBulletsOnMap(prev => [
                ...prev,
                { x: newBulletX, y: newBulletY, width: 5, height: 2 }
              ]);
            }
          }
        }
  
        // Colisiones con monedas
        setCoinsOnMap(prevCoins =>
          prevCoins.filter(coin => {
            const isCollisionWithPlayer =
              coin.x < 70 && coin.x > 50 && playerY === coin.y;
            if (isCollisionWithPlayer) {
              updateCoins(coins + 1);
              return false;
            }
            return true;
          })
        );
  
        // Colisiones con balas verdes (munición)
        setGreenBulletsOnMap(prevGreenBullets =>
          prevGreenBullets.filter(greenBullet => {
            const isCollisionWithPlayer =
              greenBullet.x < 70 && greenBullet.x > 50 && playerY === greenBullet.y;
            if (isCollisionWithPlayer) {
              setRemainingBullets(prev => Math.min(prev + 1, 6));
              return false;
            }
            return true;
          })
        );
  
        detectBulletCollision();
  
        // Mover la bandera hacia el jugador
        if (flagVisible) {
          setFlag(prevFlag => ({
            x: prevFlag.x - 5,
            y: prevFlag.y
          }));
        }
  
        // Detección de colisión con la bandera
        if (detectFlagCollision()) {
          alert('¡Felicidades, ganaste!');
          endGame();
        }
  
        // Detección de colisión con obstáculos
        if (detectCollision()) {
          alert('Perdiste! Reiniciando el juego...');
          startGame();
        }
      }, 100);
    }
  
    return () => clearInterval(interval);
  }, [
    isGameStarted,
    isGamePaused,
    coins,
    updateCoins,
    coinsOnMap,
    bulletsOnMap,
    detectCollision,
    detectBulletCollision,
    flagVisible // Asegurar que la bandera detenga la generación al volverse visible
  ]);
  

  // Aquí está la implementación del salto y la posición del jugador
  useEffect(() => {
    if (isJumping) {
      setPlayerY(150); // Cambia la posición Y del jugador al saltar
      const jumpTimeout = setTimeout(() => {
        setPlayerY(200); // Regresa la posición Y después de 500ms
        setIsJumping(false); // Restablece el estado de salto
      }, 500); // Asegúrate de que esto coincida con la duración del salto

      return () => clearTimeout(jumpTimeout); // Limpiar el timeout
    }
  }, [isJumping]);

  const handleKeyDown = useCallback(
    e => {
      if (isGamePaused) return;

      if (e.code === 'Space' && !isJumping) {
        setIsJumping(true);
      }
      if (e.code === 'KeyF' && remainingBullets > 0) {
        setBulletsOnMap(prev => [
          ...prev,
          { x: 60, y: playerY + 10, width: 5, height: 2 }
        ]);
        setRemainingBullets(prev => prev - 1);
      }
    },
    [isJumping, playerY, isGamePaused, remainingBullets]
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  // Inicia el juego automáticamente al cargar
  useEffect(() => {
    startGame();
  }, []);

  const startGame = () => {
    setIsGameStarted(true);
    setObstacles([]);
    setCoinsOnMap([]);
    setBulletsOnMap([]);
    setGreenBulletsOnMap([]);
    setIsGamePaused(false);
    setPlayerY(200);

    // Muestra la bandera después de 10 segundos
    setTimeout(() => {
      setFlagVisible(true);
    }, 10000);
  };

  const togglePause = () => {
    setIsGamePaused(prev => !prev);
  };

  const endGame = () => {
    setIsGameStarted(false);
    setIsGamePaused(false);
    setObstacles([]);
    setCoinsOnMap([]);
    setBulletsOnMap([]);
    setGreenBulletsOnMap([]);
    setPlayerY(200);
    navigate('/menu'); // Redirecciona al menú
  };

  return (
    <div className="game-page">
      <h2>Juego de Monedas</h2>
      <p>Monedas actuales: {coins}</p>

      {isGameStarted && (
        <div className="game-screen">
          <div 
            className="player" 
            style={{ position: 'absolute', left: '50px', top: `${playerY}px`, width: '20px', height: '20px', background: 'blue' }} 
          />
          {obstacles.map((obstacle, index) => (
            <div
              key={index}
              className="obstacle"
              style={{
                position: 'absolute',
                left: `${obstacle.x}px`,
                top: `${obstacle.y}px`,
                width: `${obstacle.width}px`,
                height: `${obstacle.height}px`,
                background: 'red'
              }}
            />
          ))}
          {coinsOnMap.map((coin, index) => (
            <div
              key={index}
              className="coin"
              style={{
                position: 'absolute',
                left: `${coin.x}px`,
                top: `${coin.y}px`,
                width: `${coin.radius * 2}px`,
                height: `${coin.radius * 2}px`,
                borderRadius: '50%',
                background: 'gold'
              }}
            />
          ))}
          {bulletsOnMap.map((bullet, index) => (
            <div
              key={index}
              className="bullet"
              style={{
                position: 'absolute',
                left: `${bullet.x}px`,
                top: `${bullet.y}px`,
                width: `${bullet.width}px`,
                height: `${bullet.height}px`,
                background: 'black'
              }}
            />
          ))}
          {greenBulletsOnMap.map((greenBullet, index) => (
            <div
              key={index}
              className="green-bullet"
              style={{
                position: 'absolute',
                left: `${greenBullet.x}px`,
                top: `${greenBullet.y}px`,
                width: `${greenBullet.width}px`,
                height: `${greenBullet.height}px`,
                background: 'green'
              }}
            />
          ))}

          {/* Aquí se muestra la bandera morada */}
          {flagVisible && (
            <div
              style={{
                position: 'absolute',
                left: `${flag.x}px`, // Usa la posición x del estado de la bandera
                top: `${flag.y}px`, // Usa la posición y del estado de la bandera
                width: '20px',
                height: '20px',
                background: 'purple'
              }}
            />
          )}


          <p>Balas restantes: {remainingBullets}</p>
          <button onClick={togglePause}>
            {isGamePaused ? 'Reanudar' : 'Pausar'}
          </button>
          <button onClick={endGame}>Salir</button>
        </div>
      )}
      {!isGameStarted && <button onClick={startGame}>Iniciar Juego</button>}
    </div>
  );
};

export default GamePage;
