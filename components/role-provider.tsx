'use client'

import { createContext, useContext, useMemo, useState, type ReactNode } from 'react'
import { roleProfiles, type AppRole, type RoleProfile } from '@/lib/report-data'

type RoleContextValue = {
  role: AppRole
  profile: RoleProfile
  setRole: (role: AppRole) => void
}

const RoleContext = createContext<RoleContextValue | null>(null)

// Shares the active profile (selected from the result-pane switcher) with the
// sidebar and the result pane so every section can hide itself accordingly.
export function RoleProvider({ children }: { children: ReactNode }) {
  const [role, setRole] = useState<AppRole>('manager')

  const value = useMemo<RoleContextValue>(() => {
    const profile = roleProfiles.find((p) => p.role === role) ?? roleProfiles[0]
    return { role: profile.role, profile, setRole }
  }, [role])

  return <RoleContext.Provider value={value}>{children}</RoleContext.Provider>
}

export function useRole(): RoleContextValue {
  const ctx = useContext(RoleContext)
  if (!ctx) throw new Error('useRole must be used inside <RoleProvider>')
  return ctx
}
