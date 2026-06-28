import { defaultBuildLogger, Template, waitForURL } from "e2b";
import "dotenv/config";

const main = async() => {
    const template = Template()
    .fromBunImage("1.3-slim")
    .setWorkdir("/home/user/react-shadcn-bun")
    .runCmd("bun init --react=shadcn")
    .setStartCmd("bun dev",waitForURL("http://localhost:3000"));

    return await Template.build(template, 'react-shadcn-bun', {
        onBuildLogs: defaultBuildLogger(),
    })
}

main()
  .then((result) => console.log(result))
  .catch((error) => console.error("Error:", error));