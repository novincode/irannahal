'use client'
import React, { createContext, useContext, useReducer, useCallback } from 'react'
import type { AuthState, AuthStep } from '@actions/auth/types'

// Initial state using the centralized AuthState interface
const initialState: AuthState = {
  currentStep: 'phone',
  phoneNumber: '',
  profileData: undefined,
  isLoading: false,
  error: undefined,
  attempts: 0,
}

// Simplified action types
type AuthAction =
  | { type: 'SET_STEP'; payload: AuthStep }
  | { type: 'SET_PHONE'; payload: string }
  | { type: 'SET_PROFILE_DATA'; payload: { name?: string; email?: string } }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | undefined }
  | { type: 'INCREMENT_ATTEMPTS' }
  | { type: 'RESET_ATTEMPTS' }
  | { type: 'RESET' }

// Simplified reducer
function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case 'SET_STEP':
      return { ...state, currentStep: action.payload, error: undefined }
    case 'SET_PHONE':
      return { ...state, phoneNumber: action.payload }
    case 'SET_PROFILE_DATA':
      return { ...state, profileData: action.payload }
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload }
    case 'SET_ERROR':
      return { ...state, error: action.payload }
    case 'INCREMENT_ATTEMPTS':
      return { ...state, attempts: state.attempts + 1 }
    case 'RESET_ATTEMPTS':
      return { ...state, attempts: 0 }
    case 'RESET':
      return initialState
    default:
      return state
  }
}

// Simplified context type
interface AuthContextType {
  state: AuthState
  setStep: (step: AuthStep) => void
  setPhone: (phone: string) => void
  setProfileData: (data: { name?: string; email?: string }) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | undefined) => void
  incrementAttempts: () => void
  resetAttempts: () => void
  reset: () => void
}

// Create context
const AuthContext = createContext<AuthContextType | undefined>(undefined)

// Provider component
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(authReducer, initialState)

  const setStep = useCallback((step: AuthStep) => {
    dispatch({ type: 'SET_STEP', payload: step })
  }, [])

  const setPhone = useCallback((phone: string) => {
    dispatch({ type: 'SET_PHONE', payload: phone })
  }, [])

  const setLoading = useCallback((loading: boolean) => {
    dispatch({ type: 'SET_LOADING', payload: loading })
  }, [])

  const setError = useCallback((error: string | undefined) => {
    dispatch({ type: 'SET_ERROR', payload: error })
  }, [])

  const incrementAttempts = useCallback(() => {
    dispatch({ type: 'INCREMENT_ATTEMPTS' })
  }, [])

  const resetAttempts = useCallback(() => {
    dispatch({ type: 'RESET_ATTEMPTS' })
  }, [])

  const reset = useCallback(() => {
    dispatch({ type: 'RESET' })
  }, [])

  const setProfileData = useCallback((data: { name?: string; email?: string }) => {
    dispatch({ type: 'SET_PROFILE_DATA', payload: data })
  }, [])

  const value: AuthContextType = {
    state,
    setStep,
    setPhone,
    setLoading,
    setError,
    incrementAttempts,
    resetAttempts,
    reset,
    setProfileData,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

// Hook to use auth context
export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
