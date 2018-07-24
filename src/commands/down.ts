
import chalk from "chalk"
import { CommandModule, Argv } from "yargs"
import { create as createConnection } from "async-db-adapter"
import { loadConfigFile } from "../helpers/config"
import { Migrator } from "../migrator/migrator"

const command = "down <id>"
const describe = "Rollback the specific migration."

export class DownCommand implements CommandModule {

  public command = command
  public describe = chalk.gray(describe)

  public builder(options: Argv): Argv {
    return options
      .usage(`${chalk.bold("Usage: ")}$0 ${chalk.bold(command)}

${describe}`)
      .positional("id", {
        describe: chalk.gray("specific migration id, like 180101_000000"),
      })
      .example(chalk.cyan("$ sqlv down 180101_000000"), "")
  }

  public async handler(options: any): Promise<void> {
    const config = loadConfigFile(options.config)
    const defaultConnection = createConnection(config as any)
    const migrator = new Migrator({
      default: defaultConnection,
    }, config)
    try {
      process.stdout.write(`down ${options.id} ... `)
      await migrator.down(options.id)
      process.stdout.write(`\rdown ${options.id} ... ${chalk.green("OK")}\n`)
    } catch (e) {
      process.stdout.write(`\rdown ${options.id} ... ${chalk.red("FAIL")}\n`)
      console.error(e.message)
      defaultConnection.close()
      process.exit(1)
    }
    defaultConnection.close()
  }
}
