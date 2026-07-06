import "dotenv/config";
import { defaultBuildLogger, Template } from "e2b";

const main = async() => {
    const template = Template()
    .fromNodeImage("24-slim")
        .setUser("root")
        .runCmd("apt-get update && apt-get install -y --no-install-recommends libcap2-bin curl && rm -rf /var/lib/apt/lists/*")
        .runCmd(
            "curl -L https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64 -o /usr/local/bin/cloudflared && chmod +x /usr/local/bin/cloudflared"
        )
        .runCmd("setcap 'cap_net_bind_service=+ep' $(readlink -f $(which node))")
        .setUser("user")
        .setWorkdir("/home/user")
        .runCmd("npx -y create-expo-app app --template default@sdk-54 --yes")
        .setWorkdir("/home/user/app");

    return await Template.build(template,'node-react-native-expo',{
        onBuildLogs: defaultBuildLogger(),
    });
}

main()
  .then((result) => console.log(result))
  .catch((error) => console.error("Error:", error));