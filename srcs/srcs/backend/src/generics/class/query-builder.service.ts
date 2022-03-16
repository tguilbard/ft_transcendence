import { Repository, SelectQueryBuilder } from "typeorm";


export class QueryBuilderService
{
	Create(name: string, repository : Repository<any>, columnToAdd?)
	{
		const repo = repository.createQueryBuilder(name);

		if (columnToAdd)
		{
			this.Join(repo, name, columnToAdd)
		}
		return repo;
	}

	Join(sqb: SelectQueryBuilder<any>, name: string,  columnToAdd)
	{
		if (columnToAdd)
		{
			if (columnToAdd.relation)
				{
					columnToAdd.relation.forEach(element => {
						sqb.leftJoinAndSelect(name + '.' + element, element)
					});
				}

			if (columnToAdd.select)
			{
				columnToAdd.select.forEach((element, index) => {
					sqb.addSelect(name + '.' + element)
				});
			}
		}
		return sqb;
	}

	AutoWhere(sqb: SelectQueryBuilder<any>, name: string, id: number | string)
	{
		if (typeof id === "number")
		{
			sqb.where(`${name}.id = :id`, {id: id})
		}
		else
		{
			sqb.where(`${name}.name = :name`, {name: id})
		}
		return sqb;
	}
}