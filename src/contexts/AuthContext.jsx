import { createContext, useContext, useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [student, setStudent] = useState(null)
  const [adminConfig, setAdminConfig] = useState(null)
  const [loading, setLoading] = useState(true)
  const [session, setSession] = useState(null)

  useEffect(() => {
    // --- Restore session from sessionStorage first (synchronous) ---
    let initialStudent = null
    let initialAdminConfig = null
    try {
      const storedSession = sessionStorage.getItem('astranex_session')
      if (storedSession) {
        const parsed = JSON.parse(storedSession)
        initialStudent = parsed.student || null
        initialAdminConfig = parsed.adminConfig || null
      }
    } catch (e) {
      sessionStorage.removeItem('astranex_session')
    }

    // Subscribe to Supabase auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, supabaseSession) => {
      if (supabaseSession) {
        setSession(supabaseSession)
        setUser(supabaseSession.user)
        // Restore the app-level profile data from sessionStorage
        // so page refreshes don't lose student/adminConfig state
        try {
          const stored = sessionStorage.getItem('astranex_session')
          if (stored) {
            const parsed = JSON.parse(stored)
            if (parsed.student) setStudent(parsed.student)
            if (parsed.adminConfig) setAdminConfig(parsed.adminConfig)
          }
        } catch (e) {
          // ignore parse errors
        }
      } else {
        setSession(null)
        setUser(null)
        setStudent(null)
        setAdminConfig(null)
      }
      setLoading(false)
    })

    // Apply the synchronously read values before the async listener resolves
    if (initialStudent) setStudent(initialStudent)
    if (initialAdminConfig) setAdminConfig(initialAdminConfig)

    return () => subscription?.unsubscribe()
  }, [])

  // Student self-registration — the DB trigger handle_new_user() auto-inserts into students
  const signUp = async ({ name, studentNumber, email, department, year, password }) => {
    try {
      setLoading(true)

      // Check if student number or email already exists in students table
      const { data: existing } = await supabase
        .from('students')
        .select('id')
        .or(`student_number.eq.${studentNumber},email.eq.${email}`)
        .maybeSingle()

      if (existing) {
        return { error: 'A student with this email or student number is already registered.' }
      }

      // Sign up with Supabase Auth — the DB trigger creates the student row
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
            student_number: studentNumber,
            department,
            year,
            role: 'student',
          },
        },
      })

      if (authError) {
        return { error: authError.message }
      }

      if (authData?.user) {
        // Wait a brief moment for the DB trigger to create the student row
        let studentRow = null
        for (let attempt = 0; attempt < 10; attempt++) {
          const { data } = await supabase
            .from('students')
            .select('*')
            .eq('id', authData.user.id)
            .maybeSingle()
          if (data) {
            studentRow = data
            break
          }
          await new Promise(r => setTimeout(r, 300))
        }

        if (!studentRow) {
          return { error: 'Registration succeeded but sync delayed. Please log in.' }
        }

        // Update the student row with additional fields the trigger didn't set
        if (department || year) {
          await supabase
            .from('students')
            .update({ department, year })
            .eq('id', authData.user.id)
        }

        const sessionData = {
          user: authData.user,
          student: studentRow,
        }

        sessionStorage.setItem('astranex_session', JSON.stringify(sessionData))
        setUser(authData.user)
        setStudent(studentRow)

        return { success: true }
      }

      return { error: 'Registration failed. Please try again.' }
    } catch (err) {
      return { error: err.message || 'An unexpected error occurred during registration.' }
    } finally {
      setLoading(false)
    }
  }

  // Student sign in with student_number + password
  const signIn = async (studentNumber, password) => {
    try {
      setLoading(true)

      // Step 1: Look up the student to find their email
      const { data: lookupData, error: lookupError } = await supabase
        .from('students')
        .select('email, is_active')
        .eq('student_number', studentNumber)
        .single()

      if (lookupError || !lookupData) {
        return { error: 'No registration found with this student number. Please register first.' }
      }

      if (!lookupData.is_active) {
        return { error: 'Your registration is inactive. Please contact the department office.' }
      }

      // Step 2: Authenticate with Supabase Auth
      const { data, error } = await supabase.auth.signInWithPassword({
        email: lookupData.email,
        password,
      })

      if (error) {
        return { error: 'Invalid credentials. If you forgot your password, please contact the department office.' }
      }

      if (data?.user) {
        // Step 3: Re-fetch the full student profile AFTER auth to get fresh has_voted status
        const { data: freshStudent, error: fetchError } = await supabase
          .from('students')
          .select('*')
          .eq('id', data.user.id)
          .single()

        if (fetchError || !freshStudent) {
          return { error: 'Authentication succeeded but profile could not be loaded. Please try again.' }
        }

        const sessionData = {
          user: data.user,
          student: freshStudent,
        }

        sessionStorage.setItem('astranex_session', JSON.stringify(sessionData))
        setSession(data.session)
        setUser(data.user)
        setStudent(freshStudent)

        return { success: true }
      }

      return { error: 'Authentication failed.' }
    } catch (err) {
      return { error: err.message || 'An unexpected error occurred.' }
    } finally {
      setLoading(false)
    }
  }

  // Admin sign in — validates against students table for admin/hod role
  const adminSignIn = async (username, password) => {
    try {
      setLoading(true)

      // Authenticate with Supabase Auth first
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: username,
        password,
      })

      if (authError) {
        return { error: 'Invalid secure passkey. Access denied.' }
      }

      if (authData?.user) {
        // Look up the user in students table to verify admin/hod role
        const { data: adminStudent, error: adminError } = await supabase
          .from('students')
          .select('*')
          .eq('id', authData.user.id)
          .in('role', ['admin', 'hod'])
          .single()

        if (adminError || !adminStudent) {
          // Not an admin — sign out and reject
          await supabase.auth.signOut()
          return { error: 'Invalid command credentials. Unauthorized access attempt logged.' }
        }

        // Also fetch admin_config for admin_name
        const { data: adminRow } = await supabase
          .from('admin_config')
          .select('*')
          .limit(1)
          .maybeSingle()

        const sessionData = {
          user: authData.user,
          adminConfig: {
            id: adminStudent.id,
            admin_name: adminRow?.admin_name || adminStudent.name,
            username: adminStudent.student_number || authData.user.email,
            email: adminStudent.email,
          },
        }

        sessionStorage.setItem('astranex_session', JSON.stringify(sessionData))
        setSession(authData.session)
        setUser(authData.user)
        setAdminConfig(sessionData.adminConfig)
        setStudent(null)

        return { success: true }
      }

      return { error: 'Authentication failed.' }
    } catch (err) {
      return { error: err.message || 'An unexpected error occurred.' }
    } finally {
      setLoading(false)
    }
  }

  const signOut = async () => {
    sessionStorage.removeItem('astranex_session')
    localStorage.removeItem('astranex_vote')
    setSession(null)
    setUser(null)
    setStudent(null)
    setAdminConfig(null)

    try {
      await supabase.auth.signOut()
    } catch (e) {
      // Proceed with local cleanup even if remote fails
    }
  }

  const destroySession = () => {
    sessionStorage.removeItem('astranex_session')
    localStorage.removeItem('astranex_vote')
    setSession(null)
    setUser(null)
    setStudent(null)
    setAdminConfig(null)
  }

  // Called immediately after a successful vote submission to mark has_voted locally
  const updateStudentHasVoted = () => {
    setStudent(prev => {
      if (!prev) return prev
      const updated = { ...prev, has_voted: true }
      // Also update sessionStorage so it persists if needed
      try {
        const stored = sessionStorage.getItem('astranex_session')
        if (stored) {
          const parsed = JSON.parse(stored)
          parsed.student = updated
          sessionStorage.setItem('astranex_session', JSON.stringify(parsed))
        }
      } catch (e) { /* ignore */ }
      return updated
    })
  }

  const isAdmin = () => {
    return !!adminConfig
  }

  const isEligibleVoter = () => {
    return student?.is_active && !student?.has_voted
  }

  return (
    <AuthContext.Provider value={{
      user,
      student,
      adminConfig,
      session,
      loading,
      signIn,
      signUp,
      adminSignIn,
      signOut,
      destroySession,
      updateStudentHasVoted,
      isAdmin,
      isEligibleVoter,
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export default AuthContext