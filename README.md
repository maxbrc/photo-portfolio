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
# Spelunking
## Application data
Inside the mounted `data` folder you will find the following:
- `config.json`
- `photos`
- `secrets`
### config.json
Arguably deserving better naming, this file contains the website/homepage configuration data. This would simply make no sense to store in the database, so for convenience, it's stored in this JSON file.
All of this is editable through the web interface, so don't bother with manual editing.
### photos
This is where the actual image files lie. If you go inside this directory, you will see two folders: `originals` and `derivatives`.
The high-quality original WebP conversions lie in the `originals` folder, while the cached and resized versions sit in `derivatives`. The derivative image filename is composed like this: `width_height_filename.webp`.
### secrets
This directory simply contains a single file with binary data. This directory has tighter permissions since it contains exactly 32 bytes that are used to seed the Ed25519 private key, which is used to sign the JWT's (authorization tokens).
## Development and build guide
Clone the repository. Then copy the `.env.example` to `.env`.
### The right way
You need both the Go and NodeJS runtime installed. Don't forget a running MariaDB/MySQL database and to edit the .env accordingly. In separate terminal windows, you want to open `/backend` and `/frontend` respectively.
For the backend, run `go run ./cmd/main.go`. You will need to Ctrl+C and re-run for every change on the backend. For the frontend, run `npm run dev`. This watches the frontend client, but not the frontend server (which will rarely change anyway).
#### Building
For the backend, run `go build -o server ./cmd/main.go`. The only folder and file you have to keep is config/config.default.json. For the frontend, run `npm run build`. This will give you the final files in the `server/dist` and `client/dist` directories.
Along with this, we don't bundle Node modules, so you will need to keep the two `dist` folders, and the `package.json` and `package-lock.json`. On the target machine, run `npm ci --omit=dev` to install the production dependencies.
## Docker
I don't use this, but you could develop using Docker containers. Use the file `docker/docker-compose.dev.yml`. To build and run, run `docker compose up -d --build`