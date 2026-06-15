# photo-portfolio
A modern, fast and customizable photography portfolio. It was developed for Richard Freier and is live under richard-freier.de.
# How to deploy it
## Install Docker
First, install Docker using the official script if necessary (requires root privileges):
```sh
curl -sSL https://get.docker.com | sh
```
Of course, never pipe to bash. I recommend you read every script before you execute it.
## Prepare the environment
In the root of the directory, create a `.env` configuration file.
You can either pull the .env.example file from this repository or copy it:
```dotenv
DB_USER=portfolio
DB_PASSWORD=changeme
DB_NAME=portfolio
DB_ROOT_PASSWORD=changeme

# Optional overrides (defaults shown)
# BIND_ADDRESS=:3000
# NODE_URL=http://localhost:3010
# DB_HOST=localhost
# DB_PORT=3306
```
Make sure it is named exactly `.env` and sits at the root directory.
Don't touch the optional overrides if you don't know what you are doing.

Next, you want to create a `docker-compose.yml` and paste the following docker compose project:
```yaml
services:
  db:
    image: mariadb:11
    restart: unless-stopped
    env_file: .env
    environment:
      MYSQL_ROOT_PASSWORD: ${DB_ROOT_PASSWORD}
      MYSQL_DATABASE: ${DB_NAME}
      MYSQL_USER: ${DB_USER}
      MYSQL_PASSWORD: ${DB_PASSWORD}
    volumes:
      - db_data:/var/lib/mysql
    networks:
      - app

  backend:
    image: ghcr.io/maxbrc/photo-portfolio/backend:latest
    restart: unless-stopped
    env_file: .env
    environment:
      NODE_URL: http://frontend:3010
      DB_HOST: db
    volumes:
      - ./data:/app/data
    depends_on:
      - db
    ports:
      - "3000:3000"
    networks:
      - app

  frontend:
    image: ghcr.io/maxbrc/photo-portfolio/frontend:latest
    restart: unless-stopped
    depends_on:
      - backend
    networks:
      - app

volumes:
  db_data:

networks:
  app:
```
## Starting the app
You should now have a `.env` and `docker-compose.yml` file sitting in the root of the folder.
Now just start the project:
```
docker compose up -d
```