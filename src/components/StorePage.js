import React, { useEffect, useState, useRef } from 'react';
import { useUser } from '../context/UserContext';
import { auth } from '../firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { Link } from 'react-router-dom';

const StorePage = () => {
  const { coins, updateCoins, walletAccount, updateWalletAccount } = useUser();
  const [userPrizes, setUserPrizes] = useState(
    JSON.parse(localStorage.getItem('userPrizes')) || []
  );
  const [userAddress, setUserAddress] = useState(
    localStorage.getItem('userAddress') || walletAccount || ''
  );
  const [status, setStatus] = useState('');
  const [isConnecting, setIsConnecting] = useState(false);
  const [scale, setScale] = useState(1); // Estado para la escala
  const contentRef = useRef(); // Referencia al contenedor

  const coinPrizeCost = 30;
  const sellPrice = 20;
  const allPrizes = Array.from({ length: 4 }, (_, i) => `Premio ${i + 1}`);

  useEffect(() => {
    loadUserPrizes();
  }, []);

  useEffect(() => {
    const resizeObserver = new ResizeObserver(() => {
      adjustScale();
    });
    if (contentRef.current) resizeObserver.observe(contentRef.current);
    return () => resizeObserver.disconnect();
  }, []);

  const adjustScale = () => {
    const parentHeight = contentRef.current.parentElement.clientHeight;
    const contentHeight = contentRef.current.clientHeight;
    const newScale = Math.min(parentHeight / contentHeight, 1);
    setScale(newScale);
  };

  const connectWallet = async () => {
    if (isConnecting) return;
    setIsConnecting(true);
    try {
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      const account = accounts[0];
      setUserAddress(account);
      localStorage.setItem('userAddress', account);
      await updateWalletAccount(account);
    } catch (error) {
      console.error('Error al conectar la billetera:', error);
      setStatus('Error al conectar la billetera. Asegúrate de que MetaMask esté instalado.');
    } finally {
      setIsConnecting(false);
    }
  };

  const disconnectWallet = async () => {
    setUserAddress('');
    localStorage.removeItem('userAddress');
    await updateWalletAccount('');
  };

  const loadUserPrizes = async () => {
    const user = auth.currentUser;
    if (user) {
      const userRef = doc(db, 'users', user.uid);
      const userDoc = await getDoc(userRef);
      if (userDoc.exists()) {
        const prizes = userDoc.data().prizes || [];
        setUserPrizes(prizes);
        localStorage.setItem('userPrizes', JSON.stringify(prizes));
      }
    }
  };

  const buyCoinPrize = async (prize) => {
    if (coins >= coinPrizeCost) {
      if (!userPrizes.includes(prize)) {
        const newPrizes = [...userPrizes, prize];
        updateCoins(coins - coinPrizeCost);
        const userRef = doc(db, 'users', auth.currentUser.uid);
        await setDoc(userRef, { prizes: newPrizes }, { merge: true });
        setUserPrizes(newPrizes);
        localStorage.setItem('userPrizes', JSON.stringify(newPrizes));
      } else {
        alert('Ya tienes este premio.');
      }
    } else {
      alert('No tienes suficientes monedas.');
    }
  };

  const sellPrizeHandler = async (prize) => {
    const newPrizes = userPrizes.filter((p) => p !== prize);
    updateCoins(coins + sellPrice);
    const userRef = doc(db, 'users', auth.currentUser.uid);
    await setDoc(userRef, { prizes: newPrizes }, { merge: true });
    setUserPrizes(newPrizes);
    localStorage.setItem('userPrizes', JSON.stringify(newPrizes));
  };

  const styles = {
    p: {
      margin: '0',
      padding: '0',
      border: '0',
      fontSize: '0.75rem',
    },
    container: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100vh',
      backgroundColor: 'black',
      fontFamily: "'Press Start 2P', cursive",
      position: 'relative',
      fontSize: '0.75rem', // Agregado para el contenedor
    },
    backgroundImage: {
      width: '20cm',
      height: 'auto',
      position: 'absolute',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      zIndex: 0,
    },
    contentWrapper: {
      height: '7cm',
      width: '100%',
      maxWidth: '18cm',
      overflowY: 'auto',
      transform: `scale(${scale})`,
      transformOrigin: 'top left',
      padding: '0',
      margin: '0',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: '0cm',
      color: 'white',
      textAlign: 'center',
      fontSize: '0.75rem', // Agregado para el contenido
    },
    section: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      width: '100%',
      margin: '0',
      fontSize: '0.75rem', // Agregado para las secciones
    },
    prizeList: {
      display: 'flex',
      gap: '5px',
      flexWrap: 'wrap',
    },
    prizeImage: {
      width: '0.8cm',
      height: '0.8cm',
      cursor: 'pointer',
    },
    button: {
      margin: '0',
      padding: '0',
      width: '250px',
      height: '40px',
      border: 'none',
      borderRadius: '5px',
      backgroundColor: '#007bff',
      color: '#fff',
      cursor: 'pointer',
      fontSize: '0.8rem', // Agregado para los botones
    },
    title: {
      margin: '0',
      fontSize: '0.75rem', // Se mantiene
      border: '0',
      padding: '0',
    },
  };
  

  const availablePrizes = allPrizes.filter((prize) => !userPrizes.includes(prize));

  return (
    <div style={styles.container}>
      <img src="/fondo.png" alt="Fondo" style={styles.backgroundImage} />
      <div ref={contentRef} style={styles.contentWrapper}>
        <h2 style={styles.title}>Tienda de Premios</h2>
        <p style={styles.p}>Monedas disponibles: {coins}</p>
        <p style={styles.p}>Dirección: {userAddress}</p>
        <p style={styles.p}>{status}</p>

        {userAddress ? (
          <button style={styles.button} onClick={disconnectWallet}>
            Desvincular Billetera
          </button>
        ) : (
          <button style={styles.button} onClick={connectWallet} disabled={isConnecting}>
            {isConnecting ? 'Conectando...' : 'Vincular Billetera'}
          </button>
        )}

        <div style={styles.section}>
          <h4 style={styles.title}>Premios disponibles</h4>
          <div style={styles.prizeList}>
            {availablePrizes.map((prize) => (
              <img
                key={prize}
                src={`/images/${prize}.png`}
                alt={prize}
                style={styles.prizeImage}
                onClick={() => buyCoinPrize(prize)}
              />
            ))}
          </div>
        </div>

        <div style={styles.section}>
          <h4 style={styles.title}>Tus Premios</h4>
          <div style={styles.prizeList}>
            {userPrizes.map((prize, index) => (
              <img
                key={index}
                src={`/images/${prize}.png`}
                alt={prize}
                style={styles.prizeImage}
                onClick={() => sellPrizeHandler(prize)}
              />
            ))}
          </div>
        </div>

        <Link to="/menu">
          <button style={styles.button}>Menú principal</button>
        </Link>
      </div>
    </div>
  );
};

export default StorePage;
