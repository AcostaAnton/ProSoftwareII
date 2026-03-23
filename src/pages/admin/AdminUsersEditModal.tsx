import { useEffect, useRef, useState } from 'react'
import {
  getCommunitiesForSelect,
  getUnitsByCommunityForSelect,
  updateProfileCommunityRoleStatusAndUnit,
  type CommunityOption,
  type CommunityUnitRow,
} from '../../services/users.service'
import type { Profile, ProfileStatus, UserRole } from '../../types'
import { Avatar } from '../../components/ui/Avatar'
import { Button } from '../../components/ui/Button'
import { Modal } from '../../components/ui/Modal'
import {
  ADMIN_USERS_MODAL_SUCCESS_MS,
  getHousingSelectOptionState,
  ROLE_ACTIVE,
  ROLE_LABELS,
  ROLES,
  STATUS_ACTIVE,
  STATUS_LABELS,
  STATUSES,
} from './adminUsers.helpers'
import { editUserModalStyles as s } from './adminUsers.styles'

type Props = {
  user: Profile | null
  open: boolean
  onClose: () => void
  onSaved: () => void | Promise<void>
}

export function AdminUsersEditModal({ user, open, onClose, onSaved }: Props) {
  const [editRole, setEditRole] = useState<UserRole>('resident')
  const [editStatus, setEditStatus] = useState<ProfileStatus>('active')
  const [editCommunityId, setEditCommunityId] = useState('')
  const [editUnit, setEditUnit] = useState('')
  const [editCommunities, setEditCommunities] = useState<CommunityOption[]>([])
  const [editModalUnits, setEditModalUnits] = useState<CommunityUnitRow[]>([])
  const [loadingEditModalData, setLoadingEditModalData] = useState(false)
  const [editUnitsLoadError, setEditUnitsLoadError] = useState<string | null>(null)
  const [editSaveError, setEditSaveError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  const unitsRequestId = useRef(0)

  useEffect(() => {
    if (!user || !open) return
    const req = ++unitsRequestId.current
    setEditRole(user.role)
    setEditStatus(user.status ?? 'active')
    setEditCommunityId(user.community_id)
    setEditUnit(user.unit_number ?? '')
    setEditSaveError(null)
    setEditUnitsLoadError(null)
    setSaved(false)
    setLoadingEditModalData(true)
    void Promise.all([getCommunitiesForSelect(), getUnitsByCommunityForSelect(user.community_id)])
      .then(([comms, units]) => {
        if (req !== unitsRequestId.current) return
        setEditCommunities(comms)
        setEditModalUnits(units)
      })
      .catch(() => {
        if (req !== unitsRequestId.current) return
        setEditUnitsLoadError('No se pudieron cargar comunidades o unidades.')
        setEditCommunities([])
        setEditModalUnits([])
      })
      .finally(() => {
        if (req !== unitsRequestId.current) return
        setLoadingEditModalData(false)
      })
  }, [user?.id, open])

  function handleEditCommunityChange(cid: string) {
    const req = ++unitsRequestId.current
    setEditCommunityId(cid)
    setEditUnit('')
    setEditUnitsLoadError(null)
    setLoadingEditModalData(true)
    void getUnitsByCommunityForSelect(cid)
      .then((units) => {
        if (req !== unitsRequestId.current) return
        setEditModalUnits(units)
      })
      .catch(() => {
        if (req !== unitsRequestId.current) return
        setEditUnitsLoadError('No se pudieron cargar las unidades.')
        setEditModalUnits([])
      })
      .finally(() => {
        if (req !== unitsRequestId.current) return
        setLoadingEditModalData(false)
      })
  }

  async function handleSave() {
    if (!user || !editCommunityId) return
    setEditSaveError(null)
    setSaving(true)
    try {
      await updateProfileCommunityRoleStatusAndUnit(user.id, {
        role: editRole,
        status: editStatus,
        communityId: editCommunityId,
        unitNumber: editRole === 'resident' ? editUnit.trim() || null : null,
      })
      await onSaved()
      setSaved(true)
      setTimeout(() => {
        setSaved(false)
        onClose()
      }, ADMIN_USERS_MODAL_SUCCESS_MS)
    } catch (e) {
      setEditSaveError(e instanceof Error ? e.message : 'Error al actualizar')
    } finally {
      setSaving(false)
    }
  }

  function handleClose() {
    if (!saving) onClose()
  }

  const editCommunityOptions: CommunityOption[] =
    user && !editCommunities.some((c) => c.id === user.community_id)
      ? [{ id: user.community_id, name: 'Comunidad actual' }, ...editCommunities]
      : editCommunities

  return (
    <Modal isOpen={open} onClose={handleClose} showCloseButton={false}>
      {user && (
        <div style={s.root}>
          <div style={s.accent} />
          <div style={s.body}>
            <p style={s.title}>Editar usuario</p>

            <div style={s.userRow}>
              <Avatar name={user.name} size={42} />
              <div>
                <p style={s.userName}>{user.name}</p>
                <p style={s.userEmail}>{user.email || user.id}</p>
                <p style={s.userMeta}>{user.phone || '—'}</p>
              </div>
            </div>

            {editSaveError && <div style={s.inlineError}>{editSaveError}</div>}

            <p style={s.sectionLabel}>Comunidad</p>
            <div style={{ ...s.field, marginBottom: 14 }}>
              <select
                aria-label="Comunidad"
                style={s.select}
                value={editCommunityId}
                onChange={(e) => handleEditCommunityChange(e.target.value)}
                disabled={saving || loadingEditModalData}
              >
                {loadingEditModalData && editCommunityOptions.length === 0 ? (
                  <option value={editCommunityId}>Cargando…</option>
                ) : null}
                {editCommunityOptions.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            {editRole === 'resident' ? (
              <div style={{ marginBottom: 18 }}>
                <p style={s.sectionLabel}>Vivienda</p>
                <div style={s.field}>
                  <select
                    aria-label="Vivienda o unidad"
                    style={s.select}
                    value={editUnit}
                    onChange={(e) => setEditUnit(e.target.value)}
                    disabled={saving || loadingEditModalData}
                  >
                    <option value="">
                      {loadingEditModalData ? 'Cargando unidades…' : 'Sin unidad'}
                    </option>
                    {editModalUnits.map((u) => {
                      const { disabled, suffix } = getHousingSelectOptionState(u, user.id)
                      return (
                        <option key={u.id} value={u.number} disabled={disabled}>
                          {u.number}
                          {suffix}
                        </option>
                      )
                    })}
                  </select>
                  {editUnitsLoadError && <p style={s.fieldHint}>{editUnitsLoadError}</p>}
                </div>
              </div>
            ) : (
              <p style={{ ...s.fieldHint, marginBottom: 18 }}>
                La vivienda solo se asigna cuando el rol es{' '}
                <strong style={{ color: '#e2e8f0' }}>residente</strong>.
              </p>
            )}

            <p style={s.sectionLabel}>Rol</p>
            <div style={s.pillGroup}>
              {ROLES.map((r) => (
                <Button
                  key={r}
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={saving}
                  onClick={() => {
                    setEditRole(r)
                    if (r !== 'resident') setEditUnit('')
                  }}
                  style={{
                    ...s.pill,
                    ...(editRole === r ? ROLE_ACTIVE[r] : {}),
                  }}
                >
                  {ROLE_LABELS[r]}
                </Button>
              ))}
            </div>

            <p style={s.sectionLabel}>Estado</p>
            <div style={s.pillGroup}>
              {STATUSES.map((st) => (
                <Button
                  key={st}
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={saving}
                  onClick={() => setEditStatus(st)}
                  style={{
                    ...s.pill,
                    ...(editStatus === st ? STATUS_ACTIVE[st] : {}),
                  }}
                >
                  {STATUS_LABELS[st]}
                </Button>
              ))}
            </div>

            <div style={s.footer}>
              <Button
                type="button"
                variant="outline"
                size="md"
                onClick={handleClose}
                disabled={saving}
                style={s.btnCancel}
              >
                Cancelar
              </Button>
              <Button
                type="button"
                variant="primary"
                size="md"
                onClick={() => void handleSave()}
                disabled={saving || !editCommunityId || loadingEditModalData}
                style={{
                  ...s.btnSave,
                  ...(saved ? { background: '#4ade80' } : {}),
                }}
              >
                {saving ? 'Guardando...' : saved ? '✓ Guardado' : '✓ Guardar'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </Modal>
  )
}
