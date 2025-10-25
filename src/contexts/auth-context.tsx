import { Session } from "next-auth"
import { useSession } from "next-auth/react"
import { createContext, useContext } from "react"

interface AuthContextType {
  session: Session | null
  loading: boolean
  status: "authenticated" | "loading" | "unauthenticated"
}

const AuthContext = createContext<AuthContextType>({
  session: null,
  loading: true,
  status: "loading"
})

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession()
  const loading = status === "loading"

  return (
    <AuthContext.Provider value={{ session, loading, status }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}