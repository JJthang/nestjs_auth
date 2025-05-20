import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  ManyToMany,
  JoinTable,
} from 'typeorm';
import { UserEntity } from './user.entity';
import { TagEntity } from './tag.entity';
import { CommentEntity } from './comment.entity';

@Entity('blogs')
export class BlogEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 200 })
  blog_title: string;

  @Column('text')
  blog_content: string;

  @OneToMany(() => CommentEntity, (comment) => comment.blog, { cascade: true })
  comments: Comment[];

  // Tác giả
  @ManyToOne(() => UserEntity, (user) => user.blogs, { eager: true })
  author: UserEntity;

  @ManyToMany(() => TagEntity, (tag) => tag.blogs, { eager: true })
  @JoinTable({
    name: 'blog_tags',
    joinColumn: { name: 'blog_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'tag_id', referencedColumnName: 'id' },
  })
  tags: TagEntity[];

  @Column({ unique: true })
  blog_slug: string;

  @Column({ nullable: true })
  blog_image: string;

  @Column({ default: 0 })
  blog_views: number;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
