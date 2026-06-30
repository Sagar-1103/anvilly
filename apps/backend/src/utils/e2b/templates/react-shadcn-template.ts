import { defaultBuildLogger, Template, waitForURL } from "e2b";
import "dotenv/config";

const main = async() => {
    const template = Template()
    .fromBunImage("1.3-slim")
    .setWorkdir("/home/user/app")
    .runCmd("bun init --react=shadcn")
    .runCmd("bun add pm2")
    .runCmd("bunx pm2 ping")
    .setStartCmd(`bunx pm2 start "bun run start" --name app --interpreter none`,waitForURL("http://localhost:3000"));

    return await Template.build(template, 'bun-react-shadcn', {
        onBuildLogs: defaultBuildLogger(),
    })
}

main()
  .then((result) => console.log(result))
  .catch((error) => console.error("Error:", error));