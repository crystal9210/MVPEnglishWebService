import { UserSchema, User } from "@/schemas/userSchemas";

export class UserEntity implements User {
  uid: string;
  email: string;
  name: string;
  image: string;
  createdAt: string | Date;
  updatedAt: string | Date;

  constructor(data: User) {
    const parseResult = UserSchema.safeParse(data);
    if (!parseResult.success) {
      throw new Error("Invalid User data");
    }
    const user = parseResult.data;
    this.uid = user.uid;
    this.email = user.email;
    this.name = user.name;
    this.image = user.image;
    this.createdAt = user.createdAt;
    this.updatedAt = user.updatedAt;
  }

  // 必要に応じてメソッドを追加
  updateProfile(updatedData: Partial<Omit<User, 'uid' | 'createdAt'>>) {
    // 更新処理とZodスキーマによる検証
    const newData = { ...this, ...updatedData };
    const parseResult = UserSchema.safeParse(newData);
    if (!parseResult.success) {
      throw new Error("Invalid User update data");
    }
    Object.assign(this, parseResult.data);
  }
}
