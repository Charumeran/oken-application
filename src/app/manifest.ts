import { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: '資材発注管理システム - 株式会社櫻建',
    short_name: '資材発注管理',
    description: '建設業向け資材発注管理アプリケーション',
    start_url: '/dashboard',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#475569',
    icons: [
      {
        src: '/icons/icon.jpeg',
        sizes: '395x395',
        type: 'image/jpeg',
        purpose: 'any',
      },
      {
        src: '/icons/icon.jpeg',
        sizes: '395x395',
        type: 'image/jpeg',
        purpose: 'maskable',
      },
    ],
  }
}
