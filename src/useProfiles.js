import { useEffect, useState } from 'react'
import { supabase } from './supabaseClient'

export function useProfiles(ids) {
  const [profiles, setProfiles] = useState({})
  const key = [...new Set(ids.filter(Boolean))].sort().join(',')

  useEffect(() => {
    if (!key) return
    supabase
      .from('profiles')
      .select('id, display_name')
      .in('id', key.split(','))
      .then(({ data }) => {
        const map = {}
        ;(data || []).forEach((p) => {
          map[p.id] = p
        })
        setProfiles(map)
      })
  }, [key])

  return profiles
}
