# DERK (Deno React KV)

fast, simple, you already know

## getting started

```bash
deno run -A jsr:@nurs/derk
```

actually this is just boilerplate to make fullstack web app, with stack you already know it like `react` to build frontend and deno for `backend`.

you didnt need to learn again because everything in here not new.

i create this framework with in mind for production in cloud, 

for frontend you can deploy that in cloudflare pages, just use this command, and cloudflare will serve your site to cdn
```bash
# in folder frontend
deno task build
```

for backend just use this, and your site will serve in deno deploy
```bash
# in folder backend
deployctl deploy
```

need database?, deno already have kv. so actually this is enough, but if you need more, i had include docker compose so you can use it 
when you need `postgresql`, `minio`, or `mailpit`
