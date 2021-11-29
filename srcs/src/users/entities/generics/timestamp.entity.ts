import { Entity, CreateDateColumn, UpdateDateColumn, DeleteDateColumn } from "typeorm";

export class TimeStampEntities {

    @CreateDateColumn()
    CreatedAt: Date

    @UpdateDateColumn()
    UpdatedAt : Date

    @DeleteDateColumn()
    DeletedAt : Date
}