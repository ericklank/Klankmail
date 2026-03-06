import { useState, useEffect } from 'react'

const STORAGE_KEY = 'pitchiq_profile'

const defaultProfile = {
  name: '',
  email: '',
  phone: '',
  title: '',
  company: '',
  linkedIn: '',
  timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
}

export function useProfile() {
  const [profile, setProfile] = useState(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      return stored ? { ...defaultProfile, ...JSON.parse(stored) } : defaultProfile
    } catch {
      return defaultProfile
    }
  })

  const updateProfile = (updates) => {
    const updated = { ...profile, ...updates }
    setProfile(updated)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
  }

  const isProfileComplete = profile.name && profile.email && profile.phone

  return { profile, updateProfile, isProfileComplete }
}
