import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '../../context/AuthContext'
import { getProfilesByCommunity, updateProfileRoleAndStatus } from '../../services/users.service'
import type { Profile, UserRole, ProfileStatus } from '../../types'
import { Avatar } from '../../components/ui/Avatar'
import { RoleBadge } from '../../components/ui/Badge'
import { StatusBadge } from '../../components/ui/StatusBadge'
import { Modal } from '../../components/ui/Modal'

const ROLES: UserRole[] = ['admin', 'resident', 'security']
const STATUSES: ProfileStatus[] = ['active', 'inactive', 'suspended']

const ROLE_LABELS: Record<UserRole, string> = {
  admin: 'Admin',
  resident: 'Residente',
  security: 'Guardia',
}

const STATUS_LABELS: Record<ProfileStatus, string> = {
  active: 'Activo',
  inactive: 'Inactivo',
  suspended: 'Suspendido',
}

// Color de pill activa por rol
const ROLE_ACTIVE: Record<UserRole, React.CSSProperties> = {
  admin:    { borderColor: '#22d3ee', color: '#22d3ee', background: 'rgba(34,211,238,.1)' },
  resident: { borderColor: '#818cf8', color: '#818cf8', background: 'rgba(129,140,248,.1)' },
  security: { borderColor: '#fb923c', color: '#fb923c', background: 'rgba(251,146,60,.1)' },
}

// Color de pill activa por estado
const STATUS_ACTIVE: Record<ProfileStatus, React.CSSProperties> = {
  active:    { borderColor: '#4ade80', color: '#4ade80', background: 'rgba(74,222,128,.08)' },
  inactive:  { borderColor: '#fbbf24', color: '#fbbf24', background: 'rgba(251,191,36,.08)' },
  suspended: { borderColor: '#f87171', color: '#f87171', background: 'rgba(248,113,113,.08)' },
}

export default function AdminUsers() {
  const { profile } = useAuth()
  const [profiles, setProfiles] = useState<Profile[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [editingUser, setEditingUser] = useState<Profile | null>(null)
  const [editRole, setEditRole] = useState<UserRole>('resident')
  const [editStatus, setEditStatus] = useState<ProfileStatus>('active')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  const load = useCallback(async () => {
    if (!profile?.community_id) { setLoading(false); return }
    setLoading(true)
    setError(null)
    try {
      const data = await getProfilesByCommunity(profile.community_id)
      setProfiles(data)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error al cargar usuarios')
    } finally {
      setLoading(false)
    }
  }, [profile?.community_id])

  useEffect(() => { load() }, [load])

  async function handleSaveFromModal() {
    if (!editingUser) return
    setSaving(true)
    try {
      await updateProfileRoleAndStatus(editingUser.id, { role: editRole, status: editStatus })
      setProfiles((prev) =>
        prev.map((p) => p.id === editingUser.id ? { ...p, role: editRole, status: editStatus } : p)
      )
      setSaved(true)
      setTimeout(() => {
        setSaved(false)
        setEditingUser(null)
      }, 1200)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error al actualizar')
    } finally {
      setSaving(false)
    }
  }

  function openEditModal(p: Profile) {
    setEditingUser(p)
    setEditRole(p.role)
    setEditStatus(p.status ?? 'active')
    setSaved(false)
  }

  function closeEditModal() {
    if (!saving) setEditingUser(null)
  }

  if (!profile?.community_id) {
    return (
      <main style={styles.main}>
        <div style={styles.wrapper}>
          <p style={styles.subtitle}>No tienes una comunidad asignada.</p>
        </div>
      </main>
    )
  }

  const byRole = ROLES.reduce(
    (acc, r) => ({ ...acc, [r]: profiles.filter((p) => p.role === r).length }),
    {} as Record<UserRole, number>
  )

  return (
    <main style={styles.main}>
      <div style={styles.wrapper}>
        <h2 style={styles.title}>Gestión de Usuarios</h2>
        <p style={styles.subtitle}>Administra roles de todos los miembros de la comunidad.</p>

        {error && <div style={styles.error}>{error}</div>}

        {/* Stats por rol */}
        <div style={styles.statsGrid}>
          {ROLES.map((role) => (
            <div key={role} style={styles.statCard}>
              <p style={styles.statValue}>{byRole[role]}</p>
              <RoleBadge role={role} />
            </div>
          ))}
        </div>

        {/* Tabla */}
        <div style={styles.card}>
          {loading ? (
            <div style={styles.empty}>Cargando usuarios...</div>
          ) : profiles.length === 0 ? (
            <div style={styles.empty}>No hay usuarios en esta comunidad.</div>
          ) : (
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>Usuario</th>
                  <th style={styles.th}>Contacto</th>
                  <th style={styles.th}>Unidad</th>
                  <th style={styles.th}>Rol</th>
                  <th style={styles.th}>Estado</th>
                  <th style={styles.th}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {profiles.map((u) => (
                  <tr key={u.id} style={styles.tr}>
                    <td style={styles.td}>
                      <div style={styles.userCell}>
                        <Avatar name={u.name} size={32} />
                        <div>
                          <p style={styles.userName}>{u.name}</p>
                          <p style={styles.userEmail}>{u.email || '—'}</p>
                        </div>
                      </div>
                    </td>
                    <td style={styles.td}><span style={styles.contact}>{u.phone || '—'}</span></td>
                    <td style={styles.td}><span style={styles.unit}>{u.unit_number || '—'}</span></td>
                    <td style={styles.td}><RoleBadge role={u.role} /></td>
                    <td style={styles.td}><StatusBadge status={u.status ?? 'active'} /></td>
                    <td style={styles.td}>
                      <button
                        type="button"
                        onClick={() => openEditModal(u)}
                        style={styles.linkBtn}
                        disabled={editingUser != null}
                      >
                        Editar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* ── MODAL OPCIÓN C ── */}
        <Modal isOpen={editingUser != null} onClose={closeEditModal} showCloseButton={false}>
          {editingUser && (
            <div style={modalStyles.root}>
              {/* Barra de acento lateral */}
              <div style={modalStyles.accent} />

              <div style={modalStyles.body}>
                {/* Título */}
                <p style={modalStyles.title}>Editar usuario</p>

                {/* Info del usuario */}
                <div style={modalStyles.userRow}>
                  <Avatar name={editingUser.name} size={42} />
                  <div>
                    <p style={modalStyles.userName}>{editingUser.name}</p>
                    <p style={modalStyles.userEmail}>{editingUser.email || editingUser.id}</p>
                    <p style={modalStyles.userMeta}>
                      {editingUser.phone || '—'} · Unidad {editingUser.unit_number || '—'}
                    </p>
                  </div>
                </div>

                {/* Pills — Rol */}
                <p style={modalStyles.sectionLabel}>Rol</p>
                <div style={modalStyles.pillGroup}>
                  {ROLES.map((r) => (
                    <button
                      key={r}
                      type="button"
                      disabled={saving}
                      onClick={() => setEditRole(r)}
                      style={{
                        ...modalStyles.pill,
                        ...(editRole === r ? ROLE_ACTIVE[r] : {}),
                      }}
                    >
                      {ROLE_LABELS[r]}
                    </button>
                  ))}
                </div>

                {/* Pills — Estado */}
                <p style={modalStyles.sectionLabel}>Estado</p>
                <div style={modalStyles.pillGroup}>
                  {STATUSES.map((s) => (
                    <button
                      key={s}
                      type="button"
                      disabled={saving}
                      onClick={() => setEditStatus(s)}
                      style={{
                        ...modalStyles.pill,
                        ...(editStatus === s ? STATUS_ACTIVE[s] : {}),
                      }}
                    >
                      {STATUS_LABELS[s]}
                    </button>
                  ))}
                </div>

                {/* Acciones */}
                <div style={modalStyles.footer}>
                  <button
                    type="button"
                    onClick={closeEditModal}
                    disabled={saving}
                    style={modalStyles.btnCancel}
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    onClick={handleSaveFromModal}
                    disabled={saving}
                    style={{
                      ...modalStyles.btnSave,
                      ...(saved ? { background: '#4ade80' } : {}),
                    }}
                  >
                    {saving ? 'Guardando...' : saved ? '✓ Guardado' : '✓ Guardar'}
                  </button>
                </div>
              </div>
            </div>
          )}
        </Modal>
      </div>
    </main>
  )
}

// ─── Estilos tabla (sin cambios) ───────────────────────────────────────────
const styles: Record<string, React.CSSProperties> = {
  main: { flex: 1, overflowY: 'auto', background: '#020617', minHeight: '100vh' },
  wrapper: { padding: 24, maxWidth: 900, margin: '0 auto' },
  title: { fontFamily: 'Syne, sans-serif', fontSize: 24, fontWeight: 800, color: 'white', marginBottom: 4 },
  subtitle: { color: '#94a3b8', fontSize: 13, marginBottom: 24 },
  error: { background: 'rgba(239,68,68,.15)', border: '1px solid #ef4444', borderRadius: 12, padding: '12px 16px', color: '#fca5a5', fontSize: 13, marginBottom: 24 },
  statsGrid: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 24 },
  statCard: { background: '#1e293b', border: '1px solid #334155', borderRadius: 16, padding: 16 },
  statValue: { fontFamily: 'Syne, sans-serif', fontSize: 28, fontWeight: 900, color: 'white', marginBottom: 8 },
  card: { background: '#0f172a', border: '1px solid #1e293b', borderRadius: 20, padding: 0, overflow: 'hidden' },
  table: { borderCollapse: 'collapse', width: '100%' },
  th: { textAlign: 'left', padding: '10px 20px', fontSize: 11, color: '#64748b', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1px solid #1e293b' },
  tr: {},
  td: { padding: '12px 20px', borderBottom: '1px solid #1e293b', fontSize: 13 },
  userCell: { display: 'flex', alignItems: 'center', gap: 10 },
  userName: { color: 'white', fontWeight: 500 },
  userEmail: { color: '#64748b', fontSize: 11 },
  contact: { color: '#94a3b8', fontSize: 12 },
  unit: { color: '#94a3b8', fontSize: 12 },
  linkBtn: { background: 'none', border: 'none', color: '#22d3ee', fontWeight: 600, fontSize: 12, cursor: 'pointer' },
  empty: { padding: 40, textAlign: 'center', color: '#64748b', fontSize: 13 },
}

// ─── Estilos modal Opción C ────────────────────────────────────────────────
const modalStyles: Record<string, React.CSSProperties> = {
  root: {
    display: 'flex',
    overflow: 'hidden',
    borderRadius: 16,
    margin: -24, // cancela el padding interno del Modal si lo tiene
  },
  accent: {
    width: 5,
    flexShrink: 0,
    background: 'linear-gradient(180deg, #22d3ee, #818cf8)',
  },
  body: {
    flex: 1,
    padding: '22px 20px 18px',
  },
  title: {
    fontSize: 11,
    fontWeight: 700,
    color: '#22d3ee',
    textTransform: 'uppercase',
    letterSpacing: '0.09em',
    margin: '0 0 16px',
  },
  userRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    marginBottom: 20,
    paddingBottom: 16,
    borderBottom: '0.5px solid #1e293b',
  },
  userName: {
    color: 'white',
    fontSize: 14,
    fontWeight: 600,
    margin: '0 0 2px',
  },
  userEmail: {
    color: '#96a1b0',
    fontSize: 11,
    margin: '0 0 1px',
  },
  userMeta: {
    color: '#96a1b0',
    fontSize: 11,
    margin: 0,
  },
  sectionLabel: {
    fontSize: 10,
    color: '#475569',
    textTransform: 'uppercase',
    letterSpacing: '0.07em',
    margin: '0 0 9px',
  },
  pillGroup: {
    display: 'flex',
    gap: 7,
    flexWrap: 'wrap',
    marginBottom: 18,
  },
  pill: {
    padding: '7px 15px',
    borderRadius: 99,
    border: '1px solid #1e293b',
    fontSize: 12,
    color: '#64748b',
    background: 'transparent',
    cursor: 'pointer',
    transition: 'all .15s',
  },
  footer: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: 10,
    marginTop: 8,
    paddingTop: 16,
    borderTop: '0.5px solid #1e293b',
  },
  btnCancel: {
    background: 'transparent',
    border: '1px solid #1e293b',
    borderRadius: 10,
    padding: '9px 18px',
    fontSize: 13,
    color: '#64748b',
    cursor: 'pointer',
  },
  btnSave: {
    background: '#22d3ee',
    border: 'none',
    borderRadius: 10,
    padding: '9px 22px',
    fontSize: 13,
    fontWeight: 700,
    color: '#0f172a',
    cursor: 'pointer',
    transition: 'background .2s',
  },
}
