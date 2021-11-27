# ft_transcendence

## DATABASE

### RUN
docker run -ti --rm -p 5432:5432 --name postgres_container -e POSTGRES_PASSWORD=postgres -e POSTGRES_USER=postgres -e POSTGRES_DB=test -d postgres

### STOP AND DELETE
docker stop postgres_container
