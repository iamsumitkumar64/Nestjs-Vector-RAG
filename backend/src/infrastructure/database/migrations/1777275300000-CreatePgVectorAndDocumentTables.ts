import { MigrationInterface, QueryRunner, Table, TableIndex, TableForeignKey, } from 'typeorm';

export class CreatePgVectorAndDocumentTables1777275300000 implements MigrationInterface {
    name = 'CreatePgVectorAndDocumentTables1777275300000';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS vector;`);

        await queryRunner.createTable(
            new Table({
                name: 'documents',
                columns: [
                    { name: 'id', type: 'uuid', isPrimary: true, isGenerated: true, generationStrategy: 'uuid', default: 'gen_random_uuid()', },
                    { name: 'fileName', type: 'varchar', length: '255', isNullable: false, },
                    { name: 'fileUrl', type: 'text', isNullable: false, },
                    { name: 'status', type: 'varchar', length: '50', default: `'PENDING'`, isNullable: false, },
                    { name: 'totalChunks', type: 'int', default: 0, isNullable: false, },
                    { name: 'errorMessage', type: 'text', isNullable: true, },
                    { name: 'createdAt', type: 'timestamp', default: 'now()', isNullable: false, },
                    { name: 'updatedAt', type: 'timestamp', default: 'now()', isNullable: false, },
                ],
            }),
            true,
        );

        await queryRunner.createTable(
            new Table({
                name: 'document_chunks',
                columns: [
                    { name: 'id', type: 'uuid', isPrimary: true, isGenerated: true, generationStrategy: 'uuid', default: 'gen_random_uuid()', },
                    { name: 'documentId', type: 'uuid', isNullable: false, },
                    { name: 'chunkIndex', type: 'int', isNullable: false, },
                    { name: 'content', type: 'text', isNullable: false, },
                    { name: 'embedding', type: 'vector', length: '768', isNullable: true, },
                    { name: 'createdAt', type: 'timestamp', default: 'now()', isNullable: false, },
                ],
                foreignKeys: [
                    new TableForeignKey({
                        name: 'FK_document_chunks_document',
                        columnNames: ['documentId'],
                        referencedTableName: 'documents',
                        referencedColumnNames: ['id'],
                        onDelete: 'CASCADE',
                    }),
                ],
                indices: [
                    new TableIndex({
                        name: 'IDX_document_chunks_documentId',
                        columnNames: ['documentId'],
                    }),
                ],
            }),
            true,
        );

        // Create HNSW index for cosine distance similarity
        await queryRunner.query(
            `CREATE INDEX IF NOT EXISTS "IDX_document_chunks_embedding_hnsw" ON "document_chunks" USING hnsw ("embedding" vector_cosine_ops);`,
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX IF EXISTS "IDX_document_chunks_embedding_hnsw";`);
        await queryRunner.dropTable('document_chunks', true, true, true);
        await queryRunner.dropTable('documents', true, true, true);
    }
}
