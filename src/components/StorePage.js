import React, { useEffect, useState } from 'react';
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

  const coinPrizeCost = 30;
  const sellPrice = 20;
  const allPrizes = Array.from({ length: 8 }, (_, i) => `Premio ${i + 1}`);

  useEffect(() => {
    loadUserPrizes();
  }, []);

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

  return (
    <div>
      <h1>Tienda de Premios</h1>
      <p>Monedas disponibles: {coins}</p>
      <p>Dirección: {userAddress}</p>
      <p>{status}</p>

      {userAddress ? (
        <button onClick={disconnectWallet}>Desvincular Billetera</button>
      ) : (
        <button onClick={connectWallet} disabled={isConnecting}>
          {isConnecting ? 'Conectando...' : 'Vincular Billetera'}
        </button>
      )}

      <h2>Premios disponibles para comprar con Monedas</h2>
      <ul>
        {allPrizes.map((prize) => (
          <li key={prize}>
            {prize}
            {userPrizes.includes(prize) ? (
              <span> - Ya lo tienes</span>
            ) : (
              <button onClick={() => buyCoinPrize(prize)}>Comprar (30 monedas)</button>
            )}
          </li>
        ))}
      </ul>

      <h2>Tus premios</h2>
      <ul>
        {userPrizes.map((prize, index) => (
          <li key={index}>
            {prize}
            <button onClick={() => sellPrizeHandler(prize)}>Vender (20 monedas)</button>
          </li>
        ))}
      </ul>

      <Link to="/menu">
        <button>Regresar al menú principal</button>
      </Link>
    </div>
  );
};

export default StorePage;
