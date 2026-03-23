import { useState, useEffect, useCallback, useMemo } from 'react'
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

  const load = useCallback(async () => {
    if (!profile?.community_id) {
      setLoading(false)
      return
    }
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
      <main style={styles.main}>
        <div style={styles.wrapper}>
          <p style={styles.subtitle}>No tienes una comunidad asignada.</p>
        </div>
      </main>
    )
  }

  const communityId = profile.community_id

  return (
    <main style={styles.main}>
      <div style={styles.wrapper}>
        <div style={styles.headerRow}>
          <div>
            <h2 style={styles.title}>Gestión de Usuarios</h2>
            <p style={styles.subtitle}>
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

        <div style={styles.statsGrid}>
          {ROLES.map((role) => (
            <div key={role} style={styles.statCard}>
              <p style={styles.statValue}>{byRole[role]}</p>
              <RoleBadge role={role} />
            </div>
          ))}
        </div>

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
          )}
        </div>

        <AdminUsersEditModal
          user={editingUser}
          open={editingUser != null}
          onClose={() => setEditingUser(null)}
          onSaved={load}
        />

        <AdminUsersCreateModal
          open={creatingUser}
          communityId={communityId}
          onClose={() => setCreatingUser(false)}
          onCreated={load}
        />
      </div>
    </main>
  )
}
