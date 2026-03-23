import { Fragment, useEffect, useState } from 'react'
import {
  createCommunityUser,
  getUnitsByCommunityForSelect,
  type CommunityUnitRow,
} from '../../services/users.service'
import type { ProfileStatus, UserRole } from '../../types'
import { Button } from '../../components/ui/Button'
import { Modal } from '../../components/ui/Modal'
import {
  ADMIN_USERS_MODAL_SUCCESS_MS,
  getHousingSelectOptionState,
  isValidEmail,
  ROLE_ACTIVE,
  ROLE_LABELS,
  ROLES,
  STATUS_ACTIVE,
  STATUS_LABELS,
  STATUSES,
} from './adminUsers.helpers'
import { createUserModalStyles as s } from './adminUsers.styles'

type Props = {
  open: boolean
  communityId: string
  onClose: () => void
  onCreated: () => void | Promise<void>
}

export function AdminUsersCreateModal({ open, communityId, onClose, onCreated }: Props) {
  const [createStep, setCreateStep] = useState(1)
  const [newName, setNewName] = useState('')
  const [newLastName, setNewLastName] = useState('')
  const [newEmail, setNewEmail] = useState('')
  const [newPhone, setNewPhone] = useState('')
  const [newUnit, setNewUnit] = useState('')
  const [newRole, setNewRole] = useState<UserRole>('resident')
  const [newStatus, setNewStatus] = useState<ProfileStatus>('active')
  const [sendInvite, setSendInvite] = useState(true)
  const [creating, setCreating] = useState(false)
  const [createSaved, setCreateSaved] = useState(false)
  const [createModalError, setCreateModalError] = useState<string | null>(null)
  const [communityUnits, setCommunityUnits] = useState<CommunityUnitRow[]>([])
  const [loadingUnits, setLoadingUnits] = useState(false)
  const [unitsLoadError, setUnitsLoadError] = useState<string | null>(null)

  useEffect(() => {
    if (!open || !communityId) return
    setCreateStep(1)
    setNewName('')
    setNewLastName('')
    setNewEmail('')
    setNewPhone('')
    setNewUnit('')
    setNewRole('resident')
    setNewStatus('active')
    setSendInvite(true)
    setCreateSaved(false)
    setCreateModalError(null)
    setCommunityUnits([])
    setUnitsLoadError(null)
    setLoadingUnits(true)
    void getUnitsByCommunityForSelect(communityId)
      .then(setCommunityUnits)
      .catch(() => {
        setUnitsLoadError('No se pudieron cargar las unidades.')
        setCommunityUnits([])
      })
      .finally(() => setLoadingUnits(false))
  }, [open, communityId])

  const fullNewName = [newName, newLastName].filter(Boolean).join(' ').trim()
  const canGoToStep2 = fullNewName.length > 0 && isValidEmail(newEmail)

  async function handleCreateUser() {
    setCreateModalError(null)
    setCreating(true)
    try {
      await createCommunityUser({
        email: newEmail,
        name: fullNewName,
        phone: newPhone.trim() || null,
        role: newRole,
        status: newStatus,
        communityId,
        unitNumber: newRole === 'resident' ? newUnit.trim() || null : null,
      })
      await onCreated()
      setCreateSaved(true)
      setTimeout(() => {
        setCreateSaved(false)
        onClose()
      }, ADMIN_USERS_MODAL_SUCCESS_MS)
    } catch (e) {
      const raw = e instanceof Error ? e.message : 'Error al crear usuario'
      let msg = raw
      if (/already registered|already been registered|User already exists/i.test(raw)) {
        msg = 'Ese correo ya está registrado.'
      }
      setCreateModalError(msg)
    } finally {
      setCreating(false)
    }
  }

  function handleClose() {
    if (!creating) onClose()
  }

  return (
    <Modal isOpen={open} onClose={handleClose} showCloseButton={false} closeOnBackdropClick>
      <div style={s.root}>
        <div style={s.accent} />
        <div style={s.body}>
          <div style={s.modalHeader}>
            <p style={s.title}>Nuevo usuario</p>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleClose}
              disabled={creating}
              aria-label="Cerrar"
              style={{ color: '#94a3b8', fontSize: 22, lineHeight: 1, padding: '4px 8px' }}
            >
              ✕
            </Button>
          </div>

          {createModalError && <div style={s.inlineError}>{createModalError}</div>}

          <div style={s.steps}>
            {[1, 2, 3].map((n, i) => (
              <Fragment key={n}>
                <div
                  style={{
                    ...s.dot,
                    ...(createStep > n
                      ? {
                          background: 'rgba(34,211,238,.15)',
                          borderColor: '#22d3ee',
                          color: '#22d3ee',
                        }
                      : createStep === n
                        ? { background: '#22d3ee', borderColor: '#22d3ee', color: '#0f172a' }
                        : {}),
                  }}
                >
                  {createStep > n ? '✓' : n}
                </div>
                {i < 2 && (
                  <div
                    style={{
                      ...s.stepLine,
                      ...(createStep > n ? { background: '#22d3ee' } : {}),
                    }}
                  />
                )}
              </Fragment>
            ))}
          </div>

          {createStep === 1 && (
            <>
              <div style={s.row2}>
                <div style={s.field}>
                  <label style={s.fieldLabel}>Nombre</label>
                  <input
                    style={s.input}
                    placeholder="Carlos"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    disabled={creating}
                  />
                </div>
                <div style={s.field}>
                  <label style={s.fieldLabel}>Apellido</label>
                  <input
                    style={s.input}
                    placeholder="Méndez"
                    value={newLastName}
                    onChange={(e) => setNewLastName(e.target.value)}
                    disabled={creating}
                  />
                </div>
              </div>
              <div style={{ marginBottom: 12 }}>
                <div style={s.field}>
                  <label style={s.fieldLabel}>Correo electrónico</label>
                  <input
                    style={s.input}
                    type="email"
                    placeholder="carlos@ejemplo.com"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    disabled={creating}
                    autoComplete="off"
                  />
                </div>
              </div>
              <div style={s.field}>
                <label style={s.fieldLabel}>Teléfono</label>
                <input
                  style={s.input}
                  placeholder="+504 9999-0000"
                  value={newPhone}
                  onChange={(e) => setNewPhone(e.target.value)}
                  disabled={creating}
                />
              </div>
            </>
          )}

          {createStep === 2 && (
            <>
              <p style={s.sectionLabel}>Rol</p>
              <div style={s.pillGroup}>
                {ROLES.map((r) => (
                  <Button
                    key={r}
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={creating}
                    onClick={() => {
                      setNewRole(r)
                      if (r !== 'resident') setNewUnit('')
                    }}
                    style={{
                      ...s.pill,
                      ...(newRole === r ? ROLE_ACTIVE[r] : {}),
                    }}
                  >
                    {ROLE_LABELS[r]}
                  </Button>
                ))}
              </div>

              {newRole === 'resident' ? (
                <div style={{ ...s.field, marginBottom: 18 }}>
                  <label style={s.fieldLabel} htmlFor="create-user-unit">
                    Unidad de vivienda
                  </label>
                  <select
                    id="create-user-unit"
                    style={s.select}
                    value={newUnit}
                    onChange={(e) => setNewUnit(e.target.value)}
                    disabled={creating || loadingUnits}
                  >
                    <option value="">
                      {loadingUnits ? 'Cargando unidades…' : 'Sin unidad'}
                    </option>
                    {communityUnits.map((u) => {
                      const { disabled, suffix } = getHousingSelectOptionState(u)
                      return (
                        <option key={u.id} value={u.number} disabled={disabled}>
                          {u.number}
                          {suffix}
                        </option>
                      )
                    })}
                  </select>
                  {unitsLoadError && <p style={s.fieldHint}>{unitsLoadError}</p>}
                  {!loadingUnits && !unitsLoadError && communityUnits.length === 0 && (
                    <p style={s.fieldHint}>
                      No hay unidades registradas en esta comunidad. Crea unidades en la base de datos
                      para asignarlas aquí.
                    </p>
                  )}
                </div>
              ) : (
                <p style={{ ...s.fieldHint, marginBottom: 18 }}>
                  La unidad de vivienda solo se pide cuando el nuevo usuario es <strong>residente</strong>. Para
                  admin o guardia no aplica.
                </p>
              )}

              <p style={s.sectionLabel}>Estado inicial</p>
              <div style={s.pillGroup}>
                {STATUSES.map((st) => (
                  <Button
                    key={st}
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={creating}
                    onClick={() => setNewStatus(st)}
                    style={{
                      ...s.pill,
                      ...(newStatus === st ? STATUS_ACTIVE[st] : {}),
                    }}
                  >
                    {STATUS_LABELS[st]}
                  </Button>
                ))}
              </div>

              <div style={s.toggleRow}>
                <div>
                  <p style={s.toggleLabel}>Enviar invitación por correo</p>
                  <p style={s.toggleSub}>
                    Con confirmación activa en Supabase, el usuario recibe correo para activar la cuenta.
                    Si está desactivada, el toggle solo indica la intención (no cambia el servidor desde el
                    cliente).
                  </p>
                </div>
                <Button
                  type="button"
                  variant="unstyled"
                  disabled={creating}
                  onClick={() => setSendInvite((v) => !v)}
                  aria-pressed={sendInvite}
                  style={{
                    ...s.toggle,
                    ...(sendInvite ? { background: 'rgba(34,211,238,.3)', borderColor: '#22d3ee' } : {}),
                  }}
                >
                  <span
                    style={{
                      ...s.toggleKnob,
                      ...(sendInvite ? { background: '#22d3ee', left: 18 } : {}),
                    }}
                  />
                </Button>
              </div>
            </>
          )}

          {createStep === 3 && (
            <>
              <div style={s.previewChip}>
                <div style={s.previewAvatar}>
                  {((newName[0] || '') + (newLastName[0] || '')).toUpperCase() || '?'}
                </div>
                <div>
                  <p style={s.previewName}>{fullNewName || 'Nuevo usuario'}</p>
                  <p style={s.previewMeta}>
                    {newEmail || 'sin correo'} · {ROLE_LABELS[newRole]} · {STATUS_LABELS[newStatus]}
                  </p>
                </div>
              </div>
              <div style={s.summary}>
                <div style={s.summaryRow}>
                  <span style={s.summaryKey}>Vivienda</span>
                  <span style={s.summaryVal}>
                    {newRole === 'resident' ? newUnit.trim() || '—' : 'No aplica'}
                  </span>
                </div>
                <div style={s.summaryRow}>
                  <span style={s.summaryKey}>Teléfono</span>
                  <span style={s.summaryVal}>{newPhone.trim() || '—'}</span>
                </div>
                <div style={s.summaryRow}>
                  <span style={s.summaryKey}>Invitación</span>
                  <span
                    style={{
                      ...s.summaryVal,
                      color: sendInvite ? '#4ade80' : '#f87171',
                    }}
                  >
                    {sendInvite ? '✓ Preferencia: enviar correo' : '✗ Sin preferencia de correo'}
                  </span>
                </div>
              </div>
            </>
          )}

          <div style={s.footer}>
            <span style={s.stepHint}>
              {createStep < 3 ? `Paso ${createStep} de 3` : 'Confirmación'}
            </span>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
              <Button
                type="button"
                variant="outline"
                size="md"
                disabled={creating}
                onClick={handleClose}
                style={s.btnCancel}
              >
                Cancelar
              </Button>
              {createStep > 1 && (
                <Button
                  type="button"
                  variant="outline"
                  size="md"
                  disabled={creating}
                  onClick={() => setCreateStep((st) => st - 1)}
                  style={s.btnCancel}
                >
                  Atrás
                </Button>
              )}
              {createStep < 3 ? (
                <Button
                  type="button"
                  variant="primary"
                  size="md"
                  disabled={creating || (createStep === 1 && !canGoToStep2)}
                  onClick={() => setCreateStep((st) => st + 1)}
                  style={s.btnSave}
                >
                  Continuar →
                </Button>
              ) : (
                <Button
                  type="button"
                  variant="primary"
                  size="md"
                  disabled={creating || !canGoToStep2}
                  onClick={() => void handleCreateUser()}
                  style={{
                    ...s.btnSave,
                    ...(createSaved ? { background: '#4ade80' } : {}),
                  }}
                >
                  {creating ? 'Creando...' : createSaved ? '✓ Creado' : '✓ Crear usuario'}
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </Modal>
  )
}
