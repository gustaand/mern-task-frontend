import useProyectos from "./useProyectos";
import useAuth from "./useAuth";

// Verifica si el creador del proyecto es la persona autenticada
const useAdmin = () => {

  const { proyecto } = useProyectos()
  const { auth } = useAuth()
  return proyecto.creador === auth._id
}

export default useAdmin