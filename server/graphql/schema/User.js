import jwt from 'jsonwebtoken'
import bcrypt from 'bcrypt'

export const typeDef = `
  extend type Query {
    user(email: String!): User!
  }

  extend type Mutation {
    signin(email:String!, password:String!):AuthPayload!
    signup(email:String!, password:String!, name:String!):AuthPayload!
  }

  type User {
    role: String!
    name: String!
    email: String!
    posts: [Post] # the list of Posts by this author
  } 
  
  type AuthPayload {
    accessToken: String!
    user: User
  }
`
export const resolvers = {
  Query: {
    user: async (root, args, { mongo }) => {
      const Users = mongo.collection('users')
      const existingUser = await Users.findOne({ email: args.email })
      return existingUser
    }
  },
  Mutation: {
    signin: async (root, { email, password }, { mongo, secrets }) => {
      const Users = mongo.collection('users')
      const user = await Users.findOne({ email })
      if (!user) {
        throw new Error('Email not found')
      }
      const Auths = mongo.collection('auths')
      const auth = await Auths.findOne({ email })

      const validPassword = await bcrypt.compare(password, auth.password)
      if (!validPassword) {
        throw new Error('Password is incorrect')
      }
      const accessToken = jwt.sign({ _id: user._id }, secrets.JWT_SECRET)
      const authPayload = { accessToken }
      authPayload.user = user
      return authPayload
    },
    signup: async (root, { email, password, name }, { mongo, secrets }) => {
      const Users = mongo.collection('users')
      const existingUser = await Users.findOne({ email })
      if (existingUser) {
        throw new Error('Email already used')
      }
      await Users.insertOne({ role: 'user', email, name })
      const Auths = mongo.collection('auths')
      const hash = await bcrypt.hash(password, 10)
      await Auths.insertOne({ email, password: hash })
      const user = await Users.findOne({ email })
      const accessToken = jwt.sign({ _id: user._id }, secrets.JWT_SECRET)
      const authPayload = { accessToken }
      authPayload.user = user
      return authPayload
    }
  },
  User: {
    posts: async (user, args, { mongo }) => {
      const posts = await mongo
        .collection('posts')
        .find({ authorId: user.email })
        .toArray()
      return posts
    }
  }
}
// type User {
//   admin: Boolean
//   created: Dat!
//   updated: Date
//   fullName: String
//   groups: String
//   firstName: String
//   lastName: String
//   lastLoginDate: Date
//   isCurrent: Boolean
//   photoUrl: String
//   preferredLocale: String
//   username: String
//   email: String!
//   accessToken: String
//   posts: [Post] # the list of Posts by this author
//     }
