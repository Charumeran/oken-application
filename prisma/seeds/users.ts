import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcrypt'

export async function seedUsers(prisma: PrismaClient) {
  console.log('👥 ユーザーデータを投入中...')

  const users = [
    { username: 'oken', password: 'Oken1234', companyName: '櫻建' },
    { username: 'yano', password: 'Yano1234', companyName: '矢野工業' },
    { username: 'tensho', password: 'Tensho1234', companyName: '天昇興業' },
    { username: 'naruki', password: 'Naruki1234', companyName: '成起' },
    { username: 'kamino', password: 'Kamino1234', companyName: '神ノ興業' },
    { username: 'hokuto', password: 'Hokuto1234', companyName: '北都' },
    { username: 'shindo', password: 'Shindo1234', companyName: '新導技建' },
    { username: 'token', password: 'Token1234', companyName: '桃建' },
    { username: 'other', password: 'Other1234', companyName: 'その他1' },
    { username: 'others', password: 'Others1234', companyName: 'その他2' },
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

    console.log(`  ✅ ${user.companyName} (${user.username}) を作成しました`)
  }

  console.log('✅ ユーザーデータの投入完了')
}