import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    ManyToOne,
    JoinColumn,
    Index,
} from 'typeorm';
import type { Document } from './document.entity.js';

@Entity('document_chunks')
export class DocumentChunk {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ type: 'uuid' })
    @Index()
    documentId: string;

    @ManyToOne('Document', 'chunks', { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'documentId' })
    document: Document;

    @Column({ type: 'int' })
    chunkIndex: number;

    @Column({ type: 'text' })
    content: string;

    @Column({ type: 'text', nullable: true })
    embedding: string;

    @CreateDateColumn({ type: 'timestamp' })
    createdAt: Date;
}
