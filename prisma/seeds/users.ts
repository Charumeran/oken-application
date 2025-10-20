import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcrypt'

export async function seedUsers(prisma: PrismaClient) {
  console.log('👥 ユーザーデータを投入中...')

  const users = [
    { username: 'tech', password: 'Tech1234', companyName: '建設テック' }
  ]

  for (const user of users) {
    const hashedPassword = await bcrypt.hash(user.password, 10)

    await prisma.user.upsert({
      where: { username: user.username },
      update: {},
      create: {
        username: user.username,
        password: hashedPassword,
        companyName: user.companyName,
        isActive: true
      }
    })
  }

  console.log('✅ ユーザーデータの投入完了')
}