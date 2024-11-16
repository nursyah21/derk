import chalk from "chalk";
const log = console.log;
const boldInfo = chalk.bold.blue;
const info = chalk.blue;
const danger = chalk.red;
const success = chalk.green;

const denojson = `
{
  "tasks": {
    "scaffold": "deno run -A --watch mod.ts",
    "frontend:install": "cd frontend && deno install",
    "frontend:dev": "cd frontend && deno run dev",
    "backend:dev": "cd backend && deno run dev",
    "dev": "concurrently 'deno run frontend:dev' 'deno run backend:dev'"
  },
  "imports": {
    "@std/assert": "jsr:@std/assert@1",
    "chalk": "npm:chalk@^5.3.0",
    "concurrently": "npm:concurrently@^9.0.1"
  }
}
`;

async function main() {
  log(boldInfo("create new project"));
  const project = prompt(info("project name:"), "");

  if (!project) {
    return log(danger("please write project folder"));
  }

  try {
    if (project != ".") Deno.mkdirSync(project);
  } catch (error) {
    if (error instanceof Deno.errors.AlreadyExists) {
      return log(danger(project, "already exist"));
    }
  }

  log(success("clone backend..."));
  const { success: successClone } = await new Deno.Command("git", {
    args: [
      "clone",
      "--depth",
      "1",
      "https://github.com/nursyah21/deno-slim/",
      `${project}/backend`,
    ],
  }).output();
  if (!successClone) {
    Deno.removeSync(`./${project}`, { recursive: true });
    return log(danger("fail to clone repository"));
  }

  log(success("clone frontend..."));
  await new Deno.Command("git", {
    args: [
      "clone",
      "--depth",
      "1",
      "https://github.com/nursyah21/boilerplate",
      `${project}/frontend`,
    ],
  }).output();

  try {
    Deno.removeSync(`./${project}/backend/.git`, { recursive: true });
    Deno.removeSync(`./${project}/frontend/.git`, { recursive: true });
  } catch (_error) {
    return log(danger("remove .git fail"));
  }

  try {
    Deno.copyFileSync(
      `./${project}/backend/.env.example`,
      `./${project}/backend/.env`
    );
  } catch (_error) {
    return log(danger("copy .env.example fail"));
  }

  const withdocker = confirm("docker compose?");
  if (withdocker) {
    let services = "services:";
    let volumes = "volumes:";

    if (confirm("postgresql")) {
      services += `
  postgresql:
    image: docker.io/bitnami/postgresql:16
    ports:
      - '5432:5432'
    volumes:
      - 'postgresql_data:/bitnami/postgresql'
    environment:
      - 'ALLOW_EMPTY_PASSWORD=yes'
  `;
      volumes += `
  postgresql_data:
  `;
    }

    if (confirm("mongodb")) {
      services += `
  mongodb:
    image: mongo:latest
    container_name: my-mongodb
    volumes:
      - mongodb_data:/data/db
    ports:
      - 27017:27017
  `;
      volumes += `
  mongodb_data:
  `;
    }

    if (confirm("minio")) {
      services += `
  minio:
    image: 'minio/minio:latest'
    ports:
      - 9000:9000
      - 8900:8900
    command: 'minio server /data/minio'
    environment:
      MINIO_ROOT_USER: minio
      MINIO_ROOT_PASSWORD: password
      MINIO_DEFAULT_BUCKETS: test1
    volumes:
      - 'minio_data:/data/minio'
  `;
      volumes += `
  minio_data:
  `;
    }

    if (confirm("mailpit")) {
      services += `
  mailpit:
    image: 'axllent/mailpit:latest'
    ports:
      - 1025:1025
      - 8025:8025
  `;
    }

    Deno.writeTextFileSync(
      `./${project}/docker-compose.yml`,
      `${services}\n${volumes}`
    );
  }

  Deno.writeTextFileSync(`./${project}/deno.json`, denojson);

  log(success(`create project success`));
  log(boldInfo("\nmove to project folder"));
  log(`cd ${project}`);

  log(boldInfo("\ninstall frontend"));
  log("deno task frontend:install");
  log(boldInfo("\nstart development"));
  log("deno task dev");
}
main();
