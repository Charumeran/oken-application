'use client'

import { useRouter } from 'next/navigation'

export default function Header() {
  const router = useRouter()

  const handleLogout = async () => {
    const response = await fetch('/api/auth/logout', { method: 'POST' })
    
    if (response.ok) {
      router.push('/auth/login')
      router.refresh()
    }
  }

  return (
    <header className="bg-white shadow">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-6">
          <h1 className="text-xl font-bold text-gray-900">資材発注管理システム</h1>
          <button
            onClick={handleLogout}
            className="text-sm text-gray-700 hover:text-gray-900 font-medium"
          >
            ログアウト
          </button>
        </div>
      </div>
    </header>
  )
}