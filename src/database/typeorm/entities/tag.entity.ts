// src/tags/tag.entity.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToMany,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { BlogEntity } from './blog.entity';

@Entity('tags')
export class TagEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string; // tương đương _id ObjectId

  @Column({ length: 50, unique: true })
  name: string; // tag_name

  @Column({ default: 0 })
  count: number; // tag_count

  @ManyToMany(() => BlogEntity, (blog) => blog.tags)
  blogs: BlogEntity[];

  @CreateDateColumn({ type: 'timestamp' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updated_at: Date;
}
