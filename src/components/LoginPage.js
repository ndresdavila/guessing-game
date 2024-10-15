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
    <div style={{ fontFamily: "'Press Start 2P', cursive" }}>
      <div style={styles.container}>
        <img src="/fondo.png" alt="Fondo" style={styles.backgroundImage} />
        <div style={styles.overlay}>
          <h2 style={styles.title}>Redonditos Express</h2>
          <h3>{isRegistering ? 'Registro' : 'Inicio de Sesión'}</h3>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={{ ...styles.input, fontFamily: "'Press Start 2P', cursive" }} // Aplicando estilo aquí
          />
          <input
            type="password"
            placeholder="Contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{ ...styles.input, fontFamily: "'Press Start 2P', cursive" }} // Aplicando estilo aquí
          />
          <button onClick={handleSubmit} style={{ ...styles.button, fontFamily: "'Press Start 2P', cursive" }}>
            {isRegistering ? 'Registrar' : 'Iniciar Sesión'}
          </button>
          <button onClick={() => setIsRegistering(!isRegistering)} style={{ ...styles.button, fontFamily: "'Press Start 2P', cursive" }}>
            {isRegistering ? 'Ya tengo cuenta' : 'Registrarme'}
          </button>
        </div>
      </div>
    </div>
  );



};

const styles = {
  container: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100vh',
    position: 'relative',
    backgroundColor: "black"
  },
  overlay: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'absolute', // Asegura que el contenido esté encima de la imagen
    zIndex: 1, // Asegura que el contenido esté por encima de la imagen
    color: 'white', // Color del texto
    textAlign: 'center',
  },
  title: {
    marginTop: '70px',
  },
  input: {
    margin: '10px 0',
    padding: '10px',
    width: '250px',
    border: '1px solid #ccc',
    borderRadius: '5px',
    backgroundColor: 'rgba(255, 255, 255, 0.8)', // Fondo blanco semi-transparente para los inputs
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
  backgroundImage: {
    width: '20cm', // Ancho de la imagen en 13 cm
    height: 'auto', // Mantiene la proporción de la imagen
    position: 'absolute',
    top: '50%', // Centra verticalmente
    left: '50%', // Centra horizontalmente
    transform: 'translate(-50%, -50%)', // Ajusta la posición
    zIndex: 0, // Asegura que esté detrás del contenido
  },
};

export default LoginPage;
