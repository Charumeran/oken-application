'use client'

import { useRouter, usePathname } from 'next/navigation'
import Image from 'next/image'

export default function Header() {
  const router = useRouter()
  const pathname = usePathname()

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
          <Image src="/icons/icon.jpeg" alt="Logo" width={240} height={240} />
          {pathname !== '/' && (
            <button
              onClick={handleLogout}
              className="text-sm text-gray-700 hover:text-gray-900 font-medium"
            >
              ログアウト
            </button>
          )}
        </div>
      </div>
    </header>
  )
}