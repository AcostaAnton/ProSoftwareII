import { Context } from 'telegraf'
import { createVisit, getCommunityName } from '../services/visits.service'
import { generateQRBuffer } from '../services/qr.service'
import { clearUserSession, getUserSession, setUserStep, showMainMenu } from './session.handler'

export async function handleConfirmVisit(ctx: Context) {
  const userId = ctx.from?.id

  if (!userId) {
    await ctx.reply('❌ Error: No se pudo procesar tu solicitud.')
    return
  }

  const session = getUserSession(userId)
  const { data } = session

  // Verificar que tengamos datos requeridos
  if (!data.visitor_name || !data.visit_date || !data.resident_id) {
    await ctx.reply('❌ Faltan datos requeridos. Por favor, comienza de nuevo.')
    setUserStep(userId, 'main_menu')
    await showMainMenu(ctx)
    return
  }

  try {
    // Mostrar "generando..." para mejor UX
    await ctx.sendChatAction('upload_photo')

    // Crear la visita en la BD
    const result = await createVisit({
      resident_id: data.resident_id,
      visitor_name: data.visitor_name,
      visitor_phone: data.visitor_phone || null,
      visit_date: data.visit_date,
      visit_time: data.visit_time || null,
      visit_purpose: data.visit_purpose || null,
      visit_destination: data.visit_destination || null,
      created_by: data.resident_id,
    })

    if (!result.success || !result.qrToken) {
      await ctx.reply(`❌ Error: ${result.error}`)
      setUserStep(userId, 'main_menu')
      await showMainMenu(ctx)
      return
    }

    // Obtener nombre de la comunidad para la tarjeta
    let communityName = ''
    if (data.community_id) {
      communityName = await getCommunityName(data.community_id) || ''
    }

    // Generar el Buffer del QR
    const qrBuffer = await generateQRBuffer(result.qrToken)

    // Construir el mensaje estilizado (Tarjeta de Invitación)
    let caption = `🎫 *TARJETA DE INVITACIÓN*\n\n`
    caption += `━━━━━━━━━━━━━━━━━━━━\n`
    caption += `👤 *Visitante:* ${data.visitor_name}\n`
    if (communityName) caption += `🏠 *Comunidad:* ${communityName}\n`
    caption += `📅 *Fecha:* ${data.visit_date}\n`
    if (data.visit_time && data.visit_time !== '(no mostrado)') {
      caption += `⏰ *Hora:* ${data.visit_time}\n`
    }
    if (data.visit_purpose && data.visit_purpose !== '(no mostrado)') {
      caption += `🎯 *Asunto:* ${data.visit_purpose}\n`
    }
    caption += `━━━━━━━━━━━━━━━━━━━━\n\n`
    
    caption += `🔐 *Token QR:* \`${result.qrToken}\`\n\n`
    
    caption += `⚠️ *REGLAS DE VISITANTE:*\n`
    caption += `🪪 Presente QR e identidad\n`
    caption += `🏍️ Quítate el casco / 🚗 Baja vidrios\n`
    caption += `🏁 Velocidad máx. 20 km/h\n\n`
    
    caption += `_Muestra este QR en portería para ingresar._`

    // Enviar la "Tarjeta" (Foto + Caption)
    await ctx.replyWithPhoto(
      { source: qrBuffer },
      { 
        caption, 
        parse_mode: 'Markdown' 
      }
    )

    // Limpiar datos y volver al menú
    setUserStep(userId, 'main_menu')
    await showMainMenu(ctx)

  } catch (error) {
    console.error('Error en el flujo de confirmación:', error)
    await ctx.reply('❌ Error inesperado al generar la tarjeta de invitación.')
    setUserStep(userId, 'main_menu')
    await showMainMenu(ctx)
  }
}

export async function handleCancelVisit(ctx: Context) {
  const userId = ctx.from?.id

  if (!userId) {
    await ctx.reply('❌ Error: No se pudo procesar tu solicitud.')
    return
  }

  await ctx.reply('❌ Visita cancelada.')

  setUserStep(userId, 'main_menu')
  await showMainMenu(ctx)
}
