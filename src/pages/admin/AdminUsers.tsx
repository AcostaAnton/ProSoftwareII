import { useState, useEffect, useCallback, useMemo, useRef } from 'react'
import { useAuth } from '../../context/AuthContext'
import { getProfilesByCommunity, MAX_RESIDENTS_PER_UNIT } from '../../services/users.service'
import type { Profile, UserRole } from '../../types'
import { Avatar } from '../../components/ui/Avatar'
import { RoleBadge } from '../../components/ui/Badge'
import { StatusBadge } from '../../components/ui/StatusBadge'
import { Button } from '../../components/ui/Button'
import { ROLES } from './adminUsers.helpers'
import { adminUsersPageStyles as styles } from './adminUsers.styles'
import { AdminUsersCreateModal } from './AdminUsersCreateModal'
import { AdminUsersEditModal } from './AdminUsersEditModal'

export default function AdminUsers() {
  const { profile } = useAuth()
  const [profiles, setProfiles] = useState<Profile[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [editingUser, setEditingUser] = useState<Profile | null>(null)
  const [creatingUser, setCreatingUser] = useState(false)

  const loadSeq = useRef(0)

  const load = useCallback(async (opts?: { silent?: boolean }) => {
    const seq = ++loadSeq.current
    if (!profile?.community_id) {
      setLoading(false)
      return
    }
    if (!opts?.silent) {
      setLoading(true)
    }
    setError(null)
    try {
      const data = await getProfilesByCommunity(profile.community_id)
      if (seq !== loadSeq.current) return
      setProfiles(data)
    } catch (e) {
      if (seq !== loadSeq.current) return
      setError(e instanceof Error ? e.message : 'Error al cargar usuarios')
    } finally {
      if (!opts?.silent) {
        if (seq !== loadSeq.current) return
        setLoading(false)
      }
    }
  }, [profile?.community_id])

  useEffect(() => {
    void load()
  }, [load])

  const byRole = useMemo(
    () =>
      ROLES.reduce(
        (acc, r) => ({ ...acc, [r]: profiles.filter((p) => p.role === r).length }),
        {} as Record<UserRole, number>
      ),
    [profiles]
  )

  if (!profile?.community_id) {
    return (
      <main className="admin-users-page" style={styles.main}>
        <div className="admin-users-wrapper" style={styles.wrapper}>
          <p style={styles.subtitle}>No tienes una comunidad asignada.</p>
        </div>
      </main>
    )
  }

  const communityId = profile.community_id

  return (
    <main className="admin-users-page" style={styles.main}>
      <div className="admin-users-wrapper" style={styles.wrapper}>
        <div className="admin-users-header" style={styles.headerRow}>
          <div className="admin-users-header-text">
            <h2 className="admin-users-title" style={styles.title}>
              Gestión de Usuarios
            </h2>
            <p className="admin-users-subtitle" style={styles.subtitle}>
              Solo los administradores pueden crear usuarios y gestionar roles. Cada vivienda admite
              hasta {MAX_RESIDENTS_PER_UNIT} cuentas residente. Al dar de alta un{' '}
              <strong style={{ color: '#e2e8f0' }}>residente</strong>, podrás asignarle una vivienda.
            </p>
          </div>
          <Button
            type="button"
            variant="primary"
            size="md"
            onClick={() => setCreatingUser(true)}
            className="admin-users-btn-create"
            style={{
              ...styles.btnCreate,
              ...(editingUser != null || creatingUser ? { opacity: 0.45, cursor: 'not-allowed' } : {}),
            }}
            disabled={editingUser != null || creatingUser}
          >
            + Nuevo usuario
          </Button>
        </div>

        {error && <div style={styles.error}>{error}</div>}

        <div className="admin-users-stats" style={styles.statsGrid}>
          {ROLES.map((role) => (
            <div key={role} className="admin-users-stat-card" style={styles.statCard}>
              <p className="admin-users-stat-value" style={styles.statValue}>
                {byRole[role]}
              </p>
              <RoleBadge role={role} />
            </div>
          ))}
        </div>

        <div className="admin-users-card" style={styles.card}>
          {loading ? (
            <div style={styles.empty}>Cargando usuarios...</div>
          ) : profiles.length === 0 ? (
            <div style={styles.empty}>No hay usuarios en esta comunidad.</div>
          ) : (
            <div className="admin-users-table-wrap">
            <table className="admin-users-table" style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>Usuario</th>
                  <th style={styles.th}>Contacto</th>
                  <th style={styles.th}>Vivienda</th>
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
                    <td style={styles.td}>
                      <span style={styles.contact}>{u.phone || '—'}</span>
                    </td>
                    <td style={styles.td}>
                      <span style={styles.unit}>{u.unit_number || '—'}</span>
                    </td>
                    <td style={styles.td}>
                      <RoleBadge role={u.role} />
                    </td>
                    <td style={styles.td}>
                      <StatusBadge status={u.status ?? 'active'} />
                    </td>
                    <td style={styles.td}>
                      <Button
                        type="button"
                        variant="link"
                        size="sm"
                        onClick={() => setEditingUser(u)}
                        style={styles.linkBtn}
                        disabled={editingUser != null || creatingUser}
                      >
                        Editar
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            </div>
          )}
        </div>

        <AdminUsersEditModal
          user={editingUser}
          open={editingUser != null}
          onClose={() => setEditingUser(null)}
          onSaved={() => load({ silent: true })}
        />

        <AdminUsersCreateModal
          open={creatingUser}
          communityId={communityId}
          onClose={() => setCreatingUser(false)}
          onCreated={() => load({ silent: true })}
        />
      </div>
    </main>
  )
}
