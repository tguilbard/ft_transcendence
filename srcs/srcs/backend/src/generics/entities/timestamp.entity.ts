import { Entity, CreateDateColumn, UpdateDateColumn, DeleteDateColumn } from "typeorm";

export class TimeStampEntity {

    @CreateDateColumn({
		select: false
	})
    createdAt: Date

    @UpdateDateColumn({
		select: false
	})
    updatedAt : Date

    @DeleteDateColumn({
		select: true
	})
    deletedAt : Date
}