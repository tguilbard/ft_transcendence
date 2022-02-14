import { Repository } from "typeorm";


export class QueryBuilderService
{
	Create(name: string, repository : Repository<any>, columnToAdd?)
	{
		const repo = repository.createQueryBuilder(name);

		if (columnToAdd)
		{
			if (columnToAdd.relation)
			{
				columnToAdd.relation.forEach(element => {
					repo.leftJoinAndSelect(name + '.' + element, element)
				});
			}

			if (columnToAdd.select)
			{
				columnToAdd.select.forEach((element, index) => {
					repo.addSelect(name + '.' + element)
				});
			}
		}
		return repo;
	}
}