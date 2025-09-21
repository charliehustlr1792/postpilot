/* import NextAuth from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import bcrypt from 'bcryptjs'
import { PrismaClient } from '@prisma/client'

const prisma=new PrismaClient();

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Email and password are required.')
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        })

        if (!user) {
          throw new Error('Invalid email or password.')
        }

        const isPasswordValid = await bcrypt.compare(credentials.password, user.password)
        if (!isPasswordValid) {
          throw new Error('Invalid email or password.')
        }

        return { id: user.id, email: user.email, firstName: user.firstName, lastName: user.lastName, phone: user.phone }
      },
    }),
  ],
  session: {
    strategy: 'jwt', // Using JWT for session management
  },
  pages: {
    signIn: '/auth/signin', // Customize your sign-in page if necessary
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.email = user.email
        token.firstName = user.firstName
        token.lastName = user.lastName
        token.phone = user.phone
      }
      return token
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id
        session.user.email = token.email
        session.user.firstName = token.firstName
        session.user.lastName = token.lastName
        session.user.phone = token.phone
      }
      return session
    },
  },
  secret: process.env.JWT_SECRET || 'your_secret_key', // Optional, specify a JWT secret
}

const handler = NextAuth(authOptions)
export { handler as GET, handler as POST } */