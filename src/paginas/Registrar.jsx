import { useState } from 'react'
import { Link } from "react-router-dom"
import Alerta from '../components/Alerta'
import clienteAxios from '../config/clienteAxios'

const Registrar = () => {

  const [nombre, setNombre] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [repetirPassword, setRepetirPassword] = useState('')
  const [alerta, setAlerta] = useState({})

  const handleSubmit = async e => {
    e.preventDefault();

    // ponemos los states en un array y verificamos con .includes('') si almenos uno está vacio.
    if ([nombre, email, password, repetirPassword].includes('')) {
      setAlerta({
        msg: 'Todos los campos son obligatorios',
        error: true
      })
      return
    }

    if (password !== repetirPassword) {
      setAlerta({
        msg: 'Los passwords no son iguales',
        error: true
      })
      return
    }

    if (password.length < 6) {
      setAlerta({
        msg: 'El Password es muy corto. Debe contener mínimo 6 caracteres',
        error: true
      })
      return
    }

    setAlerta({})

    // Crear el usuario en la API
    try {
      // axios.post(URL, datos que se están enviando a la URL)
      // Usamos el clienteAxios que creamos para llamar a la url base que definimos.
      const { data } = await clienteAxios.post('/usuarios', { nombre, email, password })

      setAlerta({
        msg: data.msg,
        error: false
      })
    } catch (error) {
      // para acceder los datos del error en axios se hace con error.response (ver en console.log(error.response.data.msg))
      setAlerta({
        msg: error.response.data.msg,
        error: true
      })
    }

    // Resetear formulario
    setNombre('')
    setEmail('')
    setPassword('')
    setRepetirPassword('')
  }

  const { msg } = alerta

  return (
    <>
      <h1 className="text-sky-600 font-black text-6xl capitalize">
        Crea tu Cuenta y Administra tus <span className="text-slate-700">proyectos</span>
      </h1>

      {msg && <Alerta alerta={alerta} />}

      <form
        className="my-10 bg-white shadow rounded-lg p-10"
        onSubmit={handleSubmit}
      >
        <div className="my-5">
          <label
            className="uppercase text-gray-600 block text-xl font-bold"
            htmlFor="nombre"
          >Nombre</label>
          <input
            id="nombre"
            type="text"
            placeholder="Nombre"
            className="w-full mt-3 p-3 border rounded-xl bg-gray-50"
            value={nombre}
            onChange={e => setNombre(e.target.value)}
          />
        </div>

        <div className="my-5">
          <label
            className="uppercase text-gray-600 block text-xl font-bold"
            htmlFor="email"
          >Email</label>
          <input
            id="email"
            type="email"
            placeholder="Email"
            className="w-full mt-3 p-3 border rounded-xl bg-gray-50"
            value={email}
            onChange={e => setEmail(e.target.value)}
          />
        </div>

        <div className="my-5">
          <label
            className="uppercase text-gray-600 block text-xl font-bold"
            htmlFor="password"
          >Password</label>
          <input
            id="password"
            type="password"
            placeholder="Password"
            className="w-full mt-3 p-3 border rounded-xl bg-gray-50"
            value={password}
            onChange={e => setPassword(e.target.value)}
          />
        </div>

        <div className="my-5">
          <label
            className="uppercase text-gray-600 block text-xl font-bold"
            htmlFor="password2"
          >Repetir Password</label>
          <input
            id="password2"
            type="password"
            placeholder="Repetir tu Password"
            className="w-full mt-3 p-3 border rounded-xl bg-gray-50"
            value={repetirPassword}
            onChange={e => setRepetirPassword(e.target.value)}
          />
        </div>

        <input
          type="submit"
          value="Crear Cuenta"
          className="bg-sky-700 w-full py-3 mb-5 text-white uppercase font-bold rounded hover:cursor-pointer 
          hover:bg-sky-800 transition-colors"
        />
      </form>

      <nav className="lg:flex lg:justify-between">
        <Link
          className="block text-center my-5 text-slate-500 uppercase text-sm"
          to="/"
        >¿Ya tienes una cuenta? Inicia Sesión!</Link>

        <Link
          className="block text-center my-5 text-slate-500 uppercase text-sm"
          to="/olvide-password"
        >Olvide Mi Password</Link>
      </nav>
    </>
  )
}

export default Registrar