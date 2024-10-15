import { Link, useNavigate } from 'react-router-dom'; // Importa useNavigate
import { useUser } from '../context/UserContext'; // Importa el contexto
import { auth } from '../firebase'; // Importa Firebase Auth
import { signOut } from 'firebase/auth'; // Importa la función signOut

const MainMenu = () => {
  const { coins, tokens } = useUser(); // Usa el contexto
  const navigate = useNavigate(); // Crea la instancia de navigate

  const handleLogout = async () => {
    try {
      await signOut(auth); // Cierra sesión en Firebase
      navigate('/'); // Redirige a la página de inicio
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  };

  const styles = {
    container: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100vh',
      position: 'relative',
      backgroundColor: "black",
      fontFamily: "'Press Start 2P', cursive", // Aplicar fuente 8 bits
    },
    backgroundImage: {
      width: '20cm', // Ancho de la imagen
      height: 'auto', // Mantiene la proporción de la imagen
      position: 'absolute',
      top: '50%', // Centra verticalmente
      left: '50%', // Centra horizontalmente
      transform: 'translate(-50%, -50%)', // Ajusta la posición
      zIndex: 0, // Asegura que esté detrás del contenido
    },
    overlay: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      position: 'relative', // Asegura que el contenido esté encima de la imagen
      zIndex: 1, // Asegura que el contenido esté por encima de la imagen
      color: 'white', // Color del texto
      textAlign: 'center',
    },
    button: {
      margin: '5px',
      padding: '10px',
      width: '250px',
      border: 'none',
      borderRadius: '5px',
      backgroundColor: '#007bff',
      color: '#fff',
      cursor: 'pointer',
      fontFamily: "'Press Start 2P', cursive", // Aplicar fuente 8 bits
    },
    title: {
      marginBottom: '10px', // Espacio entre el título y el resto
    },
    coinsContainer: {
      display: 'flex',
      alignItems: 'center', // Alinea verticalmente el texto y la imagen
      margin: '5px 0', // Margen superior e inferior
    },
    coinsText: {
      marginRight: '5px', // Espacio entre el texto y la imagen
    },
    coinsImage: {
      width: '0.8cm', // Tamaño de la imagen de la moneda
      height: 'auto', // Mantiene la proporción de la imagen
    },
  };

  return (
    <div style={styles.container}>
      <img src="/fondo.png" alt="Fondo" style={styles.backgroundImage} />
      <div style={styles.overlay}>
        <h1 style={styles.title}>Menu Principal</h1>
        <Link to="/game">
          <button style={styles.button}>Iniciar Juego</button>
        </Link>
        <Link to="/store">
          <button style={styles.button}>Tienda de Premios</button>
        </Link>
        <div style={styles.coinsContainer}>
          <p style={styles.coinsText}>Monedas acumuladas: {coins}</p>
          <img src="/moneda.gif" alt="Moneda" style={styles.coinsImage} />
        </div>
        <p>Tokens acumulados: {tokens}</p> {/* Mostrar tokens */}
        <button style={styles.button} onClick={handleLogout}>Cerrar Sesión</button> {/* Botón de cerrar sesión */}
      </div>
    </div>
  );
};

export default MainMenu;
