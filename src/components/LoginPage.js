import { useState } from 'react';
import { auth } from '../firebase';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../firebase';  
import { useNavigate } from 'react-router-dom'; 

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);
  const navigate = useNavigate(); 

  const createUserData = async (user) => {
    const userRef = doc(db, 'users', user.uid);
    await setDoc(userRef, {
      coins: 100, 
      prizes: [],
    });
  };

  const getUserData = async (user) => {
    const userRef = doc(db, 'users', user.uid);
    const userDoc = await getDoc(userRef);
    
    if (userDoc.exists()) {
      return userDoc.data(); 
    } else {
      console.log('No hay datos para este usuario');
      return null;
    }
  };

  const handleSubmit = () => {
    if (isRegistering) {
      createUserWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
          alert('Usuario registrado con éxito');
          createUserData(userCredential.user);  
        })
        .catch((error) => {
          console.error('Error al registrar usuario:', error);
        });
    } else {
      signInWithEmailAndPassword(auth, email, password)
        .then(async (userCredential) => {
          alert('Sesión iniciada');
          const userData = await getUserData(userCredential.user);
          if (userData) {
            navigate('/menu', { state: { userData } });
          }
        })
        .catch((error) => {
          console.error('Error al iniciar sesión:', error);
        });
    }
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>Nombre del Juego</h2>
      <h3>{isRegistering ? 'Registro' : 'Inicio de Sesión'}</h3>
      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        style={styles.input}
      />
      <input
        type="password"
        placeholder="Contraseña"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        style={styles.input}
      />
      <button onClick={handleSubmit} style={styles.button}>
        {isRegistering ? 'Registrar' : 'Iniciar Sesión'}
      </button>
      <button onClick={() => setIsRegistering(!isRegistering)} style={styles.button}>
        {isRegistering ? 'Ya tengo cuenta' : 'Registrarme'}
      </button>
    </div>
  );
};

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100vh',
    backgroundColor: '#f0f0f0',
  },
  title: {
    marginBottom: '20px',
  },
  input: {
    margin: '10px 0',
    padding: '10px',
    width: '250px',
    border: '1px solid #ccc',
    borderRadius: '5px',
  },
  button: {
    margin: '10px 0',
    padding: '10px',
    width: '250px',
    border: 'none',
    borderRadius: '5px',
    backgroundColor: '#007bff',
    color: '#fff',
    cursor: 'pointer',
  },
};

export default LoginPage;
