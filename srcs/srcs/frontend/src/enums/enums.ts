export enum AchievementType {
	novice = 1,
	apprentice = 1 << 1,
	expert = 1 << 2,
	master = 1 << 3,
	conqueror = 1 << 4,
	loser = 1 << 5,
	locker = 1 << 6,
	fashion = 1 << 7,
	galaxie = 1 << 8,
	follower = 1 << 9,
	notAlone = 1 << 10,
	socialist = 1 << 11,
	perfectionnist = 1 << 12,
	hacker = 1 << 13,
	mask = 0b1111111111111
}

export enum MemberType {
	owner = 1,
	admin = 1 << 1,
	mute = 1 << 2,
	ban = 1 << 3
}