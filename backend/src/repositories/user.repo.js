import { User } from '@/models/index.js'

export const create = async (data) => {
  return await User.create(data)
}

export const findById = async (id) => {
  return await User.findByPk(id)
}

export const findByEmail = async (email) => {
  return await User.findOne({ where: { email } })
}

export const findByPhone = async (phone_number) => {
  return await User.findOne({ where: { phone_number } })
}

export const updateById = async (id, data) => {
  return await User.update(data, { where: { id } })
}

export const deleteById = async (id) => {
  return await User.destroy({ where: { id } })
}

export const findByIdWithoutPassword = async (id) => {
  return await User.findByPk(id, {
    attributes: { exclude: ['password'] }
  })
}
