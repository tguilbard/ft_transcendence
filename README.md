# ft_transcendence
<img alt="GitHub Repo stars" src="https://img.shields.io/github/stars/tguilbard/ft_transcendence?style=social">

## About The Project

[Ft_transcendence](https://cdn.intra.42.fr/pdf/pdf/47609/fr.subject.pdf) is the last project of 42Paris. \
It consist of a website where every 42 students can connect it to play pong and chat.

#PUT HERE IMAGE
<p align="center">
  <img src="https://cdn.intra.42.fr/pdf/pdf/47609/fr.subject.pdf" />
</p>

### Built With
  - [Vue.js](https://vuejs.org/)
  - [Nest.js](https://nestjs.com/)
  - [Postgresql](https://www.postgresql.org/)

## Getting Started

### Prerequisites
  - [docker](https://docs.docker.com/get-docker/)
  - [docker-compose](https://docs.docker.com/compose/install/)
### Installation
First install project :
```
git clone git@github.com:tguilbard/ft_transcendence.git ft_transcendence
cd ft_transcendence
```
open .env file and assign value to those variables :
```
DATABASE_USER
DATABASE_PASSWORD

PGADMIN_DEFAULT_EMAIL
PGADMIN_DEFAULT_PASSWORD

API_42_ID
API_42_SECRET
API_GITHUB_ID
API_GITHUB_SECRET
```
then run :
```
docker compose up --build
```

## Some information about project
