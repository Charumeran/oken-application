import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcrypt'

export async function seedUsers(prisma: PrismaClient) {
  console.log('👥 ユーザーデータを投入中...')
  
  // 櫻建のユーザーのみ作成
  const hashedPassword = await bcrypt.hash('Oken1234', 10)
  
  const user = await prisma.user.upsert({
    where: { username: 'oken' },
    update: {
      password: hashedPassword,
      companyName: '櫻建',
      isActive: true
    },
    create: {
      username: 'oken',
      password: hashedPassword,
      companyName: '櫻建',
      isActive: true
    }
  })
  
  console.log(`  ✅ ${user.companyName} (${user.username}) を作成しました`)
  console.log('✅ ユーザーデータの投入完了')
}