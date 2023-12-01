import { useState } from "react"
import { useParams } from "react-router-dom"
import useProyectos from "../hooks/useProyectos"
import Alerta from "./Alerta"

const FormularioProyecto = () => {

  const params = useParams()
  const { mostrarAlerta, alerta, submitProyecto, proyecto } = useProyectos()

  // Verifica si hay url para llenar con información para actualizar, o dejar vacío para crear
  const [nombre, setNombre] = useState(params.id ? proyecto.nombre : '')
  const [descripcion, setDescripcion] = useState(params.id ? proyecto.descripcion : '')
  const [fechaEntrega, setFechaEntrega] = useState(params.id ? proyecto.fechaEntrega?.split('T')[0] : '')
  const [cliente, setCliente] = useState(params.id ? proyecto.cliente : '')

  const handleSubmit = async e => {
    e.preventDefault()

    if ([nombre, descripcion, fechaEntrega, cliente].includes('')) {
      mostrarAlerta({
        msg: 'Todos los campos son obligatorios',
        error: true
      })

      return
    }

    // Pasar los datos hacie el provider.
    // Esperamos que esté completa lá función de submitProyecto para reiniciar el formulário
    await submitProyecto({ id: params.id, nombre, descripcion, fechaEntrega, cliente })

    //reiniciar el formulário
    setNombre('')
    setDescripcion('')
    setFechaEntrega('')
    setCliente('')
  }

  const { msg } = alerta

  return (
    <form
      className="bg-white py-10 px-5 md:w-1/2 rounded-lg shadow"
      onSubmit={handleSubmit}
    >

      {msg && <Alerta alerta={alerta} />}

      <div className="mb-5">
        <label
          className="text-gray-700 uppercase font-bold text-sm"
          htmlFor="nombre"
        >Nombre Proyecto</label>

        <input
          id="nombre"
          type="text"
          className="border w-full p-2 mt-2 placeholder-gray-400 rounded-md"
          placeholder="Nombre del Proyecto"
          value={nombre}
          onChange={e => setNombre(e.target.value)}
        />
      </div>

      <div className="mb-5">
        <label
          className="text-gray-700 uppercase font-bold text-sm"
          htmlFor="descripcion"
        >Descripcion</label>

        <textarea
          id="descripcion"
          className="border w-full p-2 mt-2 placeholder-gray-400 rounded-md"
          placeholder="Descripcion del Proyecto"
          value={descripcion}
          onChange={e => setDescripcion(e.target.value)}
        />
      </div>

      <div className="mb-5">
        <label
          className="text-gray-700 uppercase font-bold text-sm"
          htmlFor="fecha-entrega"
        >Fecha Entrega</label>

        <input
          id="fecha-entrega"
          type="date"
          className="border w-full p-2 mt-2 placeholder-gray-400 rounded-md"
          value={fechaEntrega}
          onChange={e => setFechaEntrega(e.target.value)}
        />
      </div>

      <div className="mb-5">
        <label
          className="text-gray-700 uppercase font-bold text-sm"
          htmlFor="cliente"
        >Cliente</label>

        <input
          id="cliente"
          type="text"
          className="border w-full p-2 mt-2 placeholder-gray-400 rounded-md"
          placeholder="Cliente"
          value={cliente}
          onChange={e => setCliente(e.target.value)}
        />
      </div>

      <input
        type="submit"
        value={params.id ? 'Actualizar Proyecto' : 'Crear Proyecto'}
        className="bg-sky-600 w-full p-3 uppercase font-bold text-white rounded cursor-pointer hover:bg-sky-700 transition-colors"
      />

    </form>
  )
}

export default FormularioProyecto