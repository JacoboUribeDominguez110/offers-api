export interface IPermission {
  [key: string]: boolean
}

export interface IUser {
  sub: string,
  email: string,
  permissions: IPermission
}