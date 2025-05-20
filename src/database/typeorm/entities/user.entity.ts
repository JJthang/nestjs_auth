import { Role } from 'src/common/enums/role.enum';
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  BeforeInsert,
  BeforeUpdate,
  OneToMany,
} from 'typeorm';
import { BlogEntity } from './blog.entity';
import { CommentEntity } from './comment.entity';

@Entity()
export class UserEntity {
  @PrimaryGeneratedColumn({
    type: 'int',
  })
  id: number;

  @Column({ type: 'varchar' })
  firstName: string;

  @Column({ type: 'varchar' })
  lastName: string;

  @Column({ type: 'varchar', unique: true })
  email: string;

  @Column({ type: 'varchar' })
  password: string;

  @Column({ type: 'varchar', nullable: true })
  avatar: string;

  @Column({ type: 'varchar', nullable: true })
  created_at?: Date;

  @Column({ type: 'varchar', nullable: true })
  updated_at?: Date;

  @Column({
    type: 'enum',
    enum: Role,
    default: Role.USER,
  })
  role: Role;

  @Column({
    type: 'varchar',
    nullable: true,
  })
  hasTokenRefresh: string;

  @OneToMany(() => BlogEntity, (blog) => blog.author)
  blogs: BlogEntity[];

  // Quan hệ với comments
  @OneToMany(() => CommentEntity, (comment) => comment.author)
  comments: CommentEntity[];

  // // Quan hệ với blogs đã xem
  // @ManyToMany(() => Blog, (blog) => blog.viewedBy)
  // viewedBlogs: Blog[];

  @Column({ default: false })
  isActiveEmail: boolean;

  @BeforeInsert()
  beforeInsertActions() {
    this.created_at = new Date();
    this.updated_at = new Date();
  }

  @BeforeUpdate()
  beforeUpdateActions() {
    this.updated_at = new Date();
  }
}
