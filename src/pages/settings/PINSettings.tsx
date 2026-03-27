import { useEffect, useState } from 'react'
import { useAuth } from '../../hooks/useAuth'

export default function TelegramBotSettings() {
  const { user, profile } = useAuth()
  const [telegramUsername, setTelegramUsername] = useState('@PasaYa_Bot')

  useEffect(() => {
    // En el futuro, podrías obtener el username del bot desde una API
  }, [])

  if (!profile) {
    return <div>Cargando...</div>
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-2xl mx-auto">
        {/* Card Principal */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-6">
          <div className="flex items-center gap-3 mb-6">
            <span className="text-4xl">🤖</span>
            <h1 className="text-3xl font-bold text-gray-800">Bot de Telegram PasaYa</h1>
          </div>

          <p className="text-gray-600 mb-6">
            Usa este bot para registrar visitantes directamente desde Telegram. ¡Es rápido, seguro y usa tus mismas credenciales de ProSoftware!
          </p>

          {/* Sección: Cómo Usar */}
          <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-6 mb-6">
            <h2 className="text-2xl font-bold text-blue-800 mb-4">📱 ¿Cómo Usar?</h2>

            <div className="space-y-4">
              {/* Paso 1 */}
              <div className="flex gap-4">
                <div className="flex-shrink-0">
                  <div className="flex items-center justify-center h-10 w-10 rounded-full bg-blue-500 text-white font-bold">
                    1
                  </div>
                </div>
                <div>
                  <h3 className="font-bold text-blue-900">Abre Telegram</h3>
                  <p className="text-blue-800">Busca {telegramUsername} en Telegram o abre el enlace:</p>
                  <a
                    href="https://t.me/PasaYa_Bot"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block mt-2 bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded transition"
                  >
                    Abrir {telegramUsername}
                  </a>
                </div>
              </div>

              {/* Paso 2 */}
              <div className="flex gap-4">
                <div className="flex-shrink-0">
                  <div className="flex items-center justify-center h-10 w-10 rounded-full bg-blue-500 text-white font-bold">
                    2
                  </div>
                </div>
                <div>
                  <h3 className="font-bold text-blue-900">Envía /start</h3>
                  <p className="text-blue-800">O toca el botón START para iniciar el bot.</p>
                </div>
              </div>

              {/* Paso 3 */}
              <div className="flex gap-4">
                <div className="flex-shrink-0">
                  <div className="flex items-center justify-center h-10 w-10 rounded-full bg-blue-500 text-white font-bold">
                    3
                  </div>
                </div>
                <div>
                  <h3 className="font-bold text-blue-900">Ingresa tu Email</h3>
                  <p className="text-blue-800">El bot te pedirá tu correo electrónico (el mismo de ProSoftware)</p>
                </div>
              </div>

              {/* Paso 4 */}
              <div className="flex gap-4">
                <div className="flex-shrink-0">
                  <div className="flex items-center justify-center h-10 w-10 rounded-full bg-blue-500 text-white font-bold">
                    4
                  </div>
                </div>
                <div>
                  <h3 className="font-bold text-blue-900">Ingresa tu Contraseña</h3>
                  <p className="text-blue-800">Luego ingresa tu contraseña de ProSoftware</p>
                </div>
              </div>

              {/* Paso 5 */}
              <div className="flex gap-4">
                <div className="flex-shrink-0">
                  <div className="flex items-center justify-center h-10 w-10 rounded-full bg-green-500 text-white font-bold">
                    ✓
                  </div>
                </div>
                <div>
                  <h3 className="font-bold text-green-900">¡Listo!</h3>
                  <p className="text-green-800">Ahora puedes registrar visitantes desde el bot</p>
                </div>
              </div>
            </div>
          </div>

          {/* Sección: Datos de Acceso */}
          <div className="bg-amber-50 border-2 border-amber-200 rounded-lg p-6 mb-6">
            <h2 className="text-lg font-bold text-amber-800 mb-4">🔐 Credenciales</h2>
            <p className="text-amber-700 mb-3">El bot usa tus mismas credenciales de ProSoftware:</p>
            <ul className="list-disc list-inside text-amber-700 space-y-2">
              <li>
                <strong>Email:</strong> {user?.email}
              </li>
              <li>
                <strong>Contraseña:</strong> La misma que usas para iniciar sesión aquí
              </li>
              <li>
                <strong>Rol:</strong> {profile?.role === 'resident' ? 'Residente' : 'Otro'}
              </li>
            </ul>
          </div>

          {/* Sección: Lo Que Puedes Hacer */}
          <div className="bg-green-50 border-2 border-green-200 rounded-lg p-6 mb-6">
            <h2 className="text-lg font-bold text-green-800 mb-4">✨ Funcionalidades</h2>
            <ul className="space-y-2">
              <li className="flex items-center gap-2">
                <span className="text-green-600">✓</span>
                <span className="text-green-800">📝 Registrar nuevas visitas</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="text-green-600">✓</span>
                <span className="text-green-800">📋 Ver historial de visitas</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="text-green-600">✓</span>
                <span className="text-green-800">🔐 Usar tus mismas credenciales</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="text-green-600">✓</span>
                <span className="text-green-800">📱 Acceso desde cualquier lugar</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="text-green-600">✓</span>
                <span className="text-green-800">⚡ Rápido y fácil de usar</span>
              </li>
            </ul>
          </div>

          {/* Sección: Seguridad */}
          <div className="bg-red-50 border-2 border-red-200 rounded-lg p-6">
            <h2 className="text-lg font-bold text-red-800 mb-4">🔒 Seguridad</h2>
            <ul className="list-disc list-inside text-red-700 space-y-2">
              <li>Usa autenticación segura de Supabase</li>
              <li>Tus credenciales se validan cada vez que inicias sesión</li>
              <li>La sesión se limpia automáticamente</li>
              <li>Solo tú tienes acceso a tus visitas</li>
            </ul>
          </div>
        </div>

        {/* Botón de Acción */}
        <div className="bg-white rounded-lg shadow-lg p-6 text-center">
          <p className="text-gray-600 mb-4">¿Listo para empezar?</p>
          <a
            href="https://t.me/PasaYa_Bot"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-bold py-3 px-8 rounded-lg transition transform hover:scale-105"
          >
            🤖 Abrir Bot en Telegram
          </a>
        </div>
      </div>
    </div>
  )
}
