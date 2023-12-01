import { useState, useEffect, createContext } from "react";
import clienteAxios from "../config/clienteAxios";
import { useNavigate } from 'react-router-dom';
import useAuth from "../hooks/useAuth";
import io from "socket.io-client";

let socket;

const ProyectosContext = createContext()

const ProyectosProvider = ({ children }) => {

  const [proyectos, setProyectos] = useState([])
  const [alerta, setAlerta] = useState({})
  const [proyecto, setProyecto] = useState({})
  const [cargando, setCargando] = useState(false)
  const [modalFormularioTarea, setModalFormularioTarea] = useState(false)
  const [tarea, setTarea] = useState({})
  const [modalEliminarTarea, setModalEliminarTarea] = useState(false)
  const [colaborador, setColaborador] = useState({})
  const [modalEliminarColaborador, setModalEliminarColaborador] = useState(false)
  const [buscador, setBuscador] = useState(false)

  const navigate = useNavigate()
  const { auth } = useAuth()

  useEffect(() => {
    const obtenerProyectos = async () => {
      try {
        const token = localStorage.getItem('token')
        if (!token) return

        const config = {
          //Pasamos la autorización y el Bearer
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          }
        }
        const { data } = await clienteAxios('/proyectos', config)
        setProyectos(data)

      } catch (error) {
        console.log(error)
      }
    }
    obtenerProyectos()
  }, [auth]) // Pasar el auth como dependencia para que cuando cambie el auth se ejecute el inicio de secion

  // ABRIR CONEXIÓN CON SOCKET.IO
  useEffect(() => {
    socket = io(import.meta.env.VITE_BACKEND_URL)
  }, [])

  const mostrarAlerta = alerta => {
    setAlerta(alerta)

    // Quitar la alerta despues de 5s
    setTimeout(() => {
      setAlerta({})
    }, 5000);
  }

  const submitProyecto = async proyecto => {
    if (proyecto.id) {
      await editarProyecto(proyecto)
    } else {
      await nuevoProyecto(proyecto)
    }
  }

  const editarProyecto = async proyecto => {
    console.log(proyecto)
    try {
      const token = localStorage.getItem('token')
      if (!token) return

      const config = {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        }
      }

      const { data } = await clienteAxios.put(`/proyectos/${proyecto.id}`, proyecto, config)

      // Sincronizar el State
      const proyectosActualizados = proyectos.map(proyectoState => proyectoState._id === data._id ? data : proyectoState)
      setProyectos(proyectosActualizados)

      // Mostrar la alerta
      setAlerta({
        msg: 'Proyecto Actualizado Correctamente',
        error: false
      })

      // Redireccionar
      setTimeout(() => {
        setAlerta({})
        navigate('/proyectos')
      }, 2000);

    } catch (error) {
      console.log(error)
    }
  }

  const nuevoProyecto = async proyecto => {
    try {
      const token = localStorage.getItem('token')
      if (!token) return

      const config = {
        //Pasamos la autorización y el Bearer
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        }
      }

      // En caso de post se pasa ('/url', datos, config)
      const { data } = await clienteAxios.post('/proyectos', proyecto, config)

      // Actualizar el state que renderiza en proyectos, para que cuando cree un nuevo proyecto aparezca en proyectos.
      setProyectos([...proyectos, data])

      setAlerta({
        msg: 'Proyecto Creado Correctamente',
        error: false
      })

      // Redireccionar el usuario hacia proyectos despues de crear el proyecto
      setTimeout(() => {
        setAlerta({})
        navigate('/proyectos')
      }, 2000);

    } catch (error) {
      console.log(error)
    }
  }

  const obtenerProyecto = async id => {
    setCargando(true)

    try {

      // Comprobar si el token es valido
      const token = localStorage.getItem('token')
      if (!token) return

      const config = {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        }
      }

      const { data } = await clienteAxios(`/proyectos/${id}`, config)
      setProyecto(data)
      setAlerta({})
    } catch (error) {
      navigate('/proyectos')
      setAlerta({
        msg: error.response.data.msg,
        error: true
      })
      setTimeout(() => {
        setAlerta({})
      }, 2000);
    }

    setCargando(false)
  }

  const eliminarProyecto = async id => {
    try {
      const token = localStorage.getItem('token')
      if (!token) return

      const config = {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        }
      }

      const { data } = await clienteAxios.delete(`/proyectos/${id}`, config)

      setAlerta({
        msg: data.msg,
        error: false
      })

      // Sincronizar el State
      const proyectosActualizados = proyectos.filter(proyectoState => proyectoState._id !== id)
      setProyectos(proyectosActualizados)

      setTimeout(() => {
        setAlerta({})
        navigate('/proyectos')
      }, 2000);

    } catch (error) {
      console.log(error)
    }
  }

  const handleModalTarea = () => {
    setModalFormularioTarea(!modalFormularioTarea)
    setTarea({})
  }

  const submitTarea = async tarea => {

    if (tarea?.id) {
      await editarTarea(tarea)
    } else {
      await crearTarea(tarea)
    }

  }

  const crearTarea = async tarea => {
    try {
      const token = localStorage.getItem('token')
      if (!token) return

      const config = {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        }
      }

      const { data } = await clienteAxios.post('/tareas', tarea, config)

      setAlerta({})
      setModalFormularioTarea(false)

      // SOCKET.IO
      socket.emit('nueva tarea', data)

    } catch (error) {
      console.log(error)
    }
  }

  const editarTarea = async tarea => {
    try {
      const token = localStorage.getItem('token')
      if (!token) return

      const config = {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        }
      }

      const { data } = await clienteAxios.put(`/tareas/${tarea.id}`, tarea, config)

      setAlerta({})
      setModalFormularioTarea(false)

      // SOCKET
      socket.emit('actualizar tarea', data)

    } catch (error) {
      console.log(error)
    }
  }

  const handleModalEditarTarea = tarea => {
    setTarea(tarea)
    setModalFormularioTarea(true)
  }

  const handleModalEliminarTarea = tarea => {
    setTarea(tarea)
    setModalEliminarTarea(!modalEliminarTarea)
  }

  const eliminarTarea = async () => {
    try {
      const token = localStorage.getItem('token')
      if (!token) return

      const config = {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        }
      }

      const { data } = await clienteAxios.delete(`/tareas/${tarea._id}`, config)

      setAlerta({
        msg: data.msg,
        error: false
      })


      setModalEliminarTarea(false)


      // SOCKET
      socket.emit('eliminar tarea', tarea)

      setTarea({})
      setTimeout(() => {
        setAlerta({})
      }, 2000);

    } catch (error) {
      console.log(error)
    }
  }

  const submitColaborador = async email => {

    setCargando(true)

    try {
      const token = localStorage.getItem('token')
      if (!token) return

      const config = {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        }
      }

      const { data } = await clienteAxios.post('/proyectos/colaboradores', { email }, config)

      setColaborador(data)
      setAlerta({})

    } catch (error) {
      setAlerta({
        msg: error.response.data.msg,
        error: true
      })
    } finally {
      setCargando(false)
    }
  }

  const agregarColaborador = async email => {
    try {
      const token = localStorage.getItem('token')
      if (!token) return

      const config = {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        }
      }

      const { data } = await clienteAxios.post(`/proyectos/colaboradores/${proyecto._id}`, email, config)

      setAlerta({
        msg: data.msg,
        error: false
      })

      setColaborador({})
      setTimeout(() => {
        setAlerta({})
      }, 2000);

    } catch (error) {
      setAlerta({
        msg: error.response.data.msg,
        error: true
      })
    }
  }

  const handleModalEliminarColaborador = colaborador => {
    setModalEliminarColaborador(!modalEliminarColaborador)

    setColaborador(colaborador)
  }

  const eliminarColaborador = async () => {

    try {
      const token = localStorage.getItem('token')
      if (!token) return

      const config = {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        }
      }

      const { data } = await clienteAxios.post(`/proyectos/eliminar-colaborador/${proyecto._id}`, { id: colaborador._id }, config)

      const proyectoActualizado = { ...proyecto }
      proyectoActualizado.colaboradores = proyectoActualizado.colaboradores.filter(colaboradorState => colaboradorState._id !== colaborador._id)
      setProyecto(proyectoActualizado)

      setAlerta({
        msg: data.msg,
        error: false
      })

      setColaborador({})
      setModalEliminarColaborador(false)

      setTimeout(() => {
        setAlerta({})
      }, 2000);

    } catch (error) {
      console.log(error.response)
    }

  }

  const completarTarea = async id => {
    try {
      const token = localStorage.getItem('token')
      if (!token) return

      const config = {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        }
      }

      const { data } = await clienteAxios.post(`/tareas/estado/${id}`, {}, config)

      setTarea({})
      setAlerta({})

      // SOCKET
      socket.emit('cambiar estado', data)

    } catch (error) {
      console.log(error.response)
    }
  }

  const handleBuscador = () => {
    setBuscador(!buscador)
  }

  // Socket.io
  const submitTareasProyecto = (tarea) => {
    // Agrega la tarea al state
    const proyectoActualizado = { ...proyecto }
    proyectoActualizado.tareas = [...proyectoActualizado.tareas, tarea]
    setProyecto(proyectoActualizado)
  }

  const eliminarTareaProyecto = tarea => {
    const proyectoActualizado = { ...proyecto }
    proyectoActualizado.tareas = proyectoActualizado.tareas.filter(tareaState => tareaState._id !== tarea._id)
    setProyecto(proyectoActualizado)
  }

  const actualizarTareaProyecto = tarea => {
    const proyectoActualizado = { ...proyecto }
    proyectoActualizado.tareas = proyectoActualizado.tareas.map(tareaState => tareaState._id === tarea._id ? tarea : tareaState)
    setProyecto(proyectoActualizado)
  }

  const cambiarEstadoTarea = tarea => {
    const proyectoActualizado = { ...proyecto }
    proyectoActualizado.tareas = proyectoActualizado.tareas.map(tareaState => tareaState._id === tarea._id ? tarea : tareaState)
    setProyecto(proyectoActualizado)
  }

  const cerrarSesionProyectos = () => {
    // Cerrar todo
    setProyectos([])
    setProyecto({})
    setAlerta({})

  }

  return (
    <ProyectosContext.Provider
      value={{
        proyectos,
        mostrarAlerta,
        alerta,
        submitProyecto,
        obtenerProyecto,
        proyecto,
        cargando,
        eliminarProyecto,
        modalFormularioTarea,
        handleModalTarea,
        submitTarea,
        handleModalEditarTarea,
        tarea,
        modalEliminarTarea,
        handleModalEliminarTarea,
        eliminarTarea,
        submitColaborador,
        colaborador,
        agregarColaborador,
        handleModalEliminarColaborador,
        modalEliminarColaborador,
        eliminarColaborador,
        completarTarea,
        buscador,
        handleBuscador,
        submitTareasProyecto,
        eliminarTareaProyecto,
        actualizarTareaProyecto,
        cambiarEstadoTarea,
        cerrarSesionProyectos
      }}
    >
      {children}
    </ProyectosContext.Provider>
  )
}

export {
  ProyectosProvider
}

export default ProyectosContext
