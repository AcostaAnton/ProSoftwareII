import { supabase } from './supabase'
import { uploadVisitPhoto } from './visits.service'

type GateBaseInput = {
  visitId: string
  guardId: string
  photoFile?: File | null
  photoNotes?: string
}

export async function recordVisitEntry(input: GateBaseInput & { entryNotes?: string }) {
  const photoUrl = input.photoFile ? await uploadVisitPhoto(input.photoFile) : null

  const { error: logError } = await supabase.from('access_logs').insert({
    visit_id: input.visitId,
    guard_id: input.guardId,
    vehicle_photo_url: photoUrl,
    vehicle_notes: input.photoNotes ?? '',
    entry_notes: input.entryNotes ?? '',
    entry_time: new Date().toISOString(),
  })
  if (logError) throw logError

  const { error: visitError } = await supabase
    .from('visits')
    .update({ status: 'approved', approved_by: input.guardId })
    .eq('id', input.visitId)
  if (visitError) throw visitError

  const { error: historyError } = await supabase.from('visit_status_history').insert({
    visit_id: input.visitId,
    old_status: 'pending',
    new_status: 'approved',
    changed_by_id: input.guardId,
    notes: `Entrada registrada: ${input.entryNotes ?? ''}`.trim(),
  })
  if (historyError) throw historyError
}

export async function denyVisitEntry(
  input: GateBaseInput & { reason: string },
) {
  const reason = input.reason.trim()
  if (!reason) {
    throw new Error('Para denegar el acceso, es obligatorio escribir el motivo en las notas.')
  }

  const photoUrl = input.photoFile ? await uploadVisitPhoto(input.photoFile) : null

  const { error: logError } = await supabase.from('access_logs').insert({
    visit_id: input.visitId,
    guard_id: input.guardId,
    vehicle_photo_url: photoUrl,
    vehicle_notes: input.photoNotes ?? '',
    entry_notes: `ACCESO DENEGADO: ${reason}`,
    entry_time: new Date().toISOString(),
  })
  if (logError) throw logError

  const { error: visitError } = await supabase
    .from('visits')
    .update({ status: 'rejected' })
    .eq('id', input.visitId)
  if (visitError) throw visitError

  const { error: historyError } = await supabase.from('visit_status_history').insert({
    visit_id: input.visitId,
    old_status: 'pending',
    new_status: 'rejected',
    changed_by_id: input.guardId,
    notes: `Acceso denegado en garita: ${reason}`,
  })
  if (historyError) throw historyError
}

export async function recordVisitExit(input: { visitId: string; guardId: string; exitNotes?: string }) {
  const { error: logError } = await supabase
    .from('access_logs')
    .update({
      exit_notes: input.exitNotes ?? '',
      exit_time: new Date().toISOString(),
    })
    .eq('visit_id', input.visitId)
  if (logError) throw logError

  const { error: visitError } = await supabase
    .from('visits')
    .update({ status: 'completed' })
    .eq('id', input.visitId)
  if (visitError) throw visitError

  const { error: historyError } = await supabase.from('visit_status_history').insert({
    visit_id: input.visitId,
    old_status: 'approved',
    new_status: 'completed',
    changed_by_id: input.guardId,
    notes: `Salida registrada: ${input.exitNotes ?? ''}`.trim(),
  })
  if (historyError) throw historyError
}

