import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    OneToMany,
} from 'typeorm';
import { DocumentStatus } from '../enum/document-status.enum.js';
import type { DocumentChunk } from './document-chunk.entity.js';

@Entity('documents')
export class Document {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ type: 'varchar', length: 255 })
    fileName: string;

    @Column({ type: 'text' })
    fileUrl: string;

    @Column({
        type: 'enum',
        enum: DocumentStatus,
        default: DocumentStatus.PENDING,
    })
    status: DocumentStatus;

    @Column({ type: 'int', default: 0 })
    totalChunks: number;

    @Column({ type: 'text', nullable: true })
    errorMessage?: string | null;

    @OneToMany('DocumentChunk', 'document', { cascade: true })
    chunks: DocumentChunk[];

    @CreateDateColumn({ type: 'timestamp' })
    createdAt: Date;

    @UpdateDateColumn({ type: 'timestamp' })
    updatedAt: Date;
}
