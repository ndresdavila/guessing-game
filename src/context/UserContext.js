import React, { createContext, useContext, useEffect, useState } from 'react';
import { auth } from '../firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../firebase';

const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [coins, setCoins] = useState(null);
  const [tokens, setTokens] = useState(0);
  const [prizes, setPrizes] = useState([]);
  const [walletAccount, setWalletAccount] = useState('');
  
  useEffect(() => {
    const loadUserData = async () => {
      const user = auth.currentUser;
      if (user) {
        const userRef = doc(db, 'users', user.uid);
        const userDoc = await getDoc(userRef);
        if (userDoc.exists()) {
          setCoins(userDoc.data().coins || 0);
          setTokens(userDoc.data().tokens || 0);
          setPrizes(userDoc.data().prizes || []);
          setWalletAccount(userDoc.data().walletAccount || '');
        } else {
          console.log('No hay datos para este usuario');
        }
      }
    };

    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        loadUserData();
      } else {
        setCoins(null);
        setTokens(0);
        setPrizes([]);
        setWalletAccount('');
      }
    });

    return () => unsubscribe();
  }, []);

  const updateCoins = async (newCoins) => {
    const user = auth.currentUser;
    if (user) {
      const userRef = doc(db, 'users', user.uid);
      try {
        await setDoc(userRef, { coins: newCoins }, { merge: true });
        setCoins(newCoins);
      } catch (error) {
        console.error('Error al actualizar monedas:', error);
      }
    }
  };

  const updateTokens = async (newTokens) => {
    const user = auth.currentUser;
    if (user) {
      const userRef = doc(db, 'users', user.uid);
      try {
        await setDoc(userRef, { tokens: newTokens }, { merge: true });
        setTokens(newTokens);
      } catch (error) {
        console.error('Error al actualizar tokens:', error);
      }
    }
  };

  const updatePrizes = async (newPrizes) => {
    const user = auth.currentUser;
    if (user) {
      const userRef = doc(db, 'users', user.uid);
      try {
        await setDoc(userRef, { prizes: newPrizes }, { merge: true });
        setPrizes(newPrizes);
      } catch (error) {
        console.error('Error al actualizar premios:', error);
      }
    }
  };

  const updateWalletAccount = async (account) => {
    const user = auth.currentUser;
    if (user) {
      const userRef = doc(db, 'users', user.uid);
      try {
        await setDoc(userRef, { walletAccount: account }, { merge: true });
        setWalletAccount(account);
      } catch (error) {
        console.error('Error al actualizar la cuenta de la billetera:', error);
      }
    }
  };

  return (
    <UserContext.Provider value={{ 
      coins, 
      updateCoins, 
      tokens, 
      updateTokens, 
      prizes, 
      updatePrizes,
      walletAccount,
      updateWalletAccount 
    }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  return useContext(UserContext);
};
