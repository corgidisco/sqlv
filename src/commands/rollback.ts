
import chalk from "chalk"
import { CommandModule, Argv } from "yargs"
import { create as createConnection } from "async-db-adapter"
import { loadConfigFile } from "../helpers/config"
import { Migrator } from "../migrator/migrator"

const command = "rollback"
const describe = "Rollback the last migration."

export class RollbackCommand implements CommandModule {

  public command = command
  public describe = chalk.gray(describe)

  public builder(options: Argv): Argv {
    return options
      .usage(`${chalk.bold("Usage: ")}$0 ${chalk.bold(command)}

${describe}`)
      .example(chalk.cyan("$ sqlv rollback"), "")
  }

  public async handler(options: any): Promise<void> {
    const config = loadConfigFile(options.config)
    const defaultConnection = createConnection(config as any)
    const migrator = new Migrator({
      default: defaultConnection,
    }, config)
    try {
      await migrator.rollback((migration) => {
        process.stdout.write(`down ${migration.id} ... `)
      }, (migration) => {
        process.stdout.write(`\rdown ${migration.id} ... OK\n`)
      }, (_, migration) => {
        process.stdout.write(`\rdown ${migration.id} ... Fail\n`)
      })
    } catch (e) {
      console.error(e.message)
      defaultConnection.close()
      process.exit(1)
    }
    defaultConnection.close()
  }
}