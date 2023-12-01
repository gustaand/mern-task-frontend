import { useState, useEffect, createContext } from 'react'
// import { useNavigate } from 'react-router-dom';
import clienteAxios from '../config/clienteAxios';

const AuthContext = createContext();


const AuthProvider = ({ children }) => {

  const [auth, setAuth] = useState({})
  const [cargando, setCargando] = useState(true)

  // const navigate = useNavigate()

  useEffect(() => {
    const autenticarUsuario = async () => {
      const token = localStorage.getItem('token')

      if (!token) {
        setCargando(false)
        return
      }

      // Los Requests con el token autenticado tienen que tener esta configuración
      // Configuramos la validación en headers y autorizamos como Bearer Token que es lo que definimos en el Backend
      const config = {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        }
      }

      try {
        const { data } = await clienteAxios('/usuarios/perfil', config)
        setAuth(data)
        // navigate('/proyectos')
      } catch (error) {
        setAuth({})
      }

      setCargando(false)
    }
    autenticarUsuario()
  }, [])

  // CERRAR SESION
  const cerrarSesionAuth = () => {
    setAuth({})
  }

  return (
    <AuthContext.Provider
      value={{
        auth,
        setAuth,
        cargando,
        cerrarSesionAuth
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export {
  AuthProvider
}

export default AuthContext;